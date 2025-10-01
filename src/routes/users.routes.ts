import { Router } from "express";
import {
  handleList,
  handleGet,
  handleCreate,
  handleUpdate,
  handleDelete,
} from "../controllers/users.controller";

const router = Router();

router.get("/", handleList);
router.get("/:id", handleGet);
router.post("/", handleCreate);
router.patch("/:id", handleUpdate);
router.delete("/:id", handleDelete);

export default router;
