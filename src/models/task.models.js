import mongoose, {Schema} from "mongoose";
import { AvailableTaskStatuses,TaskStatusEnum } from "../utils/constant.js";
const taskSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description:{
        type: String
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    assignTo: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    assignBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: AvailableTaskStatuses,
        default:TaskStatusEnum.TODO
    },
    attachments: {
        type: [
            {
                url: String,
                mimetype: String,
                size: Number
            }
        ],
        default: []
    }
}, {timestamps: true})

export const Task = mongoose.model("Task", taskSchema)