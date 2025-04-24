import type { Response, Request } from "express";
import { tryCatch } from "../helpers/tryCatch";
import { prisma } from "../prisma";
import path from "path";

const downloadVideoHandler = async (req: Request, res: Response) => {
    const { id } = req.params
    if (!id) {
        res.status(400).json({
            message: "Video id not provided"
        })
        return
    }

    const videoIdInt = parseInt(id)
    if (!videoIdInt) {
        res.status(400).json({
            message: "Video id is invalid"
        })
        return
    }

    const videoFromDbResult = await tryCatch(prisma.videoData.findFirst({
        where: {
            id: videoIdInt
        }
    }))

    if (videoFromDbResult.error) {
        res.status(500).json({
            message: "Issue talking to the database"
        })
        return
    } else if (!videoFromDbResult.data) {
        res.status(404).json({
            message: "Video not found in the database"
        })
        return
    }

    if (videoFromDbResult.data.status == "EDITING") {
        res.status(400).json({
            message: "Video is being edited right now, try again later"
        })
        return
    }

    const pathLink = `${videoFromDbResult.data.isEdited ? "edited" : "original"}`
    const videoPath = path.join(__dirname, `../uploads/videos/${pathLink}/${videoFromDbResult.data.videoName}`)
    res.status(200).download(videoPath)
}

export {
    downloadVideoHandler
}

