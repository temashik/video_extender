import { Container, ContainerModule, interfaces } from "inversify";
import { App } from "./app";
import { DynamoDBService } from "./databases/dynamoDB.service";
import { IDynamoDBService } from "./databases/dynamoDB.service.interface";
import { S3Service } from "./databases/s3.service";
import { IS3ServiceInterface } from "./databases/s3.service.interface";
import { TYPES } from "./types";
import { UserController } from "./users/controller";
import { IUserController } from "./users/controller.interface";
import { UserService } from "./users/service";
import { IUserService } from "./users/service.interface";
import { VideoController } from "./video_handler/controller";
import { IVideoController } from "./video_handler/controller.interface";
import { VideoService } from "./video_handler/service";
import { IVideoService } from "./video_handler/service.interface";

export interface IBootstrapReturn {
	appContainer: Container;
	app: App;
}

export const appBindings = new ContainerModule((bind: interfaces.Bind) => {
	bind<App>(TYPES.Application).to(App);
	bind<IVideoController>(TYPES.VideoController)
		.to(VideoController)
		.inSingletonScope();
	bind<IVideoService>(TYPES.VideoService).to(VideoService).inSingletonScope();
	bind<IS3ServiceInterface>(TYPES.S3Service).to(S3Service).inSingletonScope();
	bind<IDynamoDBService>(TYPES.DynamoDBService)
		.to(DynamoDBService)
		.inSingletonScope();
	bind<IUserController>(TYPES.UserController)
		.to(UserController)
		.inSingletonScope();
	bind<IUserService>(TYPES.UserService).to(UserService).inSingletonScope();
});

async function bootstrap(): Promise<IBootstrapReturn> {
	const appContainer = new Container();
	appContainer.load(appBindings);
	const app = appContainer.get<App>(TYPES.Application);
	await app.init();
	return { app, appContainer };
}

export const boot = bootstrap();
