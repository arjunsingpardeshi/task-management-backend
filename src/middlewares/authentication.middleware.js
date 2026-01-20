import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { ApiError } from "../utils/api-error";
import { User } from "../models/user.models";
import { ProjectMember } from "../models/projectmember.models";
import { asyncHandler } from "../utils/async-handler";

export const isLoggedIn = async (req, res, next) => {
    try {
        const accessToken = req.cookies?.accessToken || 
        req.header("Authorization")?.replace("Bearer ", "");                         //take token from header if it is mobile app

        if(!accessToken){
            
            throw new ApiError(401, "access token is expired ");
        }

        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded._id)
        .select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry")
        if(!user){
            throw new ApiError(401, "Invalid access token");  
        }
        req.user = user
        next();

    } catch (error) {
        console.log("Auth middleware fail ", error);
        throw new ApiError(500, error?.message || "Auth middleware fail");
    }
}

export const validateProjectPermission = (roles = []) => asyncHandler(async (req, res, next) => {

    const {projectId} = req.body;

    if(!projectId){
        throw new ApiError(401, "Invalid project id")
    }

    const project = await ProjectMember.findOne({
        project: mongoose.Types.ObjectId(projectId),
        user: mongoose.Types.ObjectId(req.user._id)
    });

    if(!project){
        throw new ApiError(401, "project not found")
    }

    const givenRole = project?.role;    
    req.user.role = givenRole;

    if(!roles.includes(givenRole)){
        throw new ApiError(403, "you do not have permission to perform this action")
    }

    next()
})