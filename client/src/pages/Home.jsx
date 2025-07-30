import React from "react";
import { Helmet } from "react-helmet";
import TopDoctors from "../components/TopDoctors";
import Header from "../components/Header";
import LabHeader from "../components/LabHeader";
import DoctorSpecialty from "../components/DoctorSpecialty";
import LabSpecialty from "../components/LabSpecialty";

const Home = () => {
  return (
    <div className="space-y-60">
      <Helmet>
        <title>Home - Roshetta Healthcare Platform</title>
        <meta
          name="description"
          content="Book appointments with top doctors and explore specialized medical services at Your Healthcare Platform. Find trusted healthcare professionals today."
        />
        <meta
          name="keywords"
          content="healthcare, book doctor appointments, top doctors, medical services, specialties"
        />
        <link rel="canonical" href="https://www.yourhealthcare.com/" />
        <meta property="og:title" content="Home - Your Healthcare Platform" />
        <meta
          property="og:description"
          content="Book appointments with top doctors and explore specialized medical services at Your Healthcare Platform. Find trusted healthcare professionals today."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.roshetta.com/" />
      </Helmet>
      <Header />
      <DoctorSpecialty />
      <TopDoctors />
      <LabHeader />
      <LabSpecialty />
    </div>
  );
};

export default Home;
