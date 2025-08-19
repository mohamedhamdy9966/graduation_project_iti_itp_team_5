// Fixed adminRoute.js
import express from "express";
import upload from "../middlewares/multer.js";
import authAdmin from "../middlewares/authAdmin.js";
import { addDoctor, allDoctors, changeDoctorAvailability } from "../controllers/doctorAdminController.js";
import { addLab, allLabs, changeLabAvailability } from "../controllers/labAdminController.js";
import { adminDashboard } from "../controllers/dashBoardAdminController.js";
import { appointmentCancel, appointmentsAdmin } from "../controllers/appointmentAdminController.js";
import { loginAdmin } from "../controllers/authAdminController.js";

const adminRouter = express.Router();

adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor);
adminRouter.post("/add-lab", authAdmin, upload.single("image"), addLab);
adminRouter.post("/login", loginAdmin);
adminRouter.post("/all-doctors", authAdmin, allDoctors);
adminRouter.get("/all-labs", authAdmin, allLabs);
adminRouter.post(
  "/change-doctor-availability",
  authAdmin,
  changeDoctorAvailability
);
adminRouter.post("/change-lab-availability", authAdmin, changeLabAvailability);
adminRouter.get("/appointments", authAdmin, appointmentsAdmin);
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel);
adminRouter.get("/dashboard", authAdmin, adminDashboard);

export default adminRouter;
