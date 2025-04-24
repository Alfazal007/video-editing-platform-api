import ffmpeg from "fluent-ffmpeg"
import path from "path"
import { promises as fs } from "node:fs"
import { tryCatch } from "../helpers/tryCatch";

export class VideoManager {
    private static instance: VideoManager | null = null;
    private constructor() {
    }

    static getInstance(): VideoManager {
        if (!this.instance) {
            this.instance = new VideoManager()
        }
        return this.instance
    }

    private timeToSeconds(time: string) {
        const parts = time.split(':');
        return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
    }

    trimVideo(videoPath: string, startTime: string, endTime: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const duration = this.timeToSeconds(endTime) - this.timeToSeconds(startTime);
            ffmpeg(videoPath)
                .setStartTime(startTime)
                .setDuration(duration)
                .output(videoPath.replace("original", "temp").replace("edited", "temp"))
                .on('end', () => {
                    console.log('Trimming finished successfully.');
                    resolve(true)
                })
                .on('error', (err) => {
                    console.error('Error occurred: ' + err.message);
                    reject(err);
                })
                .run();
        });
    }

    async moveTempFileToEditSection(videoName: string): Promise<boolean> {
        const oldPath = path.join(__dirname, `../uploads/videos/temp/${videoName}`)
        const newPath = path.join(__dirname, `../uploads/videos/edited/${videoName}`)
        let moveFileResult = await tryCatch(fs.rename(oldPath, newPath))
        if (moveFileResult.error) {
            return false
        }
        return true
    }
}

