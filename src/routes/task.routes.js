import { createSubTask, createTask, deleteSubTask, deleteTask, getTaskById, getTasks, updateSubTask, updateTask } from "../controllers/task.controllers.js";
import {isLoggedIn, validateProjectPermission} from "../middlewares/authentication.middleware.js"
import { Router } from "express";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constant.js";

const router = Router()

router.route("/project/:projectId")
.get(isLoggedIn, validateProjectPermission(AvailableUserRoles), getTasks)
.post(isLoggedIn, validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), createTask)

router.route("/:taskId")
.get(isLoggedIn, validateProjectPermission(AvailableUserRoles), getTaskById)
.patch(isLoggedIn, validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), updateTask)
.delete(isLoggedIn, validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), deleteTask)


router.route("/subtask/:taskId")
.post(isLoggedIn, validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), createSubTask)

router.route("/subtask/:subTaskId")
.patch(isLoggedIn, validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), updateSubTask)
.delete(isLoggedIn, validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), deleteSubTask)
export default router