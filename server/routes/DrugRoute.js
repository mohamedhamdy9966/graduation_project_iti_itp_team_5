import express from "express";
import { upload } from "../configs/multer.js";
import {
  addDrug,
  changeStock,
  drugById,
  drugList,
} from "../controllers/productController.js";
import authAdmin from "../middlewares/authAdmin.js";

const DrugRouter = express.Router();

productRouter.post("/add", upload.array("images", 4), authSeller, addDrug);
productRouter.get("/list", drugList);
productRouter.get("/id", drugById);
productRouter.post("/stock", authAdmin, changeStock);

export default DrugRouter;