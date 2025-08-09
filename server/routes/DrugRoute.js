import express from "express";
import upload  from "../middlewares/multer.js";
import {
  addDrug,
  changeStock,
  drugById,
  drugList,
} from "../controllers/drugController.js";
import authAdmin from "../middlewares/authAdmin.js";

const DrugRouter = express.Router();

DrugRouter.post("/add", upload.array("images", 4), authAdmin, addDrug);
DrugRouter.get("/list", drugList);
DrugRouter.get("/id", drugById);
DrugRouter.post("/stock", authAdmin, changeStock);

export default DrugRouter;