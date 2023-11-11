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
		]);
	}
	getVideo(req: Request, res: Response, next: NextFunction): void {
		if (!req.file) {
			console.log("No file uploaded.");
		} else {
			console.log("File received:", req.file);
		}
		this.videoService.extractFrame(1);
	}
	giveVideo(req: Request, res: Response, next: NextFunction): void {}
}
