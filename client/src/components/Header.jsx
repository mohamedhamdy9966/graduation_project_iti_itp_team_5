import React, { useEffect } from "react";
import { FaCalendarAlt, FaPhoneAlt, FaArrowRight } from "react-icons/fa";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { assets } from "../assets/assets_frontend/assets";

const Header = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: false
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [controls, inView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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

  const imageVariants = {
    hidden: { x: 100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.2, 0.65, 0.3, 0.9]
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={containerVariants}
      className="relative overflow-hidden py-10 bg-gradient-to-br from-[var(--color-primary-dark)] to-[var(--color-primary)]"
    >
      {/* Animated background elements */}
      <motion.div 
        className="absolute top-0 left-0 w-full h-full opacity-10"
        animate={{
          background: [
            "radial-gradient(circle at 20% 30%, var(--color-accent) 0%, transparent 20%)",
            "radial-gradient(circle at 80% 70%, var(--color-primary-light) 0%, transparent 20%)",
            "radial-gradient(circle at 40% 60%, var(--color-accent) 0%, transparent 20%)"
          ]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear"
        }}
      />

      <div className="container mx-auto px-6 md:px-10 lg:px-20 py-16 md:py-24 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left Content */}
          <motion.div 
            className="w-full lg:w-1/2 space-y-8"
            variants={containerVariants}
          >
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--color-text-white)] leading-tight"
              variants={itemVariants}
            >
              Premium Healthcare <br />
              <span className="text-[var(--color-primary-light)]">At Your Fingertips</span>
            </motion.h1>

            <motion.div 
              className="flex items-center gap-4"
              variants={itemVariants}
            >
              <img 
                className="w-28 animate-pulse-slow"
                src={assets.group_profiles} 
                alt="Happy patients" 
                // style={{ filter: "brightness(0) invert(1)" }}
              />
              <p className="text-[var(--color-text-white)] text-opacity-90">
                Trusted by thousands of patients nationwide.<br />
                Experience the future of medical appointments.
              </p>
            </motion.div>

            <motion.div 
              className="flex flex-wrap gap-4"
              variants={itemVariants}
            >
              <motion.a
                href="#booking"
                className="flex items-center gap-2 bg-[var(--color-primary-light)] hover:bg-white text-[var(--color-primary-dark)] font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaCalendarAlt className="text-lg" />
                Book Now
                <FaArrowRight className="ml-2" />
              </motion.a>

              {/* <motion.a
                href="#contact"
                className="flex items-center gap-2 bg-transparent hover:bg-white/10 text-[var(--color-text-white)] font-semibold px-8 py-4 rounded-full border-2 border-[var(--color-text-white)] transition-all duration-300 hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaPhoneAlt className="text-lg" />
                24/7 Support
              </motion.a> */}
            </motion.div>
          </motion.div>

          {/* Right Image */}
          <motion.div 
            className="w-full lg:w-1/2 relative"
            variants={imageVariants}
          >
            <div className="relative w-full max-w-2xl mx-auto">
              {/* Floating card effect */}
              <motion.div 
                className="absolute -inset-4 bg-[var(--color-primary-light)] rounded-3xl opacity-20  blur-2xl"
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.2, 0.3, 0.2]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Main image with floating animation */}
              <motion.img
                className="relative w-full h-auto rounded-2xl shadow-2xl"
                src={assets.header_img}
                alt="Doctor consultation"
                animate={{
                  y: [0, -10, 0]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Pulse animation elements */}
      <motion.div 
        className="absolute bottom-1/4 left-1/8 w-32 h-32 bg-[var(--color-accent)] rounded-full mix-blend-screen opacity-10"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute top-1/4 left-1/4 w-32 h-32  bg-[var(--color-accent)] rounded-full mix-blend-screen opacity-10"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
};

export default Header;