import { IVideoService } from "./service.interface";
import { path } from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import { injectable, inject } from "inversify";
import "dotenv/config";
import OpenAI from "openai";
import fs from "fs";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import "reflect-metadata";
import { TYPES } from "../types";
import { IS3ServiceInterface } from "../databases/s3.service.interface";
import { Readable } from "stream";

@injectable()
export class VideoService implements IVideoService {
	constructor(
		@inject(TYPES.S3Service) private s3Service: IS3ServiceInterface
	) {}
	extractFrame(videoPath: string): Promise<string> {
		return new Promise((resolve, reject) => {
			const filename = uuidv4();
			ffmpeg.setFfmpegPath(path);
			ffmpeg({ source: "src/public/videos/vertical.mp4" })
				.on("filenames", (filenames) => {
					console.log("created", filenames);
				})
				.on("end", () => {
					console.log("finished processing");
					resolve("src/public/images/" + filename + ".png");
				})
				.on("error", (err) => {
					console.log(err);
					return reject(new Error(err));
				})
				.takeScreenshots(
					{
						filename,
						timemarks: [0],
					},
					"src/public/images"
				);
		});
	}
	extractFrameReadable(video: any): Promise<string> {
		return new Promise((resolve, reject) => {
			const filename = uuidv4();
			ffmpeg.setFfmpegPath(path);
			ffmpeg({ source: video })
				.inputFormat("mp4")
				.on("filenames", (filenames) => {
					console.log("created", filenames);
				})
				.on("end", () => {
					console.log("finished processing");
					resolve("src/public/images/" + filename + ".png");
				})
				.on("error", (err) => {
					console.log(err);
					return reject(new Error(err));
				})
				.takeScreenshots(
					{
						filename,
						timemarks: [0],
					},
					"src/public/images"
				);
		});
	}

	async generateBackground(
		transparentImagePath: string,
		blackImagePath: string
	): Promise<string> {
		const openai = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
		});
		const image = await openai.images.edit({
			image: fs.createReadStream(blackImagePath),
			mask: fs.createReadStream(transparentImagePath),
			prompt: "Complete image",
			response_format: "b64_json",
		});
		if (image.data[0].b64_json == undefined) return "null";
		return image.data[0].b64_json;
	}

	putVideoOverImage(imagePath: string, videoPath: string): any {
		ffmpeg.setFfmpegPath(path);
		ffmpeg(videoPath)
			.input(imagePath)
			.complexFilter([
				{
					filter: "overlay",
					options: {
						format: "yuv420",
						x: "(main_w-overlay_w)/2",
						y: "(main_h-overlay_h)/2",
					},
				},
			])
			.saveToFile("src/public/result.mp4")
			.on("error", (err) => {
				console.log(err);
				return undefined;
			})
			.on("end", () => {
				console.log("File saved.");
				return "src/public/result.mp4";
			});
	}

	async processingFrame(path: string): Promise<Array<string> | null> {
		const regexp = /\/([^\/]+)$/;
		const filename = regexp.exec(path);
		if (filename === null) return null;
		const result = [];
		await sharp(path)
			.resize(1792, 1024, {
				fit: sharp.fit.contain,
				withoutEnlargement: true,
				background: { r: 0, g: 0, b: 0, alpha: 0 },
			})
			.png()
			.toFile("src/public/images/landscape_" + filename[1]);
		await sharp("src/public/images/landscape_" + filename[1])
			.extract({ left: 0, top: 0, width: 1024, height: 1024 })
			.png()
			.toBuffer();
		// 	.toFile("src/public/images/left_" + filename[1]);
		// result.push("src/public/images/left_" + filename[1]);
		await sharp("src/public/images/landscape_" + filename[1])
			.extract({ left: 768, top: 0, width: 1024, height: 1024 })
			.png()
			.toBuffer();
		// 	.toFile("src/public/images/right_" + filename[1]);
		// result.push("src/public/images/right_" + filename[1]);
		// return result;
		return null;
	}

	async compositeGeneratedFrames(
		left: Buffer,
		right: Buffer
	): Promise<string> {
		await sharp("src/public/images/landscape_vertical.png")
			.composite([
				{ input: left, gravity: "northwest" },
				{ input: right, gravity: "southeast" },
			])
			.toBuffer();
		// .toFile("src/public/images/combined.png");
		return "src/public/images/combined.png";
	}
}
