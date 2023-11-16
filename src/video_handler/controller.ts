import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { BaseContorller } from "../common/base.controller";
import { TYPES } from "../types";
import { IVideoController } from "./controller.interface";
import { IVideoService } from "./service.interface";
import "reflect-metadata";

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
		console.log("qweqwe");
		console.log(req.file);
		if (!req.file) {
			res.json({ msg: "No file uploaded." });
			return;
		} else {
			console.log("File received:", req.file);
		}
		const framePath = await this.videoService.extractFrame(
			"src/public/videos/" + req.file.filename
		);
		const partsPathes = await this.videoService.processingFrame(framePath);
		if (!partsPathes) return;
		const left_generated = await this.videoService.generateBackground(
			partsPathes[0]
		);
		const right_generated = await this.videoService.generateBackground(
			partsPathes[1]
		);
		if (!left_generated || !right_generated) return;
		const generated = await this.videoService.compositeGeneratedFrames(
			left_generated,
			right_generated,
			partsPathes[2]
		);
		const resultVideo = await this.videoService.putVideoOverImage(
			generated,
			"src/public/videos/" + req.file.filename
		);
	}
	async giveVideo(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> {}
}
