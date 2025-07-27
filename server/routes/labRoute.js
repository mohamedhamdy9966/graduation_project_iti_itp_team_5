import express from "express";
import {
  labList,
  loginLab,
  appointmentsLab,
  appointmentComplete,
  appointmentCancel,
  labDashboard,
  labProfile,
  updateLabProfile,
} from "../controllers/labController.js";
import authLab from "../middlewares/authLab.js";

const labRouter = express.Router();

labRouter.get("/list", labList);
labRouter.post("/login", loginLab);
labRouter.get("/appointments", authLab, appointmentsLab);
labRouter.post("/complete-appointment", authLab, appointmentComplete);
labRouter.post("/cancel-appointment", authLab, appointmentCancel);
labRouter.get("/dashboard", authLab, labDashboard);
labRouter.get("/profile", authLab, labProfile);
labRouter.post("/update-profile", authLab, updateLabProfile);

export default labRouter;
