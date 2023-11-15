import { Container, ContainerModule, interfaces } from "inversify";
import { App } from "./app";
import { S3Service } from "./databases/s3.service";
import { IS3ServiceInterface } from "./databases/s3.service.interface";
import { TYPES } from "./types";
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
});

async function bootstrap(): Promise<IBootstrapReturn> {
	const appContainer = new Container();
	appContainer.load(appBindings);
	const app = appContainer.get<App>(TYPES.Application);
	await app.init();
	return { app, appContainer };
}

export const boot = bootstrap();
