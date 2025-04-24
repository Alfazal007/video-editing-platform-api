import express from "express"

const app = express()

app.use(express.json())

// register routes
import { videoRouter } from "./routes/routes.videoRoutes"
app.use("/api/videos", videoRouter)

export {
    app
}
