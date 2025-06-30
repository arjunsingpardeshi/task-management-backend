import { Router } from "express";
import { isLoggedIn, validateProjectPermission } from "../middlewares/authentication.middleware.js";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constant.js";
import { createNote, deleteNote, getNoteById, getNotes, updateNote } from "../controllers/note.controllers.js";

const router = Router()

router.route("/:projectId")
      .get(isLoggedIn, validateProjectPermission(AvailableUserRoles), getNotes)
      .post(isLoggedIn, validateProjectPermission([UserRolesEnum.ADMIN]), createNote)


router.route("/:projectId/n/noteId")
      .get(isLoggedIn, validateProjectPermission(AvailableUserRoles), getNoteById)
      .put(isLoggedIn, validateProjectPermission([UserRolesEnum.ADMIN]), updateNote)
      .delete(isLoggedIn, validateProjectPermission([UserRolesEnum.ADMIN]), deleteNote)


export default router