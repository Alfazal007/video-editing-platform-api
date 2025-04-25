import express from "express"
import morgan from "morgan"


const app = express()

app.use(express.json())
app.use(morgan(':method :url :status :response-time ms'))

// register routes
import { videoRouter } from "./routes/routes.videoRoutes"
app.use("/api/videos", videoRouter)

export {
    app
}
