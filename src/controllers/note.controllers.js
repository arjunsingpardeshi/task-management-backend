// boilderplate code

import mongoose from "mongoose";
import { ProjectNote } from "../models/note.models.js";
import { Project } from "../models/project.models.js"
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

const getNotes = asyncHandler (async (req, res) => {
  // get all notes
  const { projectId } = req.body;
  const project = await Project.findById(projectId)

  if(!project){
    throw new ApiError(401, "project  not found")
  }

  const notes = await ProjectNote.find({
    project: new mongoose.Types.ObjectId(projectId)
  }).populate("createdBy", "username fullname avatar")

  // if(!notes.length===0){
  //   throw new ApiError(404, "notes not found")
  // }
  return res.status(200).json(new ApiResponse(200, notes, "All notes for project is fetch successfully"))
});

const getNoteById =   asyncHandler (async (req, res) => {
  // get note by id
  const {noteId} = req.params;
  if(!noteId){
    throw new ApiError(400, "invalid note id")
  }  
  const note = await ProjectNote.findById(noteId).populate("createdBy", "username fullname avatar");

  if(!note){
      throw new ApiError(404, "note not found")
  }
  return res.status(200).json(new ApiResponse(200, note, "note fetch successfully"))
});

const createNote = asyncHandler ( async (req, res) => {
  // create note
  const {projectId} = req.params
  const {content} = req.body

  if(!projectId || !content){
    throw new ApiError(400, "invalid data")
  }

  const project = await Project.findById(projectId)
  if(!project){
    throw new ApiError(404, "project not found")
  }

  const newNote = await ProjectNote.create({
    project: new mongoose.Types.ObjectId(projectId),
    createdBy: new mongoose.Types.ObjectId(req.user._id),
    content
  })
  
  const populatedNote = await ProjectNote.findById(newNote._id)
  .populate("createdBy", "username fullName avatar")

   return res.status(200).json(new ApiResponse(201, populatedNote, "note created successfully"))

});

const updateNote = asyncHandler ( async (req, res) => {
  // update note
  const {noteId} = req.params;
  const {content} = req.body;

  if(!noteId || !content){
    throw new ApiError(400, "invalid data")
  }

  const existingNote = await ProjectNote.findById(noteId)

  if(!existingNote){
    throw new ApiError(404, "note not found")
  }
  const updatedNote = await ProjectNote.findByIdAndUpdate(
    noteId,
    {content},
    {new: true}
    ).populate("createdBy", "username fullname avatar")
  

  return res.status(200).json(new ApiResponse(200, updatedNote, "note update successfull"))
});

const deleteNote = asyncHandler ( async (req, res) => {
  // delete note

  const {noteId} = req.params;

  if(!noteId){
    throw new ApiError(400, "invalid noteId")
  }
  const deleteNote = await ProjectNote.findByIdAndDelete(noteId)

  if(!deleteNote){
   throw new ApiError(401, "note not deleted")
  }

  return res.status(200).json(new ApiResponse(200, deleteNote, "note deleted successfull"))
});

export { createNote, deleteNote, getNoteById, getNotes, updateNote };
