import jwt from "jsonwebtoken";
import { ApiError } from "../utils/api-error";

export const isLoggedIn = async (req, res, next) => {
    try {
        const accessToken = req.cookies?.accessToken;
        if(!accessToken){
            
            throw new ApiError(401, "access token is expired ");
        }

        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded
        next();

    } catch (error) {
        console.log("Auth middleware fail ", error);
        throw new ApiError(500, "Auth middleware fail");
    }
}