//external library import
import dotenv from "dotenv"
import cors from "cors"

//project internal file import
import app from "./app.js"
import connectDB from "./db/index.js";

dotenv.config({
    path: "./.env"
});

const PORT = process.env.PORT || 4000;

connectDB()
    .then(() => {
        app.listen(PORT,() => console.log(`server is running on port: ${PORT}`));
    })
    .catch((err) => {
        console.error("MongoDB connection error", err);
        process.exit(1)
    });
