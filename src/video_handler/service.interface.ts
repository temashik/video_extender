export interface IVideoService {
	extractFrame(video: any): any;
	generateBackground(imagePath: string): Promise<string>;
	putVideoOverImage(imagePath: string, videoPath: string): string | undefined;
}
