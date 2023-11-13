import { IVideoService } from "./service.interface";
import { path } from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import { injectable } from "inversify";
import "dotenv/config";
import OpenAI from "openai";
import fs from "fs";

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

	async generateBackground(imagePath: string): Promise<string> {
		const openai = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
		});
		const image = await openai.images.edit({
			image: fs.createReadStream("src/public/images/white.png"),
			mask: fs.createReadStream("src/public/images/transparent.png"),
			prompt: "Game HUD of the shooter. No black stripes on top. Fill it",
		});

		console.log(image);
		return "succeed";
	}
}
