import doctorModel from "../models/doctorModel.js";

// API to get doctors by specialty
const getDoctorsBySpecialty = async (req, res) => {
  try {
    const { specialty } = req.query;
    const doctors = await doctorModel
      .find({ specialty: new RegExp(specialty, "i"), available: true })
      .select("name specialty fees");
    res.json({ success: true, doctors });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export { getDoctorsBySpecialty };