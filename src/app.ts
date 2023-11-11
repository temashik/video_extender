import express, { Express, json, urlencoded } from "express";
import { Server } from "http";
import { inject, injectable } from "inversify";
import "reflect-metadata";
import { TYPES } from "./types";
import { VideoController } from "./video_handler/controller";

@injectable()
export class App {
	app: Express;
	server: Server | undefined;
	port: number;

	constructor(
		@inject(TYPES.VideoController) private videoController: VideoController
	) {
		this.app = express();
		this.port = +(process.env.PORT || 8000);
	}

	useRoutes(): void {
		this.app.use("/", this.videoController.router);
	}

	useMiddleware(): void {
		this.app.use(json());
		this.app.use(urlencoded({ extended: false }));
	}

	public async init(): Promise<void> {
		this.useMiddleware();
		this.useRoutes();
		console.log("Running on port ", this.port);
		this.server = this.app.listen(this.port);
	}
}
