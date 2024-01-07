import { injectable } from "inversify";
import "dotenv/config";
import { User } from "../users/entity";
import { UserRegisterDto } from "../users/dto";
import { IDynamoDBService } from "./dynamoDB.service.interface";
import {
	DynamoDBClient,
	PutItemCommand,
	ScanCommand,
	GetItemCommand,
	UpdateItemCommand,
	DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { v4 as uuidv4 } from "uuid";

@injectable()
export class DynamoDBService implements IDynamoDBService {
	dynamoClient: DynamoDBClient;
	constructor() {
		this.dynamoClient = new DynamoDBClient({
			region: process.env.AWS_REGION,
		});
	}

	async create({
		firstName,
		lastName,
		email,
		password,
	}: UserRegisterDto): Promise<boolean> {
		const command = new PutItemCommand({
			TableName: process.env.DYNAMODB_TABLE_NAME,
			Item: marshall({
				firstName,
				lastName,
				email,
				password,
				id: uuidv4(),
			}),
		});
		const data = await this.dynamoClient.send(command);
		if (data) {
			return true;
		} else {
			return false;
		}
	}

	async isUserExist(email: string): Promise<boolean> {
		const command = new ScanCommand({
			TableName: process.env.DYNAMODB_TABLE_NAME,
			FilterExpression: "email = :email",
			ExpressionAttributeValues: { ":email": { S: email } },
		});
		const { Items } = await this.dynamoClient.send(command);
		return Items?.length != 0 ? true : false;
	}

	async find(email: string): Promise<User | null> {
		const command = new ScanCommand({
			TableName: process.env.DYNAMODB_TABLE_NAME,
			FilterExpression: "email = :email",
			ExpressionAttributeValues: { ":email": { S: email } },
		});
		const { Items } = await this.dynamoClient.send(command);
		if (!Items || Items?.length == 0) {
			return null;
		}
		const result = unmarshall(Items[0]);
		const newUser = new User(
			result.firstName,
			result.lastName,
			result.email,
			result.password,
			result.id
		);
		return newUser;
	}

	async update(
		{ firstName, lastName, email, password }: UserRegisterDto,
		id: string
	): Promise<boolean> {
		const newUser = new User(firstName, lastName, email, password, id);
		const objKeys = Object.keys(newUser);
		const command = new UpdateItemCommand({
			TableName: process.env.DYNAMODB_TABLE_NAME,
			Key: marshall({ id }),
			// Specific to DynamoDB update expression
			UpdateExpression: `SET ${objKeys
				.map((_, index) => `#key${index} = :value${index}`)
				.join(", ")}`,
			ExpressionAttributeNames: objKeys.reduce(
				(acc, key, index) => ({
					...acc,
					[`#key${index}`]: key,
				}),
				{}
			),
			ExpressionAttributeValues: marshall(
				objKeys.reduce(
					(acc, key, index) => ({
						...acc,
						[`:value${index}`]: (newUser as any)[key],
					}),
					{}
				)
			),
		});
		const updateResult = await this.dynamoClient.send(command);
		return updateResult ? true : false;
	}

	async delete(id: string): Promise<boolean> {
		const command = new DeleteItemCommand({
			TableName: process.env.DYNAMODB_TABLE_NAME,
			Key: marshall(id),
		});
		const deleteResult = await this.dynamoClient.send(command);
		return deleteResult ? true : false;
	}

	async setRefreshToken(id: string, token: string): Promise<boolean> {
		const command = new UpdateItemCommand({
			TableName: process.env.DYNAMODB_TABLE_NAME,
			Key: marshall({ id }),
			// Specific to DynamoDB update expression
			UpdateExpression: "SET refreshToken = :newRefreshToken",
			ExpressionAttributeValues: {
				":newRefreshToken": { S: token },
			},
		});
		const result = await this.dynamoClient.send(command);
		return result ? true : false;
	}
}
