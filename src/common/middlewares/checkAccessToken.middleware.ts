import { IMiddleware } from "./middleware.interface";
import { Request, Response, NextFunction } from "express";
import { sign, verify } from "jsonwebtoken";
import { UserPayload } from "../../users/service.interface";

export class CheckAccessToken implements IMiddleware {
	execute(req: Request, res: Response, next: NextFunction): void {
		const accessToken = req.cookies.accessToken;
		if (accessToken) {
			try {
				verify(accessToken, process.env.ACCESS_TOKEN_SECRET!);
				next();
			} catch (err: any) {
				if (err.message === "jwt expired") {
					console.log("expired");
					const refreshToken = req.cookies.refreshToken;
					if (refreshToken) {
						const result = this.refreshTokenHandler(refreshToken);
						if (!result) {
							res.redirect("/login");
						} else {
							res.cookie("accessToken", result);
							next();
						}
					}
				}
				next();
			}
		} else {
			const refreshToken = req.cookies.refreshToken;
			if (refreshToken) {
				const result = this.refreshTokenHandler(refreshToken);
				if (!result) {
					res.redirect("/login");
				} else {
					res.cookie("accessToken", result);
				}
			}
			next();
		}
	}

	private refreshTokenHandler(refreshToken: string): string | undefined {
		try {
			const { email, id } = verify(
				refreshToken,
				process.env.REFRESH_TOKEN_SECRET!
			) as UserPayload;
			const newAccessToken = sign(
				{
					email,
					id,
					iat: Math.floor(Date.now() / 1000),
				},
				process.env.ACCESS_TOKEN_SECRET!,
				{
					algorithm: "HS256",
					expiresIn: "10s",
				}
			);
			console.log(newAccessToken);
			return newAccessToken;
		} catch (err) {
			return undefined;
		}
	}
}
