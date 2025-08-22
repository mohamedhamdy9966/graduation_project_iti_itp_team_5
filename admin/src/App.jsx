import Login from "./pages/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useContext } from "react";
import { AdminContext } from "./context/AdminContext";
import DrugContextProvider from "./context/DrugContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Admin/Dashboard";
import AddDoctor from "./pages/Admin/AddDoctor";
import DoctorsList from "./pages/Admin/DoctorsList";
import { DoctorContext } from "./context/DoctorContext";
import { LabContext } from "./context/LabContext";
import DoctorDashboard from "./pages/Doctor/DoctorDashboard";
import DoctorAppointments from "./pages/Doctor/DoctorAppointments";
import DoctorProfile from "./pages/Doctor/DoctorProfile";
import LabDashboard from "./pages/Lab/LabDashboard";
import LabAppointments from "./pages/Lab/LabAppointments";
import LabProfile from "./pages/Lab/LabProfile";
import AllAppointments from "./pages/Admin/AllAppointments";
import AddLab from "./pages/Admin/AddLab";
import LabList from "./pages/Admin/LabList";
import AddDrug from "./pages/Admin/AddDrug";
import DrugList from "./pages/Admin/DrugList";
import AllOrders from "./pages/Admin/AllOrders";

const App = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);
  const { lToken } = useContext(LabContext);

  return aToken || dToken || lToken ? (
    <DrugContextProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />

        {/* Navbar at the top */}
        <Navbar />

        {/* Main content area with sidebar */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <Sidebar />

          {/* Main content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <Routes>
                {/* Default Route */}
                <Route path="/" element={<></>} />

                {/* Admin Routes */}
                <Route path="/admin-dashboard" element={<Dashboard />} />
                <Route path="/all-appointments" element={<AllAppointments />} />
                <Route path="/add-doctor" element={<AddDoctor />} />
                <Route path="/add-lab" element={<AddLab />} />
                <Route path="/doctor-list" element={<DoctorsList />} />
                <Route path="/lab-list" element={<LabList />} />

                {/* Drug Management Routes */}
                <Route path="/add-drug" element={<AddDrug />} />
                <Route path="/drug-list" element={<DrugList />} />
                <Route path="/all-orders" element={<AllOrders />} />

                {/* Doctor Routes */}
                <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
                <Route
                  path="/doctor-appointments"
                  element={<DoctorAppointments />}
                />
                <Route path="/doctor-profile" element={<DoctorProfile />} />

                {/* Lab Routes */}
                <Route path="/lab-dashboard" element={<LabDashboard />} />
                <Route path="/lab-appointments" element={<LabAppointments />} />
                <Route path="/lab-profile" element={<LabProfile />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </DrugContextProvider>
  ) : (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <Login />
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default App;
