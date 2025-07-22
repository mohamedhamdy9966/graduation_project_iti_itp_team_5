import React from "react";
import { assets } from "../assets/assets_frontend/assets";

const Footer = () => {
  return (
    <div className="md:mx-10">
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
        {/* leftSection */}
        <div>
          <img className="mb-5 w-40" src={assets.logo} alt="logo" />
          <div className="w-full md:w-2/3 text-gray-600 leading-6">
            lorem hfaslf fsjalfjlksaf lsajflksajf salkjflksajf skjflksajflksajf
            lskjaflkajfajf flkaufijreoiur jdsflkdufc.,vnclvncxvjoiuefrefds,
          </div>
        </div>
        {/* centerSection */}
        <div>
          <p className="text-xl font-medium mb-5">Company</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>Home</li>
            <li>About Us</li>
            <li>Contact Us</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
        {/* rightSection */}
        <div>
          <p className="text-xl font-medium mb-5">Get In Touch</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>+20-120-722-6094</li>
            <li>support@roshetta.com</li>
          </ul>
        </div>
      </div>
      {/* copyRightSection */}
      <div>
        <hr />
        <p className="py-5 text-sm text-center">Copyright @{Date.now()} Roshetta - All Rights Reserved</p>
      </div>
    </div>
  );
};

export default Footer;
