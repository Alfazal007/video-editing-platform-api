import type { Response, Request } from "express";
import { tryCatch } from "../helpers/tryCatch";
import { getVideoDuration } from "../helpers/ffmpeg/getDuration";
import { prisma } from "../prisma";

const videoUploadHandler = async (req: Request, res: Response) => {
    if (!req.file) {
        res.status(400).json({
            message: "No video file provided or invalid video file provided"
        })
        return
    }

    const videoDurationResult = await tryCatch(getVideoDuration(req.file.path))
    if (videoDurationResult.error) {
        const failedUpdateResultDB = await tryCatch(prisma.videoData.create({
            data: {
                status: "FAILED",
                videoName: req.file.filename
            }
        }))

        if (failedUpdateResultDB.error) {
            res.status(500).json({
                message: "Issue talking to the database"
            })
            return
        }
        res.status(500).json({
            message: "Issue reading the video file duration"
        })
        return
    }

    const uploadVideoDBResult = await tryCatch(prisma.videoData.create({
        data: {
            videoName: req.file.filename,
            duration: videoDurationResult.data,
            size: req.file.size,
            status: "UPLOADED"
        }
    }))
    if (uploadVideoDBResult.error) {
        res.status(500).json({
            message: "Issue talking to the database"
        })
        return
    }
    res.status(201).json({
        message: "Upload successful",
        id: uploadVideoDBResult.data.id
    })
}

export {
    videoUploadHandler
}
