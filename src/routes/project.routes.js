import { Router } from "express";
import { isLoggedIn, validateProjectPermission } from "../middlewares/authentication.middleware.js";
import {addMemberToProject, createProject, deleteMember, deleteProject, getProjectById, getProjectMembers, getProjects, updateMemberRole, updateProject } from "../controllers/project.controllers.js";
import { UserRolesEnum } from "../utils/constant.js";

const router = Router()

router.route("/get-all-projects").get(isLoggedIn, getProjects)

router.route("/:projectId")
.get(isLoggedIn, validateProjectPermission(AvailableUserRoles), getProjectById)
.post(isLoggedIn, validateProjectPermission([UserRolesEnum.ADMIN]), createProject)
.patch(isLoggedIn, validateProjectPermission([UserRolesEnum.ADMIN]), updateProject)
.delete(isLoggedIn, validateProjectPermission([UserRolesEnum.ADMIN]), deleteProject)

router.route("/get-project-member/:projectId")
.get(isLoggedIn, validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), getProjectMembers)

router.route("/:projectId/n/:toBeMemberId")
.post(isLoggedIn, validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), addMemberToProject)

router.route("/:projectId/n/:memberId")
.delete(isLoggedIn, validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), deleteMember)
.patch(isLoggedIn, validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), updateMemberRole)

export default router