import mongoose from "mongoose";
import { Project } from "../models/project.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ProjectNote } from "../models/note.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { Task } from "../models/task.models.js";
import { AvailableUserRoles } from "../utils/constant.js";

const getProjects = asyncHandler ( async (req, res) => {
  // get all projects
  const allProject = await Project.find({})
                    .populate("createdBy", "username fullname email avatar");

  if(allProject.length===0){
    throw new ApiError(404, "No projects found")
  }
  return res.status(200).json(new ApiResponse(200, allProject, "All project fetch successfully"))
});

const getProjectById = asyncHandler ( async (req, res) => {
  // get project by id
  const {projectId} = req.params;

  if(!projectId){
      throw new ApiError(400, "invalid project id")
  }

  const project = await Project.findById(projectId)
                  .populate("createdBy", "username fullname email avatar")
  if(!project){
    throw new ApiError(404, "no project found")
  }
  return res.status(200).json(new ApiResponse(200, project, "project fetch successfully"))

});

const createProject = asyncHandler( async (req, res) => {
  // create project
  const {name, description} = req.body
  
  if(!name || !description){
    throw new ApiError(400, "invalid name and description")
  }
  const existingProject = await Project.findOne({name})

  if(existingProject){
    throw new ApiError(409, `Project with name ${name} already exist`);
  }
  const project = await Project.create({
    name,
    description,
    createdBy: mongoose.Types.ObjectId(req.user._id)
  })

  const newProject = await Project.findById(project._id)
                     .populate("createdBy", "username fullname email avatar")

  return res.status(201).json(new ApiResponse(201, newProject, "project created successfully"))
             
});

const updateProject = asyncHandler ( async (req, res) => {
  // update project
  const {projectId} = req.params;
  const data = req.body
   
  if(!projectId || Object.keys(data).length === 0){
    throw new ApiError(400, "invalid project id and data")
  }

  const existingProject = await Project.findById(projectId)

  if(!existingProject){
    throw new ApiError(404, `project not found`)
  }

  //dynamic update field which are provide by frontend
  //if you want any new field to be update just add that field name in allowFields array then it will done
  const allowFields = ["name", "description"];
  const filterField = {}
  for(const key of Object.keys(data)){
    if(allowFields.includes(key)){
        filterField[key] = data[key];
    }
  }

  if(Object.keys(filterField).length === 0){
    throw new ApiError(400, "no field provide for update")
  }
  
  const updatedProject = await Project.findByIdAndUpdate(
    projectId,
    filterField,
    {new: true}
  ).populate("createdBy", "username fullname email avatar")

    return res.status(200).json(new ApiResponse(200, updatedProject, "project updated successfully"))

});

const deleteProject = asyncHandler (async (req, res) => {
  // delete project
  
  const {projectId} = req.params;

  if(!projectId){
    throw new ApiError(400, "project id is require")
  }

    if(!mongoose.Types.ObjectId.isValid(projectId)){
    throw new ApiError(400, "invalid id")
  }
  const project = await Project.findById(projectId)

  if(!project){
    throw new ApiError(404, "project not found")
  }

  //cascade delete all data
  await Promise.all([ProjectNote.deleteMany({project: projectId}),
                     ProjectMember.deleteMany({project: projectId}),
                     Task.deleteMany({project: projectId})
                    ]);
  
  const deletedProject = await Project.findByIdAndDelete(projectId)

  return res.status(200).json(new ApiResponse(200, deletedProject, "project deleted successfully"))
});

const getProjectMembers = asyncHandler ( async (req, res) => {
  // get project members
  const {projectId} = req.params;

  if(!mongoose.Types.ObjectId.isValid(projectId)){
    throw new ApiError(400, "invalid project id")
  }
  const project = await Project.findById(projectId)

  if(!project){
    throw new ApiError(404, "project not found")
  }

  const projectMembers = await ProjectMember.find(
    {project: mongoose.Types.ObjectId(projectId) }
  ).populate("user", "username fullname email avatar")
   .populate("project", "name description")

   if(projectMembers.length === 0){
    throw new ApiError(404, "project has no member")
   }
  return res.status(200).json(new ApiResponse(200, projectMembers, "project members fetch successfully"))
});

const addMemberToProject = asyncHandler (async (req, res) => {
  // add member to project
  
  const {projectId, toBeMemberId} = req.params

  if(!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(toBeMemberId)){
    throw new ApiError(400, "invalid project id or user id to become member of project")
  }

  const project = await Project.findById(projectId)

  if(!project){
    throw new ApiError(404, "project not found")
  }

  const memberExist = await ProjectMember.findOne({
    user: toBeMemberId,
    project: projectId
  })
  if(memberExist){
    throw new ApiError(409, "this user already member of this project")
  }
  const newProjectMember = await ProjectMember.create({
    user: toBeMemberId,
    project: projectId
  });
  const projectMember = await ProjectMember.findById(newProjectMember._id)
                              .populate([
                                {path: "user", select:"username fullname email avatar"},
                                {path: "project", select: "name description"}
                              ])
  return res.status(201).json(new ApiResponse(201, projectMember, "project member added"))
});

const deleteMember = asyncHandler (async (req, res) => {
  // delete member from project
  const {projectId, memberId} = req.params;

  if(!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(memberId)){
    throw new ApiError(400, "invalid project id or member id")
  }

  const project = await Project.findById(projectId);

  if(!project){
    throw new ApiError(404, "project not found")
  }
  const existingMember = await ProjectMember.findById(memberId)
  if(!existingMember){
    throw new ApiError(404, "this member is not exist in this project")
  }

  const deleteProjectMember = await ProjectMember.findByIdAndDelete(memberId)
                      .populate("user", "username fullname email avatar")
                      .populate("project", "name description");

  return res.status(200).json(new ApiResponse(200, deleteProjectMember, "member delete from project"))
});

const updateMemberRole = asyncHandler (async (req, res) => {
  // update member role

   const {memberId} = req.params;
   const {role} = req.body;

   if(!mongoose.Types.ObjectId.isValid(memberId) || !role){
      throw new ApiError(400, "invalid member id or role")
   }

   if(!AvailableUserRoles.includes(role)){
    throw new ApiError(400, "invalid role")
   }
   const member = await ProjectMember.findByIdAndUpdate(
    memberId,
    {role},
    {new: true}
  ).populate([
    {path: "user", select: "username fullname email avatar"},
    {path: "project", select: "name description"}
  ]);

  return res.status(200).json(new ApiResponse(200, member, "member role is updated succeessfully"))

});

export {
  addMemberToProject,
  createProject,
  deleteMember,
  deleteProject,
  getProjectById,
  getProjectMembers,
  getProjects,
  updateMemberRole,
  updateProject,
};
