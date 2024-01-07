import { Router, Response } from "express";
import { injectable } from "inversify";
import "reflect-metadata";
import { IControllerRoute } from "./router.interface";
import { Utils } from "./utils";

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
		const utils = new Utils();
		for (const route of routes) {
			const middleware = route.middlewares?.map((mw) =>
				mw.execute.bind(mw)
			);
			const handler = route.func.bind(this);
			const pipeline = [];
			if (middleware) pipeline.push(...middleware);
			if (route.readFile)
				pipeline.push(utils.multerUploadVideoFile().single("file"));
			pipeline.push(handler);
			this.router[route.method](route.path, pipeline);
		}
	}
}
