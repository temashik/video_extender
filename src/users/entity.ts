import { hash, compare } from "bcryptjs";

export class User {
	private _password: string | undefined;
	constructor(
		private readonly _firstName: string,
		private readonly _lastName: string,
		private readonly _email: string,
		passwordHash?: string,
		private readonly _id?: string | undefined
	) {
		if (passwordHash) {
			this._password = passwordHash;
		}
	}

	get email(): string {
		return this._email;
	}

	get firstName(): string {
		return this._firstName;
	}

	get lastName(): string {
		return this._lastName;
	}

	get fullName(): string {
		return this._firstName + this._lastName;
	}

	get password(): string {
		if (this._password) return this._password;
		else return "no password"; // must never work, only to disable errors
	}

	get id(): string | undefined {
		return this._id;
	}

	public async setPassword(pass: string, salt: number): Promise<void> {
		this._password = await hash(pass, salt);
	}

	public async comparePassword(pass: string): Promise<boolean> {
		if (this._password) return compare(pass, this._password);
		else return false; // must never work, only to disable errors
	}
}
