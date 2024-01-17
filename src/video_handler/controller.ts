import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { BaseContorller } from "../common/base.controller";
import { TYPES } from "../types";
import { IVideoController } from "./controller.interface";
import { IVideoService } from "./service.interface";
import "reflect-metadata";
import { CheckAccessToken } from "../common/middlewares/checkAccessToken.middleware";
import { MulterMiddleware } from "../common/middlewares/multer.middleware";

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
				middlewares: [new CheckAccessToken(), new MulterMiddleware()],
				readFile: true,
			},
			{
				path: "/downloadVideo",
				method: "post",
				func: this.giveVideo,
				middlewares: [new CheckAccessToken()],
			},
		]);
	}

	async getVideo(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void | null> {
		if (!req.file) {
			res.json({ msg: "No file uploaded." });
			return;
		} else {
			console.log("file uploaded successfully" + req.file);
		}
		const framePath = await this.videoService.extractFrame(
			"src/public/videos/" + req.file.filename
		);
		const partsPathes = await this.videoService.processingFrame(framePath);
		if (!partsPathes) return;
		const left_generated = await this.videoService.generateBackground(
			partsPathes[0],
			req.body.prompt
		);
		const right_generated = await this.videoService.generateBackground(
			partsPathes[1],
			req.body.prompt
		);
		if (!left_generated || !right_generated) {
			res.json({ errMsg: "Something went wrong" });
		} else {
			res.json({
				left_generated,
				right_generated,
				landscapeOriginPath: partsPathes[2], // can't pass into next route other way
				filename: req.file.filename, // same here
			});
		}
	}
	async giveVideo(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> {
		const generated = await this.videoService.compositeGeneratedFrames(
			req.body.leftPart,
			req.body.rightPart,
			req.body.landscapeOriginPath
		);
		const resizedOriginalVideo = await this.videoService.resizeVideo(
			req.body.filename
		);
		if (!resizedOriginalVideo || !generated) return;
		const resizedVideoWithBackground =
			await this.videoService.overlayVideoOnBackground(
				generated,
				resizedOriginalVideo,
				req.body.filename
			);
		res.sendFile(resizedVideoWithBackground);
	}
}
