import type { NextFunction, Request, Response } from "express";
import multer, { type FileFilterCallback } from "multer";

const storage = multer.diskStorage({
    destination: function(req, file_, cb) {
        cb(null, "./uploads/videos/original");
    },

    filename: function(req, file, cb) {
        cb(null, file.originalname);
    },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const safeMulter = (req: Request, res: Response, next: NextFunction) => {
    upload.single("video")(req, res, (err: any) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: err.message });
        } else if (err) {
            return res.status(500).json({ message: 'Upload failed.' });
        }
        next();
    });
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 100 * 1024 * 1024 }
});

export {
    safeMulter
}
