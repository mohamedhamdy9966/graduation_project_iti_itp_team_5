import express from "express";
import upload from "../middlewares/multer.js";
import {
  addDrug,
  changeStock,
  drugById,
  drugList,
  removeDrug,
} from "../controllers/drugController.js";
import authAdmin from "../middlewares/authAdmin.js";

const DrugRouter = express.Router();

// Add drug (Admin only)
DrugRouter.post("/add", authAdmin, upload.array("images", 4), addDrug);

// Get all drugs (Public)
DrugRouter.get("/list", drugList);

// Get single drug by ID (Public)
DrugRouter.get("/single/:id", drugById);

// Change stock status (Admin only)
DrugRouter.post("/stock", authAdmin, changeStock);

// Remove drug (Admin only)
DrugRouter.delete("/remove", authAdmin, removeDrug);

export default DrugRouter;
