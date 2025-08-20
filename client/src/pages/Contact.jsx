import { Helmet } from "react-helmet";
import { assets } from "../assets/assets";

const Contact = () => {
  return (
    <div className="px-4 md:px-16 lg:px-24 py-10">
      <Helmet>
        <title>Contact Us - Your Company Name</title>
        <meta
          name="description"
          content="Get in touch with Your Company Name. Find our office location, contact details, and explore career opportunities with us."
        />
        <meta
          name="keywords"
          content="contact us, your company name, office location, career opportunities"
        />
        <link rel="canonical" href="https://www.yourcompany.com/contact" />
        <meta property="og:title" content="Contact Us - Your Company Name" />
        <meta
          property="og:description"
          content="Get in touch with Your Company Name. Find our office location, contact details, and explore career opportunities with us."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.yourcompany.com/contact" />
        <meta property="og:image" content={assets.contact_image} />
      </Helmet>
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
