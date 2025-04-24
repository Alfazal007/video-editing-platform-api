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

    async moveTempFileToEditSection(videoName: string): Promise<[boolean, number, number]> {
        const oldPath = path.join(__dirname, `../uploads/videos/temp/${videoName}`)
        const newPath = path.join(__dirname, `../uploads/videos/edited/${videoName}`)
        const videoDuration = await tryCatch(VideoManager.getInstance().getVideoDuration(oldPath))
        if (videoDuration.error) {
            return [false, 0, 0]
        }
        const videoSize = await tryCatch(fs.stat(oldPath))
        if (videoSize.error) {
            return [false, 0, 0]
        }
        let moveFileResult = await tryCatch(fs.rename(oldPath, newPath))
        if (moveFileResult.error) {
            return [false, 0, 0]
        }
        return [true, videoDuration.data, videoSize.data.size]
    }

    getVideoDuration(filePath: string): Promise<number> {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(filePath, (err, metadata) => {
                if (err) return reject(err);
                const duration = metadata.format.duration;
                resolve(duration ?? 0);
            });
        });
    }

    burnSubtitles(videoPath: string, subtitleFilePath: string): Promise<boolean> {
        const newPath = videoPath.replace("edited", "temp").replace("original", "temp")
        return new Promise((resolve, reject) => {
            ffmpeg(videoPath)
                .outputOptions([
                    `-vf subtitles='${subtitleFilePath}':force_style='Alignment=2'`,
                    '-c:v libx264',
                    '-c:a aac',
                    '-strict experimental',
                    '-b:a 192k'
                ])
                .on('end', () => {
                    console.log('Subtitles burned into video successfully!');
                    resolve(true);
                })
                .on('error', (err) => {
                    console.error(`Error: ${err.message}`);
                    reject(err);
                })
                .save(newPath);
        });
    }
}

