import {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand,
	GetObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import { IS3ServiceInterface } from "./s3.service.interface";
import { injectable } from "inversify";

@injectable()
export class S3Service implements IS3ServiceInterface {
	s3Client: S3Client;
	constructor() {
		this.s3Client = new S3Client({
			region: process.env.AWS_REGION,
		});
	}
	async uploadVideo(video: any): Promise<void> {
		const params = {
			Bucket: process.env.BUCKET_NAME,
			Key: `videos/${uuidv4()}-${video.originalname}`,
			Body: video.buffer,
		};
		await this.s3Client.send(new PutObjectCommand(params));
	}

	async getVideo(videoName: string): Promise<void | null> {
		try {
			const getParams = {
				Bucket: process.env.BUCKET_NAME,
				Key: videoName,
			};

			const data = await this.s3Client.send(
				new GetObjectCommand(getParams)
			);
			const readStream = data.Body as Readable;

			// Save the file
			const writeStream = createWriteStream("src/public/videos");
			if (readStream == undefined) {
				return null;
			}
			readStream.pipe(writeStream);

			console.log("File downloaded successfully");
		} catch (err) {
			console.error("Error", err);
		}
	}

	async deleteVideo(videoName: string): Promise<void> {
		try {
			const deleteParams = {
				Bucket: process.env.BUCKET_NAME,
				Key: videoName,
			};
			const data = await this.s3Client.send(
				new DeleteObjectCommand(deleteParams)
			);
			console.log("File Deleted", data);
		} catch (err) {
			console.error("Error", err);
		}
	}
}
