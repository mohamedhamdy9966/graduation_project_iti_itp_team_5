import React from "react";
import { Helmet } from "react-helmet";
import { assets } from "../assets/assets_frontend/assets";

const Footer = () => {
  return (
    <footer className="px-4 md:px-10 mt-40 text-sm text-gray-600 bg-blue-300">
      <Helmet>
        <title>Roshetta - Healthcare Platform</title>
        <meta
          name="description"
          content="Roshetta is your trusted platform to find and book appointments with doctors, labs, and pharmacies. Contact us or learn more about our services."
        />
        <meta
          name="keywords"
          content="healthcare, doctor appointments, labs, pharmacies, Roshetta, contact us"
        />
        <link rel="canonical" href="https://www.roshetta.com/" />
        <meta property="og:title" content="Roshetta - Healthcare Platform" />
        <meta
          property="og:description"
          content="Roshetta is your trusted platform to find and book appointments with doctors, labs, and pharmacies. Contact us or learn more about our services."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.roshetta.com/" />
        <meta property="og:image" content={assets.logo} />
      </Helmet>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-10">
        <div className="md:col-span-2">
          <img className="mb-5 w-40" src={assets.logo} alt="Roshetta Logo" />
          <p className="leading-6">
            Roshetta is your trusted platform to easily find and book
            appointments with doctors, labs, and pharmacies. Explore our network
            and simplify your healthcare journey.
          </p>
        </div>
        <div>
          <p className="text-xl font-medium mb-5">Company</p>
          <ul className="flex flex-col gap-2">
            <li className="hover:underline cursor-pointer">Home</li>
            <li className="hover:underline cursor-pointer">About Us</li>
            <li className="hover:underline cursor-pointer">Contact Us</li>
            <li className="hover:underline cursor-pointer">Privacy Policy</li>
            <li className="hover:underline cursor-pointer">Emergency</li>
          </ul>
        </div>
        <div>
          <p className="text-xl font-medium mb-5">Get In Touch</p>
          <ul className="flex flex-col gap-2">
            <li>
              <a href="tel:+201207226094" className="hover:underline">
                +20-120-722-6094
              </a>
            </li>
            <li>
              <a href="mailto:support@roshetta.com" className="hover:underline">
                support@roshetta.com
              </a>
            </li>
          </ul>
        </div>
      </div>
      <hr />
      <p className="py-5 text-center">
        © {new Date().getFullYear()} Roshetta — All Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;
