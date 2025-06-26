import { Router } from "express";
import { validateProjectPermission } from "../middlewares/authentication.middleware";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constant";
import { createNote, deleteNote, getNoteById, getNotes, updateNote } from "../controllers/note.controllers";

const router = Router()

router.route("/:projectId")
      .get(validateProjectPermission(AvailableUserRoles), getNotes)
      .post(validateProjectPermission([UserRolesEnum.ADMIN]), createNote)


router.route("/:projectId/n/noteId")
      .get(validateProjectPermission(AvailableUserRoles), getNoteById)
      .put(validateProjectPermission([UserRolesEnum.ADMIN]), updateNote)
      .delete(validateProjectPermission([UserRolesEnum.ADMIN]), deleteNote)


export default router