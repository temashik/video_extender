import multer from "multer";

export class Utils {
    multerUploadVideoFile() {
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, '/Users/anna-sofiiachornomorets/GitHub/video_extender/src/public/uploads') // Ensure the 'uploads' directory exists
            },
            filename: function (req, file, cb) {
                cb(null, file.originalname)
            }
        });
		
        return multer({ storage: storage });
    }
}
