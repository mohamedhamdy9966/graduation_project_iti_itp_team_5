import React from "react";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";
import { MdHealthAndSafety, MdPrivacyTip, MdEmergency } from "react-icons/md";
import { HiHome, HiInformationCircle } from "react-icons/hi";
import { BiSupport } from "react-icons/bi";
import { RiContactsBookLine } from "react-icons/ri";
import logo from "../assets/logo7.png";

const Footer = () => {
  return (
    <footer
      className="w-full pt-16 pb-8"
      style={{ backgroundColor: "#0097A7" }}
    >
      {/* Main Content Container */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
        {/* Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <img
                src={logo}
                width={45}
                height={45}
                alt="Logo5"
                className="mr-0 mb-2"
              />
              <span
                className="text-2xl font-bold mr-2 text-white"
                style={{ fontFamily: "var(--logo-font)", letterSpacing: "1px" }}
              >
                Roshetta
              </span>
            
            </div>
            <p className="text-white text-opacity-90 leading-relaxed mb-4">
              Roshetta is your trusted platform to easily find and book
              appointments with doctors, labs, and pharmacies. Explore our
              network and simplify your healthcare journey.
            </p>

            {/* Social Icons */}
            <div className="flex space-x-3">
              <a
                href="#"
                className="social-icon bg-white bg-opacity-20 hover:bg-opacity-30"
              >
                <FaFacebook className="text-[#3b5998]" />
              </a>
              <a
                href="#"
                className="social-icon bg-white bg-opacity-20 hover:bg-opacity-30"
              >
                <FaTwitter className="text-[#1da1f2]" />
              </a>
              <a
                href="#"
                className="social-icon bg-white bg-opacity-20 hover:bg-opacity-30"
              >
                <FaInstagram className="text-[#e1306c]" />
              </a>
              <a
                href="#"
                className="social-icon bg-white bg-opacity-20 hover:bg-opacity-30"
              >
                <FaLinkedin className="text-[#0077b5]" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
              <HiInformationCircle className="mr-2 text-white  text-2xl" />
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { icon: <HiHome className="mr-2 text-white" />, text: "Home" },
                {
                  icon: <HiInformationCircle className="mr-2 text-white" />,
                  text: "About Us",
                },
                {
                  icon: <RiContactsBookLine className="mr-2 text-white" />,
                  text: "Contact Us",
                },
                {
                  icon: <MdPrivacyTip className="mr-2 text-white" />,
                  text: "Privacy Policy",
                },
                {
                  icon: <MdEmergency className="mr-2 text-white" />,
                  text: "Emergency",
                },
              ].map((item, index) => (
                <li key={index} className="flex items-center">
                  {item.icon}
                  <span className="text-white hover:text-opacity-100 text-opacity-90 hover:underline cursor-pointer">
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
              <BiSupport className="mr-2 text-white text-2xl" />
              Contact Us
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <FaPhone className="mr-2 text-white" />
                <a
                  href="tel:+201207226094"
                  className="text-white hover:text-opacity-100 text-opacity-90 hover:underline"
                >
                  +20-120-722-6094
                </a>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="mr-2 text-white" />
                <a
                  href="mailto:support@roshetta.com"
                  className="text-white hover:text-opacity-100 text-opacity-90 hover:underline"
                >
                  support@roshetta.com
                </a>
              </li>
              <li className="flex items-center">
                <FaMapMarkerAlt className="mr-2 text-white" />
                <span className="text-white text-opacity-90">Cairo, Egypt</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-t border-white border-opacity-20 my-6" />

        {/* Copyright */}
        <div className="text-center text-white text-opacity-80 text-sm">
          <span className="text-orange-900">TAXI </span> © {new Date().getFullYear()} Roshetta — All Rights
          Reserved.
        </div>
      </div>

      {/* Social Icons Style */}
      <style jsx>{`
        .social-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          transition: all 0.3s ease;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
