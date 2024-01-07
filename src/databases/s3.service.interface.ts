export interface IS3ServiceInterface {
	uploadVideo(video: any): Promise<void>;
	getVideo(videoName: string): Promise<void | null>;
	deleteVideo(videoName: string): Promise<void>;
}
