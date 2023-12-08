import { JwtPayload } from "jsonwebtoken";
import { UserLoginDto } from "./dto";
import { UserRegisterDto } from "./dto";
import { User } from "./entity";

export interface IUserService {
	createUser: (dto: UserRegisterDto) => Promise<boolean>;
	validateUser: (dto: UserLoginDto) => Promise<User | null>;
	signAccessToken: (email: string, id: string) => Promise<string>;
	verifyAccessToken: (token: string) => UserPayload | null;
	signRefreshToken(email: string, id: string): Promise<string>;
	generateGoogleRedirectUrl(): string;
	signGoogleUser(code: string): Promise<Tokens>;
}

export interface UserPayload {
	email: string;
	id: string;
}

export interface Tokens {
	accessToken: string;
	refreshToken: string;
}
