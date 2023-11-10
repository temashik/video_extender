import express, { Express, json, urlencoded } from "express";
import { Server } from "http";
import { inject, injectable } from "inversify";
import "reflect-metadata";
import { TYPES } from "./types";

@injectable()
export class App {
	app: Express;
	server: Server | undefined;
	port: number;

	constructor() {
		this.app = express();
		this.port = +(process.env.PORT || 8000);
	}

	useRoutes(): void {
		// this.app.use(
		// 	"/",
		// 	this.middlewares.checkAuth,
		// 	this.testsController.router
		// );
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
