export interface IVideoService {
	extractFrame(video: any): any;
	putVideoOverImage(imagePath: string, videoPath: string): string | undefined;
}
