import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
const app = express();

//import routes

import healthCheckRouter from "./routes/healthcheck.routes.js"
import authenticationRouter from "./routes/auth.routes.js"

app.use(cors({

    origin: process.env.BASE_URI,
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization']
}));

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use("/api/v1/healthcheck",healthCheckRouter)
console.log("inside app");

app.use("/api/v1/auth",authenticationRouter)


export default  app