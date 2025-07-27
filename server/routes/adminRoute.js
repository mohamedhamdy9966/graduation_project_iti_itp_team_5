import express from "express";
import {
  addDoctor,
  addLab,
  adminDashboard,
  allDoctors,
  allLabs,
  appointmentCancel,
  appointmentsAdmin,
  loginAdmin,
} from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";
import authAdmin from "../middlewares/authAdmin.js";
import { changeDoctorAvailability } from "../controllers/doctorController.js";
import { changeLabAvailability } from "../controllers/labController.js";

const adminRouter = express.Router();

adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor);
adminRouter.post("/add-lab", authAdmin, upload.single("image"), addLab);
adminRouter.post("/login", loginAdmin);
adminRouter.post("/all-doctors", authAdmin, allDoctors);
adminRouter.post("/all-labs", authAdmin, allLabs);
adminRouter.post("/change-doctor-availability", authAdmin, changeDoctorAvailability);
adminRouter.post("/change-lab-availability", authAdmin, changeLabAvailability);
adminRouter.get("/appointments", authAdmin, appointmentsAdmin);
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel);
adminRouter.get("/dashboard", authAdmin, adminDashboard);

export default adminRouter;
