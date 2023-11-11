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
					timemarks: [25],
				},
				"images"
			)
			.takeFrames(1);
	}
}
