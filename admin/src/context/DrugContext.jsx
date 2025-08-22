import { useState, createContext, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const DrugContext = createContext();

const DrugContextProvider = (props) => {
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Get admin token from localStorage
  const getAdminToken = () => {
    return localStorage.getItem("aToken");
  };

  // Get all drugs
  const getAllDrugs = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/drug/list`);

      if (data.success) {
        setDrugs(data.drugs);
      } else {
        toast.error(data.message || "Failed to fetch drugs");
      }
    } catch (error) {
      console.error("Error fetching drugs:", error);
      toast.error("Failed to fetch drugs");
    } finally {
      setLoading(false);
    }
  };

  // Add new drug
  const addDrug = async (formData) => {
    try {
      const token = getAdminToken();
      if (!token) {
        toast.error("Admin authentication required");
        return false;
      }

      const { data } = await axios.post(
        `${backendUrl}/api/drug/add`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            aToken: token,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        await getAllDrugs(); // Refresh the list
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      console.error("Error adding drug:", error);
      toast.error(error.response?.data?.message || "Failed to add drug");
      return false;
    }
  };

  // Change stock status
  const changeStock = async (drugId, inStock) => {
    try {
      const token = getAdminToken();
      if (!token) {
        toast.error("Admin authentication required");
        return false;
      }

      const { data } = await axios.post(
        `${backendUrl}/api/drug/stock`,
        { id: drugId, inStock },
        {
          headers: { aToken: token },
        }
      );

      if (data.success) {
        toast.success(data.message);
        await getAllDrugs(); // Refresh the list
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      console.error("Error changing stock:", error);
      toast.error("Failed to update stock status");
      return false;
    }
  };

  // Remove drug
  const removeDrug = async (drugId) => {
    try {
      const token = getAdminToken();
      if (!token) {
        toast.error("Admin authentication required");
        return false;
      }

      const { data } = await axios.delete(`${backendUrl}/api/drug/remove`, {
        data: { id: drugId },
        headers: { aToken: token },
      });

      if (data.success) {
        toast.success(data.message);
        await getAllDrugs(); // Refresh the list
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      console.error("Error removing drug:", error);
      toast.error("Failed to remove drug");
      return false;
    }
  };

  const value = {
    drugs,
    loading,
    backendUrl,
    getAllDrugs,
    addDrug,
    changeStock,
    removeDrug,
  };

  return (
    <DrugContext.Provider value={value}>{props.children}</DrugContext.Provider>
  );
};

// Custom hook to use the DrugContext
export const useDrugContext = () => {
  const context = useContext(DrugContext);
  if (!context) {
    throw new Error("useDrugContext must be used within a DrugContextProvider");
  }
  return context;
};

export default DrugContextProvider;
