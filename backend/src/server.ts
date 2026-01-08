import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { db } from "./db"
import eventsRouter from "./routes/events"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())
app.use("/events", eventsRouter)

app.get("/", (_req, res) => {
  res.send("Event API is running")
})

app.listen(process.env.PORT || 4000, () => {
  console.log(`Server running on port ${process.env.PORT || 4000}`)
})
