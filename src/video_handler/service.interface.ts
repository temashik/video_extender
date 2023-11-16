import { Readable } from "stream";

export interface IVideoService {
	extractFrame(videoPath: string): Promise<string>;
	processingFrame(path: string): Promise<any>;
	generateBackground(transparentImagePath: string): Promise<Buffer | null>;
	compositeGeneratedFrames(
		left: Buffer,
		right: Buffer,
		origin: Buffer
	): Promise<string>;
	putVideoOverImage(imagePath: string, videoPath: string): Promise<any>;
}
