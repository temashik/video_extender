import { Request, Response, NextFunction } from "express";

export interface IVideoController {
	getVideo(req: Request, res: Response, next: NextFunction): void;
	giveVideo(req: Request, res: Response, next: NextFunction): void;
}
