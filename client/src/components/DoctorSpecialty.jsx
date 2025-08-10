import React from "react";
import { Helmet } from "react-helmet";
import { specialtyData } from "../assets/assets_frontend/assets";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import { FaStethoscope } from "react-icons/fa";

const DoctorSpecialty = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
      className="flex flex-col items-center gap-8 py-32 px-4 sm:px-8 bg-[#B2EBF2] relative"
      id="doctorSpecialty"
    >
      {/* Section Header */}
      <motion.div 
        className="flex flex-col   items-center"
        variants={itemVariants}
      >
        <div className="flex items-center gap-3 mb-4">
          <FaStethoscope className="text-3xl text-[var(--color-primary-dark)]" />
          <h2 className="text-3xl md:text-4xl font-bold text-[#0097A7]">
            Find by Specialty
          </h2>
        </div>
        <p className="w-full md:w-1/2 text-center text-[var(--color-text-secondary)]">
          Simply browse through our extensive list of medical specialties and find
          the right doctor for your needs.
        </p>
      </motion.div>

      {/* Helmet for SEO */}
      <Helmet>
        <title>Find Doctors by Specialty - Roshetta</title>
        <meta
          name="description"
          content="Find doctors by specialty on Roshetta. Browse our extensive list of medical specialties to book appointments with trusted healthcare professionals."
        />
        <meta
          name="keywords"
          content="find doctors, medical specialties, book appointments, healthcare, Roshetta"
        />
        <link rel="canonical" href="https://www.roshetta.com/doctors" />
        <meta
          property="og:title"
          content="Find Doctors by Specialty - Roshetta"
        />
        <meta
          property="og:description"
          content="Find doctors by specialty on Roshetta. Browse our extensive list of medical specialties to book appointments with trusted healthcare professionals."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.roshetta.com/doctors" />
      </Helmet>

      {/* Specialty Grid */}
      <motion.div 
        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6 w-full max-w-6xl"
        variants={containerVariants}
      >
        {specialtyData.map((item) => (
          <motion.div
            key={uuidv4()}
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex justify-center"
          >
            <Link
              onClick={() => window.scrollTo(0, 0)}
              to={`/doctors/${item.specialty.toLowerCase().replace(/ /g, "-")}`}
              className="flex flex-col items-center group cursor-pointer w-full"
            >
              <div className="p-4 bg-[var(--color-primary)] rounded-2xl shadow-md group-hover:shadow-lg transition-all duration-300 mb-3 w-20 h-20 flex items-center justify-center">
                <img
                  className="w-12 h-12 object-contain transition-transform duration-300 group-hover:scale-110"
                  src={item.image}
                  alt={item.specialty}
                />
              </div>
              <p className="text-center font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-primary-dark)] transition-colors duration-300 text-sm">
                {item.specialty}
              </p>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-[var(--color-accent)] opacity-10 rounded-full filter blur-xl -z-0"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-[var(--color-primary)] opacity-10 rounded-full filter blur-xl -z-0"></div>
    </motion.div>
  );
};

export default DoctorSpecialty;