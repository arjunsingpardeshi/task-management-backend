import mongoose from "mongoose";
import { Task } from "../models/task.models";
import { Project } from "../models/project.models";
import {User} from "../models/user.models"
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import { SubTask } from "../models/subtask.models";

// get all tasks
const getTasks = asyncHandler ( async (req, res) => {
  // get all tasks

  const {projectId} = req.params
  
  if(!mongoose.Types.ObjectId.isValid(projectId)){
    throw new ApiError(400, "invalid project id")
  }

  const project = await Project.findById(projectId)

  if(!project){
    throw new ApiError(404, "project not found")
  }
  const allTask = await Task.find({project: projectId}).populate([
    {path: "assignTo", select: "username fullname email avatar"},
    {path: "assignBy", select: "username fullname email avatar"},
    {path: "project", select: "name description"}
  ])

  if(allTask.length === 0){
    throw new ApiError(404, "No task found")
  }

  return res.status(200).json(new ApiResponse(200, allTask, "All tasks fetch successfully"))
});

// get task by id
const getTaskById = asyncHandler (async (req, res) => {
  // get task by id

  const {taskId} = req.params;

  if(!mongoose.Types.ObjectId.isValid(taskId)){
    throw new ApiError(400, "invalid task id")
  }

  const task = await Task.findById(taskId)
              .populate("assignTo", "username fullname email avatar")
              .populate("assignBy", "username fullname email avatar")
              .populate("project", "name description")

  
  

  if(!task){
    throw new ApiError(404, "no task found")
  }
  return res.status(200).json(new ApiResponse(200, task, "task fetch successfully"))

});

// create task
const createTask = asyncHandler ( async (req, res) => {
  // create task

  const {projectId} = req.params;
  const {title, description, assignToId, assignById} = req.body;

  if(!title || !description){

    throw new ApiError(400, "title and description are required")
  }
  if(!mongoose.Types.ObjectId.isValid(assignToId) || 
     !mongoose.Types.ObjectId.isValid(assignById) || 
     !mongoose.Types.ObjectId.isValid(projectId)){

          throw new ApiError(400, "invalid assign user id or project id")
  }

  const existingProject = await Project.findById(projectId)
  if(!existingProject){
    throw new ApiError(404, "Project not found")
  }

  const [existingAssignTo, existingAssignBy] = await Promise.all([
    User.findById(assignToId),
    User.findById(assignById)
  ])

  if(!existingAssignBy || !existingAssignTo){
    throw new ApiError(404, "assign user not found")
  }

  const task = await Task.create({
    title,
    description,
    project: projectId,
    assignBy: assignById,
    assignTo: assignToId,
  })

  const newTask = await Task.findById(task._id)
  .populate([
    {path: "assignTo", select: "username fullname email avatar"},
    {path: "assignBy", select: "username fullname email avatar"},
    {path: "project", select: "name description"},
  ]);

  return res.status(201).json(new ApiResponse(201, newTask, "task created successfully"))
});

// update task
const updateTask =  asyncHandler ( async (req, res) => {
  // update task
  //extract id and requested data
  const {taskId} = req.params;
  const data = req.body

  //validat task id format
  if(!mongoose.Types.ObjectId.isValid(taskId)){
    throw new ApiError(400, "invalid task id")
  }

  //allow only certain field to update
  const allowFields = ["title", "description", "status", "assignTo"]
  const updateField = {}

  for(const key of Object.keys(data)){
   if(allowFields.includes(key)){
    updateField[key] = data[key]
   }
  }

  if(Object.keys(updateField).length === 0){
    throw new ApiError(400, "no field is provided for update")
  }

  const existingTask = await Task.findById(taskId)

  if(!existingTask){
    throw new ApiError(404, "No task is found")
  }
  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    updateField,
    {new: true}
  ).populate("assignTo", "username fullname email avatar")
   .populate("assignBy", "username fullname email avatar")
   .populate("project", "name description")

  return res.status(200).json(new ApiResponse(200, updatedTask, "task fetch successfully"))
});

// delete task
const deleteTask = asyncHandler ( async (req, res) => {
  // delete task

  const {taskId} = req.params;

  if(!mongoose.Types.ObjectId.isValid(taskId)){
    throw new ApiError(400, "invalid task id")
  }

  const existingTask = await Task.findById(taskId);
  if(!existingTask){
    throw new ApiError(404, "task is not found")
  }

  const deletedTask = await Task.findByIdAndDelete(taskId)
                
  return res.status(200).json(new ApiResponse(200, deletedTask, " task deleted successfully"))

});

// create subtask
const createSubTask = asyncHandler ( async (req, res) => {
  // create subtask
  const {taskId} = req.params;
  const {title} = req.body;
  if(!title || !mongoose.Types.ObjectId.isValid(taskId)){
      throw new ApiError(400, "invalid task id or title")
  }
   const task = await Task.findById(taskId)

   if(!task){
    throw new ApiError(404, "task not found")
   }

   const existSubTask = await SubTask.findOne({title, task: mongoose.Types.ObjectId(taskId)})

   if(existSubTask){
    throw new ApiError(409, "this subtask with the title is alredy exist")
   }
   const subtask = await SubTask.create({
    title,
    task: mongoose.Types.ObjectId(taskId),
    createdBy: req.user._id
   });

   const newSubTask = await SubTask.findById(subtask._id)
                      .populate("task", "title status")
                      .populate("createdBy", "username fullname email avatar");
   return res.status(200).json(new ApiResponse(200, newSubTask, "sub task created successfully"))
});

// update subtask
const updateSubTask =  asyncHandler ( async (req, res) => {
  // update subtask

  const {subTaskId} = req.params;
  const {title, isCompleted} = req.body
  if(!mongoose.Types.ObjectId.isValid(subTaskId)){
    throw new ApiError(400, "invalid subtask id")
  }

  const existingSubTask = await SubTask.findById(subTaskId);
  if(!existingSubTask){
    throw new ApiError(404, "subtask does not exist");
  }

  const updatedSubTask = await SubTask.findByIdAndUpdate(
    subTaskId,
    {title, isCompleted},
    {new: true}
  ).populate([
    {path: "task", select: "title description"},
    {path: "createdBy", select: "username fullname email avatar"}
  ])

  return res.status(200).json(new ApiResponse(200, updatedSubTask, "sub task updated successfully"))
  
});

// delete subtask
const deleteSubTask = asyncHandler ( async (req, res) => {
  // delete subtask

  const {subTaskId} = req.params;

  if(!mongoose.Types.ObjectId.isValid(subTaskId)){
    throw new ApiError(400, "invalid sub task id")
  }

  const existingSubTask = await SubTask.findById(subTaskId);

  if(!existingSubTask){
    throw new ApiError(404, "sub task is not found")
  }
  const deletedSubTask = await SubTask.findByIdAndDelete(subTaskId);
  return res.status(200).json(new ApiResponse(200, deletedSubTask, "sub task deleted successfully"))
});

export {
  createSubTask,
  createTask,
  deleteSubTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateSubTask,
  updateTask,
};
