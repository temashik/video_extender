import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { BaseContorller } from "../common/base.controller";
import { TYPES } from "../types";
import { IVideoController } from "./controller.interface";
import { IVideoService } from "./service.interface";

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
		await this.videoService.generateBackground(result[0], result[1]);
	}
	async giveVideo(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> {
		// this.videoService.putVideoOverImage(
		// 	"src/video_handler/CrossFire.mp4",
		// 	"src/video_handler/66LasVegas.jpg"
		// );
		// await this.videoService.generateBackground(
		// 	"src/public/images/left3.png",
		// 	"src/public/images/left3.png"
		// );
		// await this.videoService.compositeGeneratedFrames(
		// 	"src/public/images/left_vertical.png",
		// 	"src/public/images/right_vertical.png"
		// this.videoService.extractFrame('test');
		// this.videoService.generateBackground("1323");
		this.videoService.putVideoOverImage(
			"src/video_handler/CrossFire.mp4",
			"src/video_handler/66LasVegas.jpg"
		);
	}
}
