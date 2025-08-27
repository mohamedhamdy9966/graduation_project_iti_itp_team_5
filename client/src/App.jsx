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
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Chatbot from "./components/Chatbot";
import VerifyEmail from "./components/VerifyEmail";
import ResetPassword from "./components/ResetPassword";
import DrugOrder from "./pages/DrugOrder";
// Import payment pages
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import PaymentProcessing from "./pages/PaymentProcessing";
import PrivacyPolicy from "./pages/PrivacyPolicy";

const App = () => {
  return (
    <div >
      <ToastContainer />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/:specialty" element={<Doctors />} />
        <Route path="/labs" element={<Labs />} />
        <Route path="/labs/:specialty" element={<Labs />} />
        <Route path="/drugs" element={<Drugs />} />
        <Route path="/drugs/:specialty" element={<Drugs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacypolicy" element={<PrivacyPolicy />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/my-appointments" element={<MyAppointments />} />
        <Route path="/my-appointments/:docId" element={<DoctorAppointment />} />
        <Route path="/my-appointments/:labId" element={<LabAppointment />} />
        <Route path="/my-appointments/:orderId" element={<DrugOrder />} />
        <Route path="/success" element={<PaymentSuccess />} />
        <Route path="/cancel" element={<PaymentCancel />} />
        <Route path="/processing" element={<PaymentProcessing />} />
      </Routes>
      <Footer />
      <Chatbot />
    </div>
  );
};

export default App;
