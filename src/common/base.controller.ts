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
			const middleware = route.middlewares?.map((mw) =>
				mw.execute.bind(mw)
			);
			const handler = route.func.bind(this);
			const pipeline = middleware ? [...middleware, handler] : handler;
			this.router[route.method](route.path, pipeline);
		}
	}
}
