import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { BaseContorller } from "../common/base.controller";
import { TYPES } from "../types";
import { IUploadVideoController } from "./controller.interface";

@injectable()
export class UploadVideoController
	extends BaseContorller
	implements IUploadVideoController
{
	constructor(
	) {
		super();
        this.bindRoutes(
            [
                {   
                    path: "/uploadVideo",
                    method: "post", 
                    func: this.uploadVideo,
                }
            ]);
	}
	uploadVideo(req: Request, res: Response, next: NextFunction) {
        if (!req.file) {
            console.log('No file uploaded.');
        } else {
            console.log('File received:', req.file);
        }
	}
}
