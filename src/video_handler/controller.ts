import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { BaseContorller } from "../common/base.controller";
import { TYPES } from "../types";
import { IVideoController } from "./controller.interface";
import { IVideoService } from "./service.interface";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";

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
			{
				path: "/uploadVideoS3",
				method: "post",
				func: this.uploadVideoS3
			},
			{
				path: "/getVideoS3",
				method: "get",
				func: this.getVideoS3
			},
			{
				path: "/deleteVideoS3",
				method: "delete",
				func: this.deleteVideoS3
			}
		]);
	}
	uploadVideoS3(req: Request, res: Response, next: NextFunction): void {
		this.videoService.uploadVideoS3('');
	}
	getVideoS3(req: Request, res: Response, next: NextFunction): void {
		this.videoService.getVideoS3('c84fcfc2-02ba-466d-87f8-104118c9376c.mp4');
	}
	deleteVideoS3(req: Request, res: Response, next: NextFunction): void {
		this.videoService.deleteVideoS3('');
	}
	getVideo(req: Request, res: Response, next: NextFunction): void {
		if (!req.file) {
			console.log("No file uploaded.");
		} else {
			console.log("File received:", req.file);
		}
		this.videoService.extractFrame('test');
	}
	giveVideo(req: Request, res: Response, next: NextFunction): void {
		this.videoService.generateBackground("1323");
		this.videoService.putVideoOverImage(
			"src/video_handler/CrossFire.mp4",
			"src/video_handler/66LasVegas.jpg"
		);
	}
}
