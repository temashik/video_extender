export interface IVideoService {
	uploadVideoS3(video: any): any;
	getVideoS3(videoName: string): any;
	deleteVideoS3(video: any): any;
	extractFrame(videoPath: string): Promise<string>;
	generateBackground(
		transparentImagePath: string,
		blackImagePath: string
	): Promise<string>;
	putVideoOverImage(imagePath: string, videoPath: string): string | undefined;
	processingFrame(path: string): Promise<Array<string> | null>;
	compositeGeneratedFrames(left: string, right: string): Promise<string>;
}
