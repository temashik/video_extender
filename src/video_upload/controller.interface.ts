import { Request, Response, NextFunction } from "express";

export interface IUploadVideoController {
	uploadVideo(req: Request, res: Response, next: NextFunction): void;
}
