import React, { useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { motion } from "framer-motion";
import { FaArrowRight, FaRegStar, FaStar } from "react-icons/fa";
import { IoMdTime } from "react-icons/io";
import {CgArrowTopLeftR} from "react-icons/cg";

const TopDoctors = () => {
  const navigate = useNavigate();
  const { doctors } = useContext(AppContext);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={container}
      className="relative py-20 px-6 sm:px-8 bg-gradient-to-br from-[var(--color-primary-dark)] to-[var(--color-primary)]"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary-light)] opacity-10 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div 
          className="flex flex-col items-center mb-16"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.6, ease: "easeOut" }
            }
          }}
        >
          
          <h2 className="text-3xl flex  md:text-4xl font-bold text-center text-white mb-4">
            <CgArrowTopLeftR className="text-4xl mr-2 text-white" />
            Our Top Specialists
          </h2>
          <p className="text-lg text-center text-[var(--color-text-secondary)] max-w-2xl">
            Book appointments with our most experienced medical professionals
          </p>
        </motion.div>

        {/* Doctors Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
          variants={container}
        >
          {doctors.slice(0, 8).map((doctor) => (
            <motion.div
              key={uuidv4()}
              variants={item}
              whileHover={{ 
                y: -8,
                transition: { type: "spring", stiffness: 300 }
              }}
              className="flex justify-center"
            >
              <div
                onClick={() => {
                  navigate(`/my-appointments/${doctor._id}`);
                  window.scrollTo(0, 0);
                }}
                className="group w-full cursor-pointer"
              >
                <div className="relative h-full flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                  {/* Doctor Image */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      src={doctor.image}
                      alt={doctor.name}
                    />
                    {/* Status Badge */}
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${
                      doctor.available 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {doctor.available ? "Available" : "Booked"}
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary-dark)] transition-colors">
                          {doctor.name}
                        </h3>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                          {doctor.specialty}
                        </p>
                      </div>
                      <div className="flex items-center bg-[var(--color-primary-light)] bg-opacity-20 px-2 py-1 rounded">
                        <FaStar className="text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">{doctor.rating || "4.8"}</span>
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-[var(--color-text-secondary)]">
                      <IoMdTime className="mr-2 text-[var(--color-primary)]" />
                      <span>{doctor.experience || "10+"} years experience</span>
                    </div>

                    <div className="pt-2">
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-primary-light)] hover:bg-[var(--color-primary)] text-[var(--color-primary-dark)] hover:text-white rounded-lg transition-colors duration-300 text-sm font-medium">
                        Book Appointment
                        <FaArrowRight className="text-xs transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          className="flex justify-center mt-16"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { delay: 0.4, duration: 0.6 }
            }
          }}
        >
          <button
            onClick={() => {
              navigate("/doctors");
              window.scrollTo(0, 0);
            }}
            className="flex items-center gap-3 px-8 py-4 bg-white hover:bg-[var(--color-primary-dark)] text-[#0097A7] hover:text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-300"
          >
            View All Doctors
            <FaArrowRight className="transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default TopDoctors;