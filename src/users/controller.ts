import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import "reflect-metadata";
import { BaseContorller } from "../common/base.controller";
import { TYPES } from "../types";
import { IUserController } from "./controller.interface";
import { UserLoginDto, UserRegisterDto } from "./dto";
import { IUserService } from "./service.interface";
import "dotenv/config";
import { CheckAccessToken } from "../common/middlewares/checkAccessToken.middleware";

@injectable()
export class UserController extends BaseContorller implements IUserController {
	constructor(@inject(TYPES.UserService) private userService: IUserService) {
		super();
		this.bindRoutes([
			{ path: "/login", method: "post", func: this.login },
			{
				path: "/",
				method: "get",
				func: this.homepage,
				middlewares: [new CheckAccessToken()],
			},
			{ path: "/register", method: "post", func: this.register },
			{ path: "/gauth", method: "get", func: this.googleAuth },
			{ path: "/gcallback", method: "get", func: this.googleCallback },
			{ path: "/logout", method: "post", func: this.logout },
		]);
	}

	public async login(
		req: Request<{}, {}, UserLoginDto>,
		res: Response
	): Promise<void> {
		if (!req.body.email || !req.body.password) {
			res.json({
				errorMessage: "You must fill all fields",
			});
			return;
		}
		const result = await this.userService.validateUser(req.body);
		if (!result) {
			res.json({
				errorMessage: "Your email or password is invalid",
			});
		} else if (result.id) {
			const accessToken = await this.userService.signAccessToken(
				req.body.email,
				result.id
			);
			const refreshToken = await this.userService.signRefreshToken(
				req.body.email,
				result.id
			);
			res.cookie("refreshToken", refreshToken);
			res.cookie("accessToken", accessToken);
			res.json({ accessToken });
		}
	}

	async homepage(
		req: Request<{}, {}, UserLoginDto>,
		res: Response
	): Promise<void> {
		if (!req.cookies.accessToken) {
		} else {
			res.json({ msg: "succsess" });
		}
	}

	async register(
		req: Request<{}, {}, UserRegisterDto>,
		res: Response
	): Promise<void> {
		if (
			!req.body.firstName ||
			!req.body.lastName ||
			!req.body.email ||
			!req.body.password
		) {
			res.json({
				errorMessage: "You must fill all fields",
			});
			return;
		}
		const result = await this.userService.createUser(req.body);
		if (!result) {
			console.log("no result");
			res.json({
				errorMessage: "This email already registered",
			});
			return;
		} else {
			res.json({
				msg: "You successfully registered",
			});
		}
	}

	googleAuth(req: Request, res: Response): void {
		const authUrl = this.userService.generateGoogleRedirectUrl();
		res.redirect(authUrl);
	}

	async googleCallback(req: Request, res: Response): Promise<void> {
		const code = req.query.code;
		const successLogin = await this.userService.signGoogleUser(
			code as string
		);
		res.cookie("refreshToken", successLogin.refreshToken, {
			httpOnly: true,
		});
		res.cookie("accessToken", successLogin.accessToken, {
			secure: true,
		});
		res.json({ msg: "success" });
	}

	logout(req: Request, res: Response): void {
		res.clearCookie("accessToken");
		res.clearCookie("refreshToken");
		res.end();
	}
}
