export interface IVideoService {
	extractFrame(): void;
	processingFrame(path: string): Promise<void>;
}
