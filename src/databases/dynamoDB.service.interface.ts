import { UserRegisterDto } from "../users/dto";
import { User } from "../users/entity";

export interface IDynamoDBService {
	create: (dto: UserRegisterDto) => Promise<boolean>;
	isUserExist: (email: string) => Promise<boolean>;
	find: (email: string) => Promise<User | null>;
	update: (dto: UserRegisterDto, id: string) => Promise<boolean>;
	delete: (id: string) => Promise<boolean>;
	setRefreshToken(id: string, token: string): Promise<boolean>;
}
