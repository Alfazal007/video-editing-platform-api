import { Router } from "express";
import { videoUploadHandler } from "../controllers/controller.uploadVideo";
import { safeMulter, upload } from "../middlewares/multer";

const videoRouter = Router()

videoRouter.route("/upload").post(safeMulter, videoUploadHandler)

export {
    videoRouter
}
