import React, { useState, useContext, useEffect, useRef } from "react";
import axios from "axios";
import { assets } from "../assets/assets_frontend/assets";
import { AppContext } from "./AppContext";
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
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesEndRef = useRef(null);
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_AUDIO_DURATION = 60; // 60 seconds

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

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (
      file &&
      (file.type.startsWith("image/") || file.type === "application/pdf")
    ) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File size exceeds 5MB limit.");
        return;
      }
      setSelectedFile(file);
      toast.info(`File selected: ${file.name}`);
    } else {
      toast.error("Please select an image or PDF file.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.info("Recording stopped.");
      setTimeout(() => {
        const audio = new Audio(URL.createObjectURL(audioBlob));
        audio.onloadedmetadata = () => {
          if (audio.duration > MAX_AUDIO_DURATION) {
            toast.error("Audio recording exceeds 60-second limit.");
            setAudioBlob(null);
          }
        };
      }, 100);
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

      // Add user allergies if available
      if (userData.allergy && Object.keys(userData.allergy).length > 0) {
        prompt += `\nUser allergies: ${Object.entries(userData.allergy)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ")}.`;
      } else {
        prompt += `\nUser has no recorded allergies.`;
      }

      // Add summary of past uploaded files
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
      prompt += `\nThe user has uploaded: ${fileInfo}. Analyze or summarize the content if relevant to their query.`;
    }

    prompt += `\nFor queries about booking appointments, checking availability, or user-specific details, provide answers based on the provided data. For general health questions, use your knowledge to give accurate advice. If unsure, suggest contacting support at ecommerce@kamma-pharma.com.`;
    return prompt;
  };

  // Handle sending message (text, audio, or file)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() && !audioBlob && !selectedFile) return;

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
            { sender: "user", text: `Uploaded file: ${selectedFile.name}` },
          ]);

          // Analyze image or PDF
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

      // Add user text message if present
      if (userMessageText) {
        setMessages((prev) => [
          ...prev,
          { sender: "user", text: userMessageText },
        ]);
        setInput("");
      }

      // Check for specialty in user message
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

      // Call Open AI API via backend
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
          text: "Sorry, something went wrong. Please try again or contact support at ecommerce@kamma-pharma.com.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load appointments when component mounts and token is available
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
      {/* Chatbot Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300"
      >
        <img
          src={assets.logo || "https://via.placeholder.com/24"}
          alt="Chat"
          className="w-32 h-32"
        />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-0 md:right-4 w-full md:w-96 h-[80vh] md:h-[500px] bg-white border border-indigo-100 shadow-2xl rounded-2xl flex flex-col transition-all duration-300">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 bg-indigo-50 border-b border-indigo-100 rounded-t-2xl">
            <h3 className="text-lg font-semibold text-indigo-900">
              Roshetta Assistant
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg text-indigo-700 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-300"
            >
              <img
                src={assets.cross_icon || "https://via.placeholder.com/20"}
                alt="Close"
                className="w-6 h-6"
              />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-indigo-100 text-indigo-900"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[70%] p-3 rounded-lg bg-indigo-100 text-indigo-900">
                  Typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-indigo-100 bg-indigo-50 rounded-b-2xl"
          >
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-3 border border-indigo-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                  disabled={isLoading}
                >
                  Send
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-3 rounded-lg ${
                    isRecording
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-green-600 text-white hover:bg-green-700"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300`}
                  disabled={isLoading}
                >
                  {isRecording ? "Stop Recording" : "Record Voice"}
                </button>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="p-3 border border-indigo-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  disabled={isLoading}
                />
              </div>
              {audioBlob && (
                <div className="mt-2">
                  <audio controls src={URL.createObjectURL(audioBlob)} />
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
