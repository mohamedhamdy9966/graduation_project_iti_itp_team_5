import React from "react";
import TopDoctors from "../components/TopDoctors";
import Header from "../components/Header";
import LabHeader from "../components/LabHeader";
import DoctorSpecialty from "../components/DoctorSpecialty";
import LabSpecialty from "../components/LabSpecialty";

const Home = () => {
  return (
    <div className="space-y-60">
      <Header />
      <DoctorSpecialty />
      <TopDoctors />
      <LabHeader />
      <LabSpecialty />
    </div>
  );
};

export default Home;
