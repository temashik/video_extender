import { Request, Response, NextFunction } from "express";

export interface IVideoController {
	uploadVideoS3(req: Request, res: Response, next: NextFunction): void;
	getVideoS3(req: Request, res: Response, next: NextFunction): void;
	deleteVideoS3(req: Request, res: Response, next: NextFunction): void;
	giveVideo(req: Request, res: Response, next: NextFunction): void;
	getVideo(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void | null>;
}
