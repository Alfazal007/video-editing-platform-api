import type { Request, Response } from "express"
import path from "path"
import { tryCatch } from "../helpers/tryCatch"
import { prisma } from "../prisma"
import { VideoManager } from "../videoManager/videoManager"

const addSubtitlesHandler = async (req: Request, res: Response) => {
    const { id } = req.params
    if (!id) {
        res.status(400).json({
            message: "Video id not provided"
        })
        return
    }

    if (!req.file) {
        res.status(400).json({
            message: "No subtitles file provided or invalid subtitles file provided"
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
    const pathLink = `${videoFromDbResult.data.isEdited ? "edited" : "original"}`
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

    const subtitlesFilePath = path.join(__dirname, `../uploads/subtitles/${req.file.filename}`)
    const burnSubtitlesResult = await tryCatch(VideoManager.getInstance().burnSubtitles(videoPath, subtitlesFilePath))
    if (burnSubtitlesResult.error) {
        await tryCatch(prisma.videoData.update({
            where: {
                id: videoFromDbResult.data.id
            },
            data: {
                status: "FAILED"
            }
        }))
        res.status(400).json({
            message: "Error while burning subtitles into the video"
        })
        return
    }

    const [moveResult, videoDuration, videoSize] = await VideoManager.getInstance().moveTempFileToEditSection(videoFromDbResult.data.videoName)
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
            message: "Could not add subtitles to the video, issue moving the file internally"
        })
    }
    await tryCatch(prisma.videoData.update({
        where: {
            id: videoFromDbResult.data.id,
        },
        data: {
            status: "UPLOADED",
            duration: videoDuration,
            size: videoSize,
            isEdited: true
        }
    }))
    res.status(200).json({
        message: "Subtitles added to the video"
    })
}

export {
    addSubtitlesHandler
}

