import { Request, Response, NextFunction } from "express";

export interface IVideoController {
	uploadVideo(req: Request, res: Response, next: NextFunction): void;
	getVideo(req: Request, res: Response, next: NextFunction): void;
	giveVideo(req: Request, res: Response, next: NextFunction): void;
}
