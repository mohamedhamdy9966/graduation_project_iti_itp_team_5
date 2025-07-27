import React from "react";
import { assets } from "../assets/assets_frontend/assets";

const Contact = () => {
  return (
    <div className="px-4 md:px-16 lg:px-24 py-10">
      <div className="text-center text-2xl text-gray-500 mb-10">
        <p>
          Contact <span className="text-gray-700 font-semibold">Us</span>
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-12 mb-28">
        <img
          className="w-full md:max-w-[400px] rounded-md shadow-md"
          src={assets.contact_image}
          alt="contact-image"
        />

        <div className="flex flex-col justify-center gap-4 text-sm text-gray-600 md:w-2/3">
          <p className="text-lg font-semibold text-gray-700">Our Office</p>
          <p>.,nxzn.xbn.cbx</p>
          <p>xzvxzvzxv</p>

          <p className="text-lg font-semibold text-gray-700">xzvzzzvxz</p>
          <p>vxzxzvxzvxz</p>

          <button className="w-fit mt-4 border border-black px-6 py-2 text-sm hover:bg-black hover:text-white transition-all duration-300">
            Explore Jobs
          </button>
        </div>
      </div>
    </div>
  );
};

export default Contact;
