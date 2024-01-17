import express, { Express, json, urlencoded } from "express";
import { Server } from "http";
import { inject, injectable } from "inversify";
import cookieParser from "cookie-parser";
import "reflect-metadata";
import "dotenv/config";
import { TYPES } from "./types";
import { VideoController } from "./video_handler/controller";
import { UserController } from "./users/controller";
import cors from "cors";

@injectable()
export class App {
	app: Express;
	server: Server | undefined;
	port: number;

	constructor(
		@inject(TYPES.VideoController) private videoController: VideoController,
		@inject(TYPES.UserController) private userController: UserController
	) {
		this.app = express();
		this.port = +process.env.PORT!;
	}

	useMiddleware(): void {
		this.app.use(cors());
		this.app.use(json());
		this.app.use(urlencoded({ extended: false }));
		this.app.use(cookieParser());
	}

	useRoutes(): void {
		this.app.use("/", this.videoController.router);
		this.app.use("/", this.userController.router);
	}

	public async init(): Promise<void> {
		this.useMiddleware();
		this.useRoutes();
		console.log("Running on port ", this.port);
		this.server = this.app.listen(this.port);
	}
}
