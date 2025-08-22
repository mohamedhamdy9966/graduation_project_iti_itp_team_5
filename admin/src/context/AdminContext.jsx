import { useState } from "react";
import { createContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
  const [aToken, setAToken] = useState(
    localStorage.getItem("aToken") ? localStorage.getItem("aToken") : ""
  );
  const [doctors, setDoctors] = useState([]);
  const [labs, setLabs] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const getAllDoctors = async () => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/all-doctors",
        {},
        { headers: { aToken } }
      );
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getAllLabs = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/all-labs", {
        headers: { aToken },
      });
      if (data.success) {
        setLabs(data.labs);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

const changeDoctorAvailability = async (docId) => {
  try {
    if (!docId) {
      throw new Error("Invalid doctor ID");
    }
    const { data } = await axios.post(
      backendUrl + "/api/admin/change-doctor-availability",
      { docId },
      { headers: { aToken } }
    );
    if (data.success) {
      toast.success(data.message);
      await getAllDoctors(); // Refresh the list
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    console.error("Error changing doctor availability:", error);
    toast.error(error.message);
  }
};

  const changeLabAvailability = async (labId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/change-lab-availability",
        { labId },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAllLabs();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getAllAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/appointments", {
        headers: { aToken },
      });
      if (data.success) {
        setAppointments(data.appointments);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const cancelAppointment = async (appointmentId, type) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/cancel-appointment",
        { appointmentId, type },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAllAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getDashData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/dashboard", {
        headers: { aToken },
      });
      if (data.success) {
        setDashData(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const value = {
    aToken,
    setAToken,
    backendUrl,
    doctors,
    labs,
    getAllDoctors,
    getAllLabs,
    changeDoctorAvailability,
    changeLabAvailability,
    appointments,
    getAllAppointments,
    cancelAppointment,
    dashData,
    getDashData,
  };

  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
