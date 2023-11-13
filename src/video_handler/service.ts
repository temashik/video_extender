import { IVideoService } from "./service.interface";
import { path } from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import { injectable } from "inversify";
import sharp from "sharp";

@injectable()
export class VideoService implements IVideoService {
	extractFrame() {
		ffmpeg.setFfmpegPath(path);
		ffmpeg({ source: "src/video_handler/CrossFire.mp4" })
			.on("filenames", (filenames) => {
				console.log("created", filenames);
			})
			.on("end", () => {
				console.log("finished processing");
				this.processingFrame("src/public/images/screenshot.jpg");
			})
			.on("error", (err) => {
				console.log(err);
			})
			.takeScreenshots(
				{
					filename: "screenshot.jpg",
					timemarks: [25],
				},
				"src/public/images"
			);
	}
	putVideoOverImage(imagePath: string, videoPath: string): any {
		ffmpeg.setFfmpegPath(path);
		ffmpeg(videoPath)
			.input(imagePath)
			.complexFilter([
				{
					filter: "overlay",
					options: {
						format: "yuv420",
						x: "(main_w-overlay_w)/2",
						y: "(main_h-overlay_h)/2",
					},
				},
			])
			.saveToFile("src/public/result.mp4")
			.on("error", (err) => {
				console.log(err);
				return undefined;
			})
			.on("end", () => {
				console.log("File saved.");
				return "src/public/result.mp4";
			});
  }

	async processingFrame(path: string): Promise<void> {
		await sharp(path)
			.resize(1080, 1080, {
				fit: sharp.fit.contain,
				withoutEnlargement: true,
				background: { r: 0, g: 0, b: 0, alpha: 0 },
			})
			.png()
			.toFile("src/public/images/generated.png");
	}
}
