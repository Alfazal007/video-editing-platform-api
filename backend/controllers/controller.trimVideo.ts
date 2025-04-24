import type { Response, Request } from "express";
import { tryCatch } from "../helpers/tryCatch";
import { prisma } from "../prisma";
import path from "path";
import { VideoManager } from "../videoManager/videoManager";

const trimVideoHandler = async (req: Request, res: Response) => {
    const { id } = req.params
    if (!id) {
        res.status(400).json({
            message: "Video id not provided"
        })
        return
    }

    if (!req.body) {
        res.status(400).json({
            message: "Need both start and end timestamps in request body"
        })
        return
    }
    const { startTime, endTime }: { startTime: string, endTime: string } = req.body
    if (!startTime || !endTime) {
        res.status(400).json({
            message: "Need both start and end timestamps in request body"
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

    // If video is already edited, do edits in that version and not the original version
    const pathLink = `${videoFromDbResult.data.isTrimmed ? "edited" : "original"}`
    const videoPath = path.join(__dirname, `../uploads/videos/${pathLink}/${videoFromDbResult.data.videoName}`)

    const editResult = await tryCatch(prisma.videoData.update({
        where: {
            id: videoFromDbResult.data.id
        },
        data: {
            status: "EDITING"
        }
    }))

    if (editResult.error) {
        res.status(500).json({
            message: "Issue talking to the database"
        })
        return
    }

    let trimVideoResult = await tryCatch(VideoManager.getInstance().trimVideo(videoPath, startTime, endTime))
    if (trimVideoResult.error) {
        await tryCatch(prisma.videoData.update({
            where: {
                id: videoFromDbResult.data.id
            },
            data: {
                status: "FAILED"
            }
        }))
        res.status(400).json({
            message: "Could not trim the video, recheck your provided arguments"
        })
        return
    }

    const moveResult = VideoManager.getInstance().moveTempFileToEditSection(videoFromDbResult.data.videoName)
    if (!moveResult) {
        await tryCatch(prisma.videoData.update({
            where: {
                id: videoFromDbResult.data.id
            },
            data: {
                status: "FAILED"
            }
        }))
        res.status(500).json({
            message: "Could not trim the video, issue moving the file internally"
        })
    }

    await tryCatch(prisma.videoData.update({
        where: {
            id: videoFromDbResult.data.id
        },
        data: {
            status: "UPLOADED",
            isTrimmed: true
        }
    }))
    res.status(200).json({
        message: "Trimmed successfully"
    })
}

export {
    trimVideoHandler
}
