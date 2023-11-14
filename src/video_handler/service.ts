import { IVideoService } from "./service.interface";
import { path } from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import { injectable } from "inversify";
import "dotenv/config";
import OpenAI from "openai";
import fs from "fs";
import sharp from "sharp";
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

@injectable()
export class VideoService implements IVideoService {
	uploadVideoS3() {
		// Configure AWS
		const s3 = new AWS.S3({
			accessKeyId: process.env.AWS_ACCESS_KEY_ID,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
			region: process.env.AWS_REGION // e.g., 'us-west-2'
		});

		const fileName = uuidv4();
		
		// Function to upload file
		const uploadFileToS3 = (bucketName: string, filePath: string): void => {
			const fileContent = fs.readFileSync(filePath);

			const params: AWS.S3.PutObjectRequest = {
				Bucket: bucketName,
				Key: fileName,
				Body: fileContent,
				ContentType: 'video/mp4'
			};
		
			s3.upload(params, (err: Error, data: AWS.S3.ManagedUpload.SendData) => {
				if (err) {
					console.error('Error', err);
				} else {
					console.log(`File uploaded successfully. ${data.Location}`);
				}
			});
		};
		
		const myBucket: string = process.env.BUCKET_NAME || '';
		const myFile: string = 'src/public/uploads/Cross_Fire.360.mp4';
		
		uploadFileToS3(myBucket, myFile);
		return fileName;
	}

	extractFrame(videoPath: string) {
		ffmpeg.setFfmpegPath(path);
		ffmpeg({ source: "src/video_handler/CrossFire.mp4" })
			.on("filenames", (filenames) => {
				console.log("created", filenames);
			})
			.on("end", () => {
				console.log("finished processing");
				this.processingFrame("src/public/images/screenshot.jpg");
			})
			.on("error", (err) => {
				console.log(err);
			})
			.takeScreenshots(
				{
					filename: "screenshot.jpg",
					timemarks: [25],
				},
				"src/public/images"
			);
	}

	async generateBackground(imagePath: string): Promise<string> {
		const openai = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
		});
		const image = await openai.images.edit({
			image: fs.createReadStream("src/public/images/white.png"),
			mask: fs.createReadStream("src/public/images/transparent.png"),
			prompt: "Game HUD of the shooter. No black stripes on top. Fill it",
		});

		console.log(image);
		return "succeed";
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

	async processingFrame(path: string): Promise<void> {
		await sharp(path)
			.resize(1080, 1080, {
				fit: sharp.fit.contain,
				withoutEnlargement: true,
				background: { r: 0, g: 0, b: 0, alpha: 0 },
			})
			.png()
			.toFile("src/public/images/generated.png");
	}
}
