import React from "react";
import { Helmet } from "react-helmet";
import TopDoctors from "../components/TopDoctors";
import Header from "../components/Header";
import LabHeader from "../components/LabHeader";
import DoctorSpecialty from "../components/DoctorSpecialty";
import LabSpecialty from "../components/LabSpecialty";

const Home = () => {
  return (
    <div >
      <Header/>
      < DoctorSpecialty/>
      <TopDoctors/>
    </div>
  );
};

export default Home;
