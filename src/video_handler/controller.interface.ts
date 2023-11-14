import { Request, Response, NextFunction } from "express";

export interface IVideoController {
	getVideo(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void | null>;
	giveVideo(req: Request, res: Response, next: NextFunction): void;
}
