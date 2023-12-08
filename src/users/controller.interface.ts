import { Request, Response, NextFunction } from "express";

export interface IUserController {
	login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	homepage: (
		req: Request,
		res: Response,
		next: NextFunction
	) => Promise<void>;
	register: (
		req: Request,
		res: Response,
		next: NextFunction
	) => Promise<void>;
	googleAuth: (req: Request, res: Response, next: NextFunction) => void;
	googleCallback: (
		req: Request,
		res: Response,
		next: NextFunction
	) => Promise<void>;
	logout: (req: Request, res: Response, next: NextFunction) => void;
}
