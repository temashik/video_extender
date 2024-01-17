import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { IMiddleware } from "./middleware.interface";
import { v4 as uuidv4 } from "uuid";

export class MulterMiddleware implements IMiddleware {
	execute(req: Request, res: Response, next: NextFunction): void {
		const storage = multer.diskStorage({
			destination: (req, file, cb) => {
				cb(null, "src/public/videos");
			},
			filename: (req, file, cb) => {
				const uuidGeneratedName = `${uuidv4()}-${file.originalname}`;
				file.filename = uuidGeneratedName;
				cb(null, uuidGeneratedName);
			},
		});
		const result = multer({
			storage,
			fileFilter: (req, file, cb) => {
				if (file.mimetype.split("/")[0] === "video") {
					cb(null, true);
				} else {
					cb(null, false);
				}
			},
			limits: { fileSize: 40000000, files: 1 },
		});
		result.single("file");
		next();
	}

	private multerUploadVideoFile() {
		const storage = multer.diskStorage({
			destination: (req, file, cb) => {
				cb(null, "src/public/videos");
			},
			filename: (req, file, cb) => {
				const uuidGeneratedName = `${uuidv4()}-${file.originalname}`;
				file.filename = uuidGeneratedName;
				cb(null, uuidGeneratedName);
			},
		});
		return multer({
			storage,
			fileFilter: (req, file, cb) => {
				if (file.mimetype.split("/")[0] === "video") {
					cb(null, true);
				} else {
					cb(null, false);
				}
			},
			limits: { fileSize: 40000000, files: 1 },
		});
	}
}