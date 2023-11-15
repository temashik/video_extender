import { Request, Response, NextFunction } from "express";

export interface IVideoController {
	giveVideo(req: Request, res: Response, next: NextFunction): void;
	getVideo(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void | null>;
}
