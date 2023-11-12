import { IVideoService } from "./service.interface";
import { path } from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import { injectable } from "inversify";

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
			})
			.on("error", (err) => {
				console.log(err);
			})
			.takeScreenshots(
				{
					filename: "screenshot.jpg",
					timemarks: [0],
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
}
