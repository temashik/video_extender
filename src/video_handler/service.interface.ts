export interface IVideoService {
	extractFrame(videoPath: string): Promise<string>;
	processingFrame(path: string): Promise<any>;
	generateBackground(transparentImagePath: string): Promise<Buffer | null>;
	compositeGeneratedFrames(
		left: Buffer,
		right: Buffer,
		origin: Buffer
	): Promise<string>;
	resizeVideo(videoFileName: string): Promise<string>;
	overlayVideoOnBackground(
		backgroundImagePath: string,
		videoPath: string,
		videoFileName: string
	): Promise<string>;
}
