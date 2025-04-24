import { Router } from "express";
import { videoUploadHandler } from "../controllers/controller.uploadVideo";
import { safeMulterSubtitles, safeMulterVideo } from "../middlewares/multer";
import { trimVideoHandler } from "../controllers/controller.trimVideo";
import { addSubtitlesHandler } from "../controllers/controller.addSubtitles";
import { downloadVideoHandler } from "../controllers/controller.downloadVideo";
import { renderVideoHandler } from "../controllers/controller.renderVideo";

const videoRouter = Router()

videoRouter.route("/upload").post(safeMulterVideo, videoUploadHandler)
videoRouter.route("/:id/trim").post(trimVideoHandler)
videoRouter.route("/:id/subtitles").post(safeMulterSubtitles, addSubtitlesHandler)
videoRouter.route("/:id/download").get(downloadVideoHandler)
videoRouter.route("/:id/render").post(renderVideoHandler)

export {
    videoRouter
}

