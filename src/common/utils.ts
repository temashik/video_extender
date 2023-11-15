import multer from "multer";

export class Utils {
	multerUploadVideoFile() {
		const storage = multer.memoryStorage();

		return multer({
			storage,
			fileFilter: (req, file, cb) => {
				if (file.mimetype.split("/")[0] === "video") {
					cb(null, true);
				} else {
					cb(null, false);
				}
			},
			limits: { fileSize: 20000000, files: 1 },
		});
	}
}
