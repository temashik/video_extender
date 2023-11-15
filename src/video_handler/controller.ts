import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { BaseContorller } from "../common/base.controller";
import { TYPES } from "../types";
import { IVideoController } from "./controller.interface";
import { IVideoService } from "./service.interface";
import "reflect-metadata";
import { Readable } from "stream";

@injectable()
export class VideoController
	extends BaseContorller
	implements IVideoController
{
	constructor(
		@inject(TYPES.VideoService) private videoService: IVideoService
	) {
		super();
		this.bindRoutes([
			{
				path: "/uploadVideo",
				method: "post",
				func: this.getVideo,
			},
			{
				path: "/",
				method: "post",
				func: this.giveVideo,
			},
		]);
	}

	async getVideo(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void | null> {
		if (!req.file) {
			console.log("No file uploaded.");
		} else {
			console.log("File received:", req.file);
		}
		const imagePath = await this.videoService.extractFrame("test");
		console.log(imagePath);
		const result = await this.videoService.processingFrame(imagePath);
		if (result === null) return null;
		await this.videoService.generateBackground(result[0], result[0]);
		await this.videoService.generateBackground(result[1], result[1]);
	}
	async giveVideo(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> {
		// if (req.file === undefined) return;
		// // const readStream = Readable.from(req.file.buffer);
		// const readStream = new Readable();
		// readStream._read = () => {};
		// readStream.push(req.file.buffer);
		// readStream.push(null);

		// await this.videoService.extractFrameReadable(readStream);
		const left = await this.videoService.generateBackground(
			"src/public/images/left_vertical.png",
			"src/public/images/left_vertical.png"
		);
		let left_buffer = Buffer.from(left, "base64");
		const right = await this.videoService.generateBackground(
			"src/public/images/right_vertical.png",
			"src/public/images/right_vertical.png"
		);
		let right_buffer = Buffer.from(right, "base64");
		const finalImageBuffer =
			await this.videoService.compositeGeneratedFrames(
				left_buffer,
				right_buffer
			);
	}
}
