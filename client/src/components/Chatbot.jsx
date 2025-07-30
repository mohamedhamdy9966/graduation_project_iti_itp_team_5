import React, { useState, useContext, useEffect, useRef } from "react";
import axios from "axios";
import { assets } from "../assets/assets_frontend/assets";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const Chatbot = () => {
  axios.defaults.withCredentials = true;
  const { token, userData, doctors, backendUrl, chatbotContext } =
    useContext(AppContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I'm Roshetta Assistant. How can I assist you with your healthcare needs today? You can type, record a voice message, or upload a file.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesEndRef = useRef(null);
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  // File validation
  const validateInput = () => {
    if (!input.trim() && !audioBlob && !selectedFile) {
      toast.error("Message cannot be empty when no file is selected");
      return false;
    }
    if (selectedFile) {
      if (
        !selectedFile.type.startsWith("image/") &&
        selectedFile.type !== "application/pdf"
      ) {
        toast.error("File must be an image or PDF");
        return false;
      }
      if (selectedFile.size > MAX_FILE_SIZE) {
        toast.error("File must not exceed 5MB");
        return false;
      }
    }
    return true;
  };

  // Fetch user's appointments from backend
  const fetchAppointments = async () => {
    if (!token) {
      setAppointments([]);
      return;
    }
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/appointments`, {
        headers: { token },
      });
      if (data.success) {
        setAppointments(data.appointments);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to fetch appointments.");
    }
  };

  // Start audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setAudioBlob(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.info("Recording started...");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Failed to access microphone.");
    }
  };

  // Stop audio recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.info("Recording stopped.");
    }
  };

  // Construct context-aware system prompt
  const getSystemPrompt = (fileInfo = "") => {
    let prompt = `You are Roshetta Assistant, a helpful assistant for the Roshetta healthcare platform, which allows users to book appointments with doctors and labs in Egypt. The platform uses Egyptian Pounds (EGP) as currency. Provide accurate and concise answers related to healthcare, doctor appointments, lab bookings, or general queries. Users can send text, voice messages, or upload files (images or PDFs).`;

    if (token && userData) {
      prompt += `\nThe current user is ${
        userData.name || "unknown"
      }, with email ${userData.email || "unknown"}, blood type ${
        userData.bloodType || "not specified"
      }, and medical insurance ${
        userData.medicalInsurance || "not specified"
      }.`;

      if (userData.allergy && Object.keys(userData.allergy).length > 0) {
        prompt += `\nUser allergies: ${Object.entries(userData.allergy)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ")}.`;
      } else {
        prompt += `\nUser has no recorded allergies.`;
      }

      if (userData.uploadedFiles && userData.uploadedFiles.length > 0) {
        prompt += `\nThe user has previously uploaded the following files:\n${userData.uploadedFiles
          .map(
            (file, index) =>
              `${index + 1}. ${file.type} (Uploaded: ${new Date(
                file.createdAt
              ).toLocaleDateString()})${
                file.transcription
                  ? `, Transcription: ${file.transcription.substring(0, 50)}...`
                  : ""
              }`
          )
          .join("\n")}.`;
      } else {
        prompt += `\nThe user has no previously uploaded files.`;
      }
    } else {
      prompt += `\nThe user is not logged in. Provide general assistance based on the Roshetta platform's context.`;
    }

    if (token && appointments.length > 0) {
      prompt += `\nThe user has the following appointments:\n${appointments
        .map(
          (appt, index) =>
            `${index + 1}. With ${
              appt.docId
                ? `Dr. ${appt.docData?.name || "Doctor"}`
                : `Lab ${appt.labData?.name || "Lab"}`
            } on ${appt.slotDate} at ${appt.slotTime} (Amount: ${
              appt.amount
            } EGP, Status: ${
              appt.cancelled
                ? "Cancelled"
                : appt.isCompleted
                ? "Completed"
                : appt.payment
                ? "Paid, Scheduled"
                : "Pending Payment"
            })`
        )
        .join("\n")}.`;
    }

    if (chatbotContext.doctors.length > 0) {
      prompt += `\nAvailable doctors include: ${chatbotContext.doctors
        .map(
          (doc) =>
            `${doc.name} (Specialty: ${doc.specialty}, Fees: ${doc.fees} EGP)`
        )
        .join(", ")}.`;
    }

    if (chatbotContext.labs.length > 0) {
      prompt += `\nAvailable labs include: ${chatbotContext.labs
        .map((lab) => `${lab.name} (Services: ${lab.services.join(", ")})`)
        .join(", ")}.`;
    }

    if (fileInfo) {
      prompt += `\nThe user has uploaded: ${fileInfo}. Analyze or summarize the content if relevant to the query.`;
    }

    prompt += `\nFor queries about booking appointments, checking availability, or user-specific details, provide answers based on the provided data. For general health questions, use your knowledge to give accurate advice. If unsure, suggest contacting support at ecommerce@kamma-pharma.com.`;
    return prompt;
  };

  // Handle sending message (text, audio, or file)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!validateInput()) return;

    setIsLoading(true);

    if (!token && (audioBlob || selectedFile)) {
      toast.info(
        "Files uploaded as an unauthenticated user will be deleted after 24 hours."
      );
    }

    try {
      let userMessageText = input;
      let fileInfo = "";

      // Handle audio upload and transcription
      if (audioBlob) {
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");
        const uploadUrl = token
          ? `${backendUrl}/api/user/upload-audio`
          : `${backendUrl}/api/user/upload-audio-public`;
        const { data } = await axios.post(uploadUrl, formData, {
          headers: { token, "Content-Type": "multipart/form-data" },
        });
        if (data.success) {
          userMessageText = data.transcription;
          setMessages((prev) => [
            ...prev,
            { sender: "user", text: userMessageText },
          ]);
          setAudioBlob(null);
          toast.success("Audio transcribed successfully.");
        } else {
          throw new Error(data.message);
        }
      }

      // Handle file upload and analysis
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadUrl = token
          ? `${backendUrl}/api/user/upload-file`
          : `${backendUrl}/api/user/upload-file-public`;
        const { data } = await axios.post(uploadUrl, formData, {
          headers: { token, "Content-Type": "multipart/form-data" },
        });
        if (data.success) {
          fileInfo = `${selectedFile.name} (${selectedFile.type}) stored at ${data.fileUrl}`;
          setMessages((prev) => [
            ...prev,
            {
              sender: "user",
              text: `Uploaded file: ${selectedFile.name}`,
            },
          ]);

          if (selectedFile.type.startsWith("image/")) {
            const { data: analysisData } = await axios.post(
              `${backendUrl}/api/user/analyze-image`,
              { imageUrl: data.fileUrl },
              { headers: { token } }
            );
            if (analysisData.success) {
              fileInfo += `\nPrescription Analysis: ${analysisData.analysis}`;
            } else {
              throw new Error(analysisData.message);
            }
          } else if (selectedFile.type === "application/pdf") {
            const { data: pdfData } = await axios.post(
              `${backendUrl}/api/user/analyze-pdf`,
              formData,
              { headers: { token, "Content-Type": "multipart/form-data" } }
            );
            if (pdfData.success) {
              fileInfo += `\nPDF Text: ${pdfData.text}\nPrescription Analysis: ${pdfData.analysis}`;
            } else {
              throw new Error(pdfData.message);
            }
          }

          setSelectedFile(null);
          toast.success("File uploaded and analyzed successfully.");
        } else {
          throw new Error(data.message);
        }
      }

      if (userMessageText) {
        setMessages((prev) => [
          ...prev,
          { sender: "user", text: userMessageText },
        ]);
        setInput("");
      }

      const specialties = chatbotContext.doctors.map((doc) =>
        doc.specialty.toLowerCase()
      );
      const matchedSpecialty = specialties.find((specialty) =>
        userMessageText.toLowerCase().includes(specialty)
      );
      if (matchedSpecialty) {
        const { data } = await axios.get(
          `${backendUrl}/api/user/doctors-by-specialty?specialty=${matchedSpecialty}`
        );
        if (data.success) {
          fileInfo += `\nAvailable ${matchedSpecialty} doctors: ${data.doctors
            .map((doc) => `${doc.name} (Fees: ${doc.fees} EGP)`)
            .join(", ")}.`;
        }
      }

      const response = await axios.post(
        `${backendUrl}/api/user/analyze-text`,
        {
          prompt: getSystemPrompt(fileInfo),
          userMessage: userMessageText || `User uploaded file: ${fileInfo}`,
        },
        {
          headers: { token, "Content-Type": "application/json" },
        }
      );

      if (response.data.success) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: response.data.response },
        ]);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `Sorry, something went wrong: ${error.message}. Please try again or contact support at ecommerce@kamma-pharma.com.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAppointments();
    }
  }, [token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-full shadow-xl hover:shadow-2xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-400 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105 ${
          isOpen ? "rotate-0" : "rotate-0"
        }`}
      >
        <div className="relative">
          <img
            src={assets.roshettaLogo || "https://via.placeholder.com/24"}
            alt="Chat"
            className="w-10 h-10"
          />
          {!isOpen && (
            <div className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              <span className="text-white text-xs">!</span>
            </div>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-0 md:right-6 w-full md:w-96 h-[70vh] md:h-[600px] bg-white border border-gray-200 shadow-2xl rounded-t-2xl rounded-bl-2xl flex flex-col transition-all duration-300 overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={assets.logo || "https://via.placeholder.com/24"}
                  alt="Assistant"
                  className="w-10 h-10 rounded-full border-2 border-white"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Roshetta Assistant
                </h3>
                <p className="text-xs text-indigo-100">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-indigo-50 to-white">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 shadow-md rounded-bl-none"
                  }`}
                >
                  <p className="text-sm md:text-base">{msg.text}</p>
                  <div className="text-right mt-1">
                    <span className="text-xs opacity-70">
                      {new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[70%] p-4 rounded-2xl bg-white shadow-md rounded-bl-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce delay-100"></div>
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-gray-200 bg-white rounded-b-2xl"
          >
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-3 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
                  disabled={isLoading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-3 rounded-xl ${
                    isRecording
                      ? "bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700"
                      : "bg-gradient-to-r from-green-600 to-teal-500 text-white hover:from-green-700 hover:to-teal-600"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 disabled:opacity-50 flex items-center space-x-2`}
                  disabled={isLoading}
                >
                  {isRecording ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Record</span>
                    </>
                  )}
                </button>
                <label className="flex-1 p-3 border border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-400 transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-gray-600">Upload</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(event) => {
                      const file = event.currentTarget.files[0];
                      setSelectedFile(file);
                      if (file) {
                        toast.info(`File selected: ${file.name}`);
                      }
                    }}
                    className="hidden"
                    disabled={isLoading}
                  />
                </label>
              </div>
              {audioBlob && (
                <div className="mt-2 p-3 bg-gray-100 rounded-xl">
                  <audio
                    controls
                    src={URL.createObjectURL(audioBlob)}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
