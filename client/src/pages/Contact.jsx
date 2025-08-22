import { Helmet } from "react-helmet";
import { useState } from "react";
import {
  Mail, Phone, MapPin, Clock, Send, Stethoscope, Calendar,
  UserCheck, Heart, Shield, Award, Video, MessageCircle,
  Headphones, Globe, CheckCircle, Star, Users, Building,
  PhoneCall, Zap, AlertTriangle
} from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    ageGroup: '',
    specialty: '',
    serviceType: '',
    insurance: '',
    healthConcern: '',
    consent: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('شكراً لك! سيتم التواصل معك قريباً من فريقنا الطبي');
  };

  const assets = {
    contact_image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&h=800&fit=crop&crop=center"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50" style={{ "--color-primary": "#00BCD4", "--color-accent": "#009688", "--color-primary-dark": "#00ACC1" }}>
      <Helmet>
        <title>Contact MedConnect - Premium Healthcare Platform</title>
        <meta
          name="description"
          content="Contact MedConnect for world-class healthcare services. Book appointments with top specialists, access telemedicine, and get 24/7 medical support."
        />
        <meta
          name="keywords"
          content="healthcare platform, medical appointments, telemedicine, specialist doctors, medical consultation, health services"
        />
        <link rel="canonical" href="https://www.medconnect.com/contact" />
        <meta property="og:title" content="Contact MedConnect - Premium Healthcare Platform" />
        <meta
          property="og:description"
          content="World-class healthcare at your fingertips. Connect with top medical specialists and access premium healthcare services."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.medconnect.com/contact" />
        <meta property="og:image" content={assets.contact_image} />
      </Helmet>

      <div className="px-4 md:px-16 lg:px-24 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center p-4 rounded-full mb-6 shadow-lg bg-gradient-to-br from-cyan-400 to-teal-500">
            <Stethoscope size={40} className="text-white" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-gray-800 via-cyan-400 to-teal-500 bg-clip-text text-transparent leading-tight">
            Connect with Excellence
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
            Experience premium healthcare like never before. Our world-class medical platform
            connects you with top specialists, cutting-edge treatments, and personalized care.
          </p>
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center">
                <CheckCircle size={16} className="text-teal-500 mr-2" />
                <span>500+ Specialists</span>
              </div>
              <div className="flex items-center">
                <CheckCircle size={16} className="text-teal-500 mr-2" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center">
                <CheckCircle size={16} className="text-teal-500 mr-2" />
                <span>Telemedicine Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Alert Banner */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 mb-12 text-white shadow-2xl max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Medical Emergency?</h3>
                <p className="text-white/90">Don't wait - Get immediate help now</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button className="bg-white text-red-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors">
                Call 911
              </button>
              <button className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl font-bold hover:bg-white/30 transition-colors">
                Emergency Chat
              </button>
            </div>
          </div>
        </div>

        {/* Contact Methods Grid */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 mb-20">
          {/* Instant Consultation */}
          <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br from-cyan-400 to-cyan-600">
              <Video size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Instant Video Consultation</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">Connect with specialists in seconds via secure video calls</p>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Response Time</span>
                <span className="font-semibold text-gray-800">2 minutes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Availability</span>
                <span className="font-semibold text-teal-600">24/7 Available</span>
              </div>
            </div>
            <button className="w-full py-3 rounded-xl font-semibold transition-all duration-300 text-white hover:shadow-lg bg-gradient-to-r from-cyan-400 to-cyan-600 flex items-center justify-center">
              <Send size={20} className="mr-3" />
              Start Video Call
            </button>
            <p className="text-center text-sm text-gray-600 mt-4">
              <Shield size={16} className="inline mr-1" />
              Your information is encrypted and HIPAA compliant. Average response time: 15 minutes.
            </p>
          </div>

          {/* Priority Phone Support */}
          <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br from-teal-500 to-teal-700">
              <PhoneCall size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Priority Phone Support</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">Speak directly with our medical coordinators</p>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Medical Line</span>
                <span className="font-bold text-gray-800">+1 (800) MED-CARE</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Wait Time</span>
                <span className="font-semibold text-teal-600">Average 30s</span>
              </div>
            </div>
            <button className="w-full py-3 rounded-xl font-semibold transition-all duration-300 text-white hover:shadow-lg bg-gradient-to-r from-teal-500 to-teal-700">
              Call Now
            </button>
          </div>

          {/* Live Chat Support */}
          <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <MessageCircle size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Smart AI Chat Support</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">Get instant answers with our AI-powered chat</p>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Response</span>
                <span className="font-semibold text-gray-800">Instant</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Languages</span>
                <span className="font-semibold text-teal-600">50+ Supported</span>
              </div>
            </div>
            <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
              Start Chat
            </button>
          </div>

          {/* Premium Concierge */}
          <div className="group bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-2 border-amber-200">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Award size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">VIP Medical Concierge</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">Dedicated personal health coordinator for premium members</p>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Dedicated Manager</span>
                <span className="font-semibold text-gray-800">Personal</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Access Level</span>
                <span className="font-semibold text-amber-600">Premium Only</span>
              </div>
            </div>
            <button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
              Contact Concierge
            </button>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="grid lg:grid-cols-2 gap-16 mb-20">
          {/* Left Side - Premium Features */}
          <div className="space-y-8">
            {/* Medical Centers Showcase */}
            <div className="bg-white rounded-3xl p-10 shadow-2xl border border-gray-100">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mr-4 bg-gradient-to-br from-cyan-400 to-teal-500">
                  <Building size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Our Medical Network</h3>
                  <p className="text-gray-600">World-class facilities across the region</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="relative">
                  <div className="absolute left-0 top-0 w-1 h-full rounded-full bg-cyan-400"></div>
                  <div className="pl-8">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-bold text-gray-800">MedConnect Premier Center</h4>
                      <div className="flex items-center">
                        <Star size={16} className="text-yellow-400 mr-1" />
                        <span className="text-sm font-semibold">4.9</span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3">Downtown Medical District, Tower A, Floors 15-25</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="font-semibold text-gray-800">Specialties</div>
                        <div className="text-gray-600">Cardiology, Neurology, Oncology</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="font-semibold text-gray-800">Technology</div>
                        <div className="text-gray-600">AI Diagnostics, Robot Surgery</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute left-0 top-0 w-1 h-full rounded-full bg-gray-300"></div>
                  <div className="pl-8">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-bold text-gray-800">Family Care Hub</h4>
                      <div className="flex items-center">
                        <Star size={16} className="text-yellow-400 mr-1" />
                        <span className="text-sm font-semibold">4.8</span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3">Suburban Health Complex, Building B</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="font-semibold text-gray-800">Focus</div>
                        <div className="text-gray-600">Family Medicine, Pediatrics</div>
                      </div>
                      <div className="bg-pink-50 p-3 rounded-lg">
                        <div className="font-semibold text-gray-800">Services</div>
                        <div className="text-gray-600">Wellness, Preventive Care</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute left-0 top-0 w-1 h-full rounded-full bg-gray-300"></div>
                  <div className="pl-8">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-bold text-gray-800">24/7 Emergency Center</h4>
                      <div className="flex items-center">
                        <Zap size={16} className="text-red-500 mr-1" />
                        <span className="text-sm font-semibold text-red-600">Always Open</span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3">Emergency Medical Plaza, All Floors</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-red-50 p-3 rounded-lg">
                        <div className="font-semibold text-gray-800">Response Time</div>
                        <div className="text-gray-600">10 minutes</div>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <div className="font-semibold text-gray-800">Capabilities</div>
                        <div className="text-gray-600">Trauma, ICU, Surgery</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Global Stats */}
            <div className="bg-gradient-to-br from-cyan-400 to-teal-500 rounded-3xl p-10 text-white shadow-2xl">
              <h3 className="text-2xl font-bold mb-8 flex items-center">
                <Globe size={28} className="mr-3" />
                Global Healthcare Impact
              </h3>
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-black mb-2">2.5M+</div>
                  <div className="text-white/80 font-medium">Patients Served</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black mb-2">500+</div>
                  <div className="text-white/80 font-medium">Expert Doctors</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black mb-2">50+</div>
                  <div className="text-white/80 font-medium">Countries</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black mb-2">98.5%</div>
                  <div className="text-white/80 font-medium">Satisfaction Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Advanced Contact Form */}
          <div className="bg-white rounded-3xl p-10 shadow-2xl border border-gray-100">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Get Premium Medical Care</h2>
              <p className="text-gray-600 leading-relaxed">
                Fill out this form to connect with our medical team. We'll match you with the right specialist
                and provide personalized healthcare solutions.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-800 font-semibold mb-3">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-cyan-400 transition-all duration-300 bg-gray-50 focus:bg-white"
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-800 font-semibold mb-3">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-cyan-400 transition-all duration-300 bg-gray-50 focus:bg-white"
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-800 font-semibold mb-3">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-cyan-400 transition-all duration-300 bg-gray-50 focus:bg-white"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-800 font-semibold mb-3">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-cyan-400 transition-all duration-300 bg-gray-50 focus:bg-white"
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-800 font-semibold mb-3">Age Group</label>
                  <select
                    name="ageGroup"
                    value={formData.ageGroup}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-cyan-400 transition-all duration-300 bg-gray-50 focus:bg-white"
                  >
                    <option value="">Select age group</option>
                    <option value="0-18">0-18 years</option>
                    <option value="19-35">19-35 years</option>
                    <option value="36-55">36-55 years</option>
                    <option value="56+">56+ years</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-800 font-semibold mb-3">Medical Specialty Required *</label>
                <select
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-cyan-400 transition-all duration-300 bg-gray-50 focus:bg-white"
                  required
                >
                  <option value="">Select medical specialty</option>
                  <option value="cardiology">🫀 Cardiology - Heart & Cardiovascular</option>
                  <option value="neurology">🧠 Neurology - Brain & Nervous System</option>
                  <option value="orthopedics">🦴 Orthopedics - Bones & Joints</option>
                  <option value="pediatrics">👶 Pediatrics - Children's Health</option>
                  <option value="womens-health">🤱 Women's Health & Gynecology</option>
                  <option value="oncology">🔬 Oncology - Cancer Treatment</option>
                  <option value="internal-medicine">😷 Internal Medicine</option>
                  <option value="pulmonology">🫁 Pulmonology - Respiratory</option>
                  <option value="endocrinology">💊 Endocrinology - Hormones</option>
                  <option value="dermatology">🧬 Dermatology - Skin Care</option>
                  <option value="ophthalmology">👁️ Ophthalmology - Eye Care</option>
                  <option value="psychiatry">🧠 Psychiatry - Mental Health</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-800 font-semibold mb-3">Service Type *</label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-cyan-400 transition-all duration-300 bg-gray-50 focus:bg-white"
                  required
                >
                  <option value="">Select service type</option>
                  <option value="appointment">📅 Schedule Appointment</option>
                  <option value="telemedicine">💻 Telemedicine Consultation</option>
                  <option value="in-person">🏥 In-Person Visit</option>
                  <option value="second-opinion">🔄 Second Opinion</option>
                  <option value="prescription">💊 Prescription Refill</option>
                  <option value="records">📋 Medical Records</option>
                  <option value="screening">🩺 Health Screening</option>
                  <option value="urgent">🚨 Urgent Care</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-800 font-semibold mb-3">Insurance Information</label>
                <select
                  name="insurance"
                  value={formData.insurance}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-cyan-400 transition-all duration-300 bg-gray-50 focus:bg-white"
                >
                  <option value="">Select insurance provider</option>
                  <option value="private">Private Insurance</option>
                  <option value="medicare">Medicare</option>
                  <option value="medicaid">Medicaid</option>
                  <option value="self-pay">Self-Pay</option>
                  <option value="corporate">Corporate Insurance</option>
                  <option value="international">International Insurance</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-800 font-semibold mb-3">Describe Your Health Concern *</label>
                <textarea
                  rows={4}
                  name="healthConcern"
                  value={formData.healthConcern}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-cyan-400 transition-all duration-300 resize-none bg-gray-50 focus:bg-white"
                  placeholder="Please describe your symptoms, concerns, or medical questions in detail. This helps us match you with the right specialist."
                  required
                />
              </div>

              <div className="flex items-start space-x-3 bg-blue-50 p-4 rounded-2xl">
                <input
                  type="checkbox"
                  id="consent"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleInputChange}
                  className="mt-1 w-5 h-5"
                  required
                />
                <label htmlFor="consent" className="text-sm text-gray-600 leading-relaxed">
                  I consent to the processing of my health information in accordance with HIPAA regulations
                  and understand that this information will be used to provide me with appropriate medical care.
                  I also agree to receive appointment reminders and health updates.
                </label>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  className="w-full py-5 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center bg-gradient-to-r from-cyan-400 to-cyan-600"
                >
                  <Send size={20} className="mr-3" />
                  Connect with Medical Expert
                </button>
                <p className="text-center text-sm text-gray-500 mt-4">
                  <Shield size={16} className="inline mr-1" />
                  Your information is encrypted and HIPAA compliant. Average response time: 15 minutes.
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Premium Features Showcase */}
        <div className="bg-white rounded-3xl p-12 shadow-2xl border border-gray-100 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose MedConnect?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience healthcare reimagined with cutting-edge technology, world-class expertise, and personalized care.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br from-cyan-400 to-teal-500">
                <Zap size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Lightning Fast Response</h3>
              <p className="text-gray-600 leading-relaxed">
                Connect with specialists in under 2 minutes. Our AI-powered matching system ensures
                you're connected to the right doctor instantly.
              </p>
              <div className="mt-4 inline-flex items-center text-sm font-semibold text-cyan-600">
                <CheckCircle size={16} className="mr-2" />
                Average 90 seconds connection time
              </div>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Award size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">World-Class Specialists</h3>
              <p className="text-gray-600 leading-relaxed">
                Access to board-certified physicians from top medical institutions worldwide.
                Each doctor is thoroughly vetted and highly rated.
              </p>
              <div className="mt-4 inline-flex items-center text-sm font-semibold text-purple-600">
                <CheckCircle size={16} className="mr-2" />
                500+ verified specialists available
              </div>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Shield size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Bank-Level Security</h3>
              <p className="text-gray-600 leading-relaxed">
                Your health data is protected with military-grade encryption. HIPAA compliant
                with zero-knowledge architecture.
              </p>
              <div className="mt-4 inline-flex items-center text-sm font-semibold text-green-600">
                <CheckCircle size={16} className="mr-2" />
                256-bit encryption & HIPAA certified
              </div>
            </div>
          </div>
        </div>

        {/* Medical Excellence Stats */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 mb-20">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-8 text-white text-center shadow-xl">
            <Users size={48} className="mx-auto mb-4" />
            <div className="text-4xl font-black mb-2">2.5M+</div>
            <div className="text-blue-100 font-medium">Patients Treated</div>
            <div className="text-blue-200 text-sm mt-2">Across 50+ countries</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-8 text-white text-center shadow-xl">
            <Heart size={48} className="mx-auto mb-4" />
            <div className="text-4xl font-black mb-2">98.5%</div>
            <div className="text-green-100 font-medium">Success Rate</div>
            <div className="text-green-200 text-sm mt-2">Patient satisfaction</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-8 text-white text-center shadow-xl">
            <Clock size={48} className="mx-auto mb-4" />
            <div className="text-4xl font-black mb-2">24/7</div>
            <div className="text-purple-100 font-medium">Available</div>
            <div className="text-purple-200 text-sm mt-2">Emergency support</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 text-white text-center shadow-xl">
            <Star size={48} className="mx-auto mb-4" />
            <div className="text-4xl font-black mb-2">4.9/5</div>
            <div className="text-orange-100 font-medium">Rating</div>
            <div className="text-orange-200 text-sm mt-2">From 50K+ reviews</div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-3xl p-12 text-white text-center shadow-2xl">
          <h2 className="text-4xl font-bold mb-6">Ready to Experience Premium Healthcare?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join millions of patients who trust MedConnect for their healthcare needs.
            Get matched with the perfect specialist in minutes, not days.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6">
            <button
              className="px-10 py-5 font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center text-gray-800 bg-cyan-400 hover:bg-cyan-300"
            >
              <Calendar size={20} className="mr-3" />
              Book Appointment Now
            </button>
            <button className="px-10 py-5 bg-white/10 backdrop-blur-sm border-2 border-white/20 font-bold text-lg rounded-2xl hover:bg-white/20 transition-all duration-300 flex items-center">
              <Video size={20} className="mr-3" />
              Start Video Consultation
            </button>
          </div>
          <div className="flex items-center justify-center mt-8 space-x-8 text-sm text-gray-400">
            <div className="flex items-center">
              <CheckCircle size={16} className="mr-2 text-cyan-400" />
              <span>No waiting lists</span>
            </div>
            <div className="flex items-center">
              <CheckCircle size={16} className="mr-2 text-cyan-400" />
              <span>Insurance accepted</span>
            </div>
            <div className="flex items-center">
              <CheckCircle size={16} className="mr-2 text-cyan-400" />
              <span>100% confidential</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;