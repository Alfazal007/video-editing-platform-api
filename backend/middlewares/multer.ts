import type { NextFunction, Request, Response } from "express";
import multer, { type FileFilterCallback } from "multer";

const storageVideo = multer.diskStorage({
    destination: function(req, file_, cb) {
        cb(null, "./uploads/videos/original");
    },

    filename: function(req, file, cb) {
        cb(null, file.originalname);
    },
});


const storageSubtitles = multer.diskStorage({
    destination: function(req, file_, cb) {
        cb(null, "./uploads/subtitles");
    },

    filename: function(req, file, cb) {
        cb(null, file.originalname);
    },
});

const fileFilterVideo = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const fileFilterSubtitles = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype === "application/x-subrip") {
        cb(null, true)
    } else {
        cb(null, false);
    }
};

const safeMulterVideo = (req: Request, res: Response, next: NextFunction) => {
    uploadVideo.single("video")(req, res, (err: any) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: err.message });
        } else if (err) {
            return res.status(500).json({ message: 'Upload failed.' });
        }
        next();
    });
};

const safeMulterSubtitles = (req: Request, res: Response, next: NextFunction) => {
    uploadSubtitles.single("subtitles")(req, res, (err: any) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: err.message });
        } else if (err) {
            return res.status(500).json({ message: 'Upload failed.' });
        }
        next();
    });
};

export const uploadVideo = multer({
    storage: storageVideo,
    fileFilter: fileFilterVideo,
    limits: { fileSize: 100 * 1024 * 1024 }
});

export const uploadSubtitles = multer({
    storage: storageSubtitles,
    fileFilter: fileFilterSubtitles,
});

export {
    safeMulterVideo,
    safeMulterSubtitles
}
