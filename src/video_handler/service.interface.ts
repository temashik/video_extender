export interface IVideoService {
	uploadVideoS3(video: any): any;
	extractFrame(video: any): any;
	generateBackground(imagePath: string): Promise<string>;
	putVideoOverImage(imagePath: string, videoPath: string): string | undefined;
}
