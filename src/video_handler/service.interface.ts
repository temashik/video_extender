import { Readable } from "stream";

export interface IVideoService {
	extractFrame(videoPath: string): Promise<string>;
	extractFrameReadable(video: any): Promise<string>;
	generateBackground(
		transparentImagePath: string,
		blackImagePath: string
	): Promise<string>;
	putVideoOverImage(imagePath: string, videoPath: string): string | undefined;
	processingFrame(path: string): Promise<Array<string> | null>;
	compositeGeneratedFrames(left: any, right: any): Promise<string>;
}
