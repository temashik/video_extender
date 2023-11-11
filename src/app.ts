import express, { Express, json, urlencoded } from "express";
import { Server } from "http";
import { inject, injectable } from "inversify";
import "reflect-metadata";
import { TYPES } from "./types";
import { UploadVideoController } from "./video_upload/controller";
import { Utils } from "./common/utils";

@injectable()
export class App {
	app: Express;
	server: Server | undefined;
	port: number;

	constructor(
		@inject(TYPES.UploadVideoController) private uploadVideoController: UploadVideoController,
	) {
		this.app = express();
		this.port = +(process.env.PORT || 8000);
	}

	useRoutes(): void {
		const utils = new Utils();
		this.app.use("/", utils.multerUploadVideoFile().single('file'), this.uploadVideoController.router);
	}

	useMiddleware(): void {
		this.app.use(json());
		this.app.use(urlencoded({ extended: false }));
		this.app.use(express.static('./public'));
	}

	public async init(): Promise<void> {
		this.useMiddleware();
		this.useRoutes();
		console.log("Running on port ", this.port);
		this.server = this.app.listen(this.port);
	}
}
