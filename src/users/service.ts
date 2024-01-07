import { inject, injectable } from "inversify";
import "reflect-metadata";
import { IUserService, Tokens, UserPayload } from "./service.interface";
import "dotenv/config";
import { User } from "./entity";
import { UserLoginDto, UserRegisterDto } from "./dto";
import { JwtPayload, sign, verify } from "jsonwebtoken";
import { TYPES } from "../types";
import { IDynamoDBService } from "../databases/dynamoDB.service.interface";
import { google } from "googleapis";

@injectable()
export class UserService implements IUserService {
	constructor(
		@inject(TYPES.DynamoDBService) private dynamoDBService: IDynamoDBService
	) {}

	async createUser({
		firstName,
		lastName,
		email,
		password,
	}: UserRegisterDto): Promise<boolean> {
		const newUser = new User(firstName, lastName, email);
		const salt = Number(process.env.SALT);
		await newUser.setPassword(password, salt);
		const res = await this.dynamoDBService.isUserExist(newUser.email);
		if (res) {
			return false;
		} else {
			await this.dynamoDBService.create(newUser);
			console.log("Account added");
			return true;
		}
	}

	async validateUser({
		email,
		password,
	}: UserLoginDto): Promise<User | null> {
		const user = await this.dynamoDBService.find(email);
		if (!user) {
			return null;
		}
		if (await user.comparePassword(password)) {
			return user;
		} else {
			return null;
		}
	}

	async signAccessToken(email: string, id: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			sign(
				{
					email,
					id,
					iat: Math.floor(Date.now() / 1000),
				},
				process.env.ACCESS_TOKEN_SECRET!,
				{
					algorithm: "HS256",
					expiresIn: "10m",
				},
				(err, token) => {
					if (err) reject(err);
					else if (token) resolve(token);
				}
			);
		});
	}

	verifyAccessToken(token: string): UserPayload | null {
		try {
			const { email, id } = verify(
				token,
				process.env.ACCESS_TOKEN_SECRET!
			) as UserPayload;
			return { email, id };
		} catch (err) {
			return null;
		}
	}

	async signRefreshToken(email: string, id: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			sign(
				{
					email,
					id,
					iat: Math.floor(Date.now() / 1000),
				},
				process.env.REFRESH_TOKEN_SECRET!,
				{
					algorithm: "HS256",
					expiresIn: "7d",
				},
				(err, token) => {
					if (err) reject(err);
					else if (token) {
						resolve(token);
					}
				}
			);
		});
	}
	generateGoogleRedirectUrl(): string {
		const oauth2Client = new google.auth.OAuth2(
			process.env.GOOGLE_CLIENT_ID,
			process.env.GOOGLE_CLIENT_SECRET,
			process.env.GOOGLE_REDIRECT_URI
		);
		return oauth2Client.generateAuthUrl({
			access_type: "offline",
			prompt: "consent",
			scope: [
				"https://www.googleapis.com/auth/userinfo.email",
				"https://www.googleapis.com/auth/userinfo.profile",
			],
		});
	}

	async signGoogleUser(code: string): Promise<Tokens> {
		const oauth2Client = new google.auth.OAuth2(
			process.env.GOOGLE_CLIENT_ID,
			process.env.GOOGLE_CLIENT_SECRET,
			process.env.GOOGLE_REDIRECT_URI
		);
		const { tokens } = await oauth2Client.getToken(code);
		oauth2Client.setCredentials(tokens);
		const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
		const userInfo = await oauth2.userinfo.v2.me.get();
		const data = {
			firstName: userInfo.data.given_name as string,
			lastName: userInfo.data.family_name as string,
			email: userInfo.data.email as string,
			// oauth2Id: userInfo.data.id as string,
			password: userInfo.data.id as string,
		};
		const existedUser = await this.dynamoDBService.find(data.email);
		if (existedUser) {
			const accessToken = await this.signAccessToken(
				existedUser.email,
				existedUser.id!
			);
			const refreshToken = await this.signRefreshToken(
				existedUser.email,
				existedUser.id!
			);
			return { accessToken, refreshToken };
		} else {
			await this.dynamoDBService.create(data);
			const user = await this.dynamoDBService.find(data.email);
			const accessToken = await this.signAccessToken(
				user!.email,
				user!.id!
			);
			const refreshToken = await this.signRefreshToken(
				user!.email,
				user!.id!
			);
			return { accessToken, refreshToken };
		}
	}
}
