import { Route, Routes } from "react-router-dom";
import Doctors from "./pages/Doctors";
import Labs from "./pages/Labs";
import Drugs from "./pages/Drugs";
import MyAppointments from "./pages/MyDoctorsAppointments";
import MyProfile from "./pages/MyProfile";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import DoctorAppointment from "./pages/DoctorAppointment";
import LabAppointment from "./pages/LabAppointment";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import {ToastContainer} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Chatbot from "./components/Chatbot";
import DrugOrder from "./pages/DrugOrder";

const App = () => {
  return (
    <div className="mx-4 sm:mx-[10%] app-container">
      <ToastContainer/>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/:specialty" element={<Doctors />} />
        <Route path="/labs" element={<Labs />} />
        <Route path="/labs/:specialty" element={<Labs />} />
        <Route path="/drugs" element={<Drugs />} />
        <Route path="/drugs/:specialty" element={<Drugs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/my-appointments" element={<MyAppointments />} />
        <Route path="/my-appointments/:docId" element={<DoctorAppointment />} />
        <Route path="/my-appointments/:labId" element={<LabAppointment />} />
        <Route path="/my-appointments/:orderId" element={<DrugOrder />} />
      </Routes>
      <Footer/>
      <Chatbot/>
    </div>
  );
};

export default App;
