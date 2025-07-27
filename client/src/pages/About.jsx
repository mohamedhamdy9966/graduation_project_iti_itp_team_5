import React from "react";
import { assets } from "../assets/assets_frontend/assets";

const About = () => {
  return (
    <div className="px-4 sm:px-10 lg:px-20 text-gray-600">
      {/* Heading */}
      <div className="text-center text-2xl pt-10 text-gray-500">
        <p>
          About <span className="text-gray-700 font-medium">US</span>
        </p>
      </div>

      {/* About Section */}
      <div className="my-12 flex flex-col md:flex-row items-center md:items-start gap-10">
        <img
          className="w-full md:max-w-[360px] rounded-lg shadow-md"
          src={assets.about_image}
          alt="about-us"
        />
        <div className="flex flex-col justify-center gap-5 md:w-2/3 text-sm">
          <p>lkldkja sfdjlksfj slkjflksjf lskjf;lsmflks</p>
          <p>kljdlksajfslakfjsaljflksafjlsa</p>
          <p className="text-gray-800 font-medium">
            wiureourowpqrupoyroiewrouqyr.,m.vxkjfds
          </p>
          <p>,.xznv.,xznvxvzbhdwq;wjfoiqwyfriutwqrwq</p>
        </div>
      </div>

      {/* Why Choose Us Heading */}
      <div className="text-xl font-medium text-center mb-8">
        <p>
          Why <span className="text-gray-700 font-semibold">Choose Us</span>
        </p>
      </div>

      {/* Features Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        {[
          {
            title: "Efficiency",
            desc: "lorem lkasfdhflkadhgld irweyroewyo ,mxv,mxzbv wqiroe",
          },
          {
            title: "Convenience",
            desc: "lfdksa;ljgasiroiwqeyrqowiutwqpirowqrwqorpowqirpowqr",
          },
          {
            title: "Personalization",
            desc: ".,nm,nnmbnbvbvxadjfhkoyiutyterwqew",
          },
        ].map((item, index) => (
          <div
            key={index}
            className="border rounded-md px-8 py-10 flex flex-col gap-4 text-sm hover:bg-blue-500 hover:text-white transition duration-300 cursor-pointer shadow-sm"
          >
            <b className="text-base">{item.title}</b>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default About;
