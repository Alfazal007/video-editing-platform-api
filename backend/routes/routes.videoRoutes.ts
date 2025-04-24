import { Router } from "express";
import { videoUploadHandler } from "../controllers/controller.uploadVideo";
import { safeMulter } from "../middlewares/multer";
import { trimVideoHandler } from "../controllers/controller.trimVideo";

const videoRouter = Router()

videoRouter.route("/upload").post(safeMulter, videoUploadHandler)
videoRouter.route("/:id/trim").post(trimVideoHandler)

export {
    videoRouter
}
