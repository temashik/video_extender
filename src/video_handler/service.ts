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

@injectable()
export class VideoService implements IVideoService {
	extractFrame(videoPath: string): Promise<string> {
		return new Promise((resolve, reject) => {
			const filename = uuidv4();
			ffmpeg.setFfmpegPath(path);
			ffmpeg({ source: videoPath })
				.on("filenames", (filenames) => {
					console.log("created", filenames);
				})
				.on("end", () => {
					console.log("finished processing");
					resolve("src/public/images/" + filename + ".png");
				})
				.on("error", (err) => {
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

	async processingFrame(path: string): Promise<any> {
		const regexp = /\/([^\/]+)$/;
		const filename = regexp.exec(path);
		if (filename === null) return null;
		const result = [];
		const landscape = await sharp(path)
			.resize(1792, 1024, {
				fit: sharp.fit.contain,
				withoutEnlargement: true,
				background: { r: 0, g: 0, b: 0, alpha: 0 },
			})
			.png()
			.toBuffer();
		await sharp(landscape)
			.extract({ left: 0, top: 0, width: 1024, height: 1024 })
			.png()
			.toFile("src/public/images/left_" + filename[1]);
		result.push("src/public/images/left_" + filename[1]);
		await sharp(landscape)
			.extract({ left: 768, top: 0, width: 1024, height: 1024 })
			.png()
			.toFile("src/public/images/right_" + filename[1]);
		result.push("src/public/images/right_" + filename[1]);
		result.push(landscape);
		return result;
	}

	async generateBackground(
		imagePath: string,
		prompt: string
	): Promise<Buffer[] | null> {
		const openai = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
		});
		const image = await openai.images.edit({
			image: fs.createReadStream(imagePath),
			prompt,
			n: 4,
			response_format: "b64_json",
		});
		if (image.data[0].b64_json == undefined) return null;
		const result = image.data.map((item) =>
			Buffer.from(item.b64_json!, "base64")
		);
		return result;
	}

	async compositeGeneratedFrames(
		left: Buffer,
		right: Buffer,
		origin: Buffer
	): Promise<string> {
		const generatedFileInPath =
			"src/public/images/generated_" + uuidv4() + ".png";
		await sharp(origin)
			.composite([
				{ input: left, gravity: "northwest" },
				{ input: right, gravity: "southeast" },
			])
			.toFile(generatedFileInPath);
		return generatedFileInPath;
	}

	// Function to resize the video
	async resizeVideo(videoFileName: string): Promise<string> {
		return new Promise((resolve, reject) => {
			const inputVideoPath = "src/public/videos/" + videoFileName;
			const outputVideoPath =
				"src/public/videos/resized_" + videoFileName;
			ffmpeg.setFfmpegPath(path);
			ffmpeg(inputVideoPath)
				.size("?x1024")
				.output(outputVideoPath)
				.on("error", (err) => {
					return reject(new Error(err));
				})
				.on("end", () => {
					console.log("Video resized successfully");
					resolve(outputVideoPath);
				})
				.run();
		});
	}

	// Function to overlay the resized video on the background image
	async overlayVideoOnBackground(
		backgroundImagePath: string,
		videoPath: string,
		videoFileName: string
	): Promise<string> {
		return new Promise((resolve, reject) => {
			const outputVideoPath = "src/public/videos/result_" + videoFileName;
			ffmpeg.setFfmpegPath(path);
			ffmpeg()
				.input(backgroundImagePath)
				.input(videoPath)
				.complexFilter([
					// Overlay the video on the background image
					// The video will be centered on the background image
					{
						filter: "overlay",
						options: { x: "(W-w)/2", y: "(H-h)/2" },
					},
				])
				.output(outputVideoPath)
				.on("error", (err) => {
					return reject(new Error(err));
				})
				.on("end", () => {
					console.log("Overlay process completed");
					resolve(outputVideoPath);
				})
				.run();
		});
	}
}
