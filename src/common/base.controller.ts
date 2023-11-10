import { Router, Response } from "express";
import { injectable } from "inversify";
import "reflect-metadata";
import { IControllerRoute } from "./router.interface";

@injectable()
export abstract class BaseContorller {
	private readonly _router: Router;

	constructor() {
		this._router = Router();
	}

	get router(): Router {
		return this._router;
	}

	protected bindRoutes(routes: IControllerRoute[]): void {
		for (const route of routes) {
			const handler = route.func.bind(this);
			this.router[route.method](route.path, handler);
		}
	}
}
