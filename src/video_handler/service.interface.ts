export interface IVideoService {
	extractFrame(video: any): any;
	generateBackground(imagePath: string): Promise<string>;
}
