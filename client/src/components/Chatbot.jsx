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
  const getInitialGreeting = () => {
    if (userData && userData.name) {
      return `Hello ${userData.name}! I'm Roshetta Assistant. How can I assist you with your healthcare needs today? You can ask about your appointments, book new appointments, or get medical advice. You can also type, record a voice message, or upload a file.`;
    } else {
      return "Hello! I'm Roshetta Assistant. How can I assist you with your healthcare needs today? You can type, record a voice message, or upload a file. Please log in to access personalized features like booking appointments or viewing your medical history.";
    }
  };
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: getInitialGreeting(),
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
      }
    } else {
      prompt += `\nThis is an unauthenticated user. Do not assume any personal details unless provided in the message.`;
    }

    if (fileInfo) {
      prompt += `\nFile info: ${fileInfo}. Analyze it if relevant to the query.`;
    }

    if (doctors.length > 0) {
      prompt += `\nAvailable doctors: ${doctors
        .map((doc) => `${doc.name} (${doc.specialty}, Fees: ${doc.fees} EGP)`)
        .join(", ")}.`;
    }

    if (chatbotContext.labs && chatbotContext.labs.length > 0) {
      prompt += `\nAvailable labs: ${chatbotContext.labs
        .map((lab) => `${lab.name} (Services: ${lab.services.join(", ")})`)
        .join(", ")}.`;
    }

    return prompt;
  };

  // Handle sending message
  const handleSendMessage = async (event) => {
    event.preventDefault();

    if (!validateInput()) return;

    const userMessage = {
      sender: "user",
      text: input.trim(),
      ...(audioBlob ? { audio: URL.createObjectURL(audioBlob) } : {}),
      ...(selectedFile ? { file: selectedFile.name } : {}),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setAudioBlob(null);
    setSelectedFile(null);
    setIsLoading(true);

    try {
      let response;

      if (audioBlob) {
        // Handle audio upload and transcription
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");

        const endpoint = token
          ? `${backendUrl}/api/user/upload-audio`
          : `${backendUrl}/api/user/upload-audio-public`;

        const audioResponse = await axios.post(endpoint, formData, {
          headers: {
            ...(token ? { token } : {}),
            "Content-Type": "multipart/form-data",
          },
        });

        // Check if transcription was successful
        if (audioResponse.data.success) {
          // Successful transcription - proceed with chat
          const chatData = {
            message: audioResponse.data.transcription,
            fileInfo: `Audio transcription: ${audioResponse.data.transcription}`,
          };

          response = await axios.post(
            `${backendUrl}/api/user/analyze-text`,
            chatData,
            {
              headers: {
                ...(token ? { token } : {}),
                "Content-Type": "application/json",
              },
            }
          );
        } else {
          // Transcription failed - show error to user and don't proceed with chat
          const errorMessage = {
            sender: "bot",
            text:
              audioResponse.data.message ||
              "Audio transcription failed. Please try again or type your message.",
          };
          setMessages((prevMessages) => [...prevMessages, errorMessage]);
          setIsLoading(false);
          return; // Exit early, don't continue with chat processing
        }
      } else if (selectedFile) {
        // Handle file upload
        const formData = new FormData();
        formData.append("file", selectedFile);

        const endpoint = token
          ? `${backendUrl}/api/user/upload-file`
          : `${backendUrl}/api/user/upload-file-public`;

        const fileResponse = await axios.post(endpoint, formData, {
          headers: {
            ...(token ? { token } : {}),
            "Content-Type": "multipart/form-data",
          },
        });

        if (fileResponse.data.success) {
          // For PDF files, use the analysis if available
          let fileInfo = `Uploaded file: ${selectedFile.name} (${selectedFile.type})`;
          if (
            selectedFile.type === "application/pdf" &&
            fileResponse.data.analysis
          ) {
            fileInfo += `. Analysis: ${fileResponse.data.analysis}`;
          }

          const chatData = {
            message: input.trim() || "Please analyze this file.",
            fileInfo: fileInfo,
          };

          response = await axios.post(
            `${backendUrl}/api/user/analyze-text`,
            chatData,
            {
              headers: {
                ...(token ? { token } : {}),
                "Content-Type": "application/json",
              },
            }
          );
        } else {
          throw new Error(fileResponse.data.message);
        }
      } else {
        // Handle text-only message
        const chatData = {
          message: input.trim(),
        };

        response = await axios.post(
          `${backendUrl}/api/user/analyze-text`,
          chatData,
          {
            headers: {
              ...(token ? { token } : {}),
              "Content-Type": "application/json",
            },
          }
        );
      }

      if (response.data.success) {
        const botMessage = {
          sender: "bot",
          text: response.data.reply || "Response received.",
        };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      const errorMessage = {
        sender: "bot",
        text: `Sorry, something went wrong: ${error.message}. Please try again or contact support at ecommerce@kamma-pharma.com.`,
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (messages.length === 1) {
      setMessages([
        {
          sender: "bot",
          text: getInitialGreeting(),
        },
      ]);
    }
  }, [userData]);

  // Fetch appointments and context on mount
  useEffect(() => {
    fetchAppointments();
  }, [token, userData]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 flex items-center space-x-2"
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
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
        <span>Chat</span>
      </button>
      {isOpen && (
        <div className="mt-2 bg-white rounded-2xl shadow-2xl w-96 h-[32rem] flex flex-col overflow-hidden border border-indigo-100 transition-all duration-300">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Roshetta Assistant</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl shadow-md ${
                    msg.sender === "user"
                      ? "bg-indigo-100 text-indigo-900"
                      : "bg-white text-gray-800"
                  }`}
                >
                  {msg.text && <p>{msg.text}</p>}
                  {msg.audio && (
                    <audio controls src={msg.audio} className="w-full mt-2" />
                  )}
                  {msg.file && <p className="mt-2">File: {msg.file}</p>}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl shadow-md">
                  <p className="text-gray-500">Thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form
            onSubmit={handleSendMessage}
            className="p-4 bg-white border-t border-indigo-100"
          >
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200 disabled:opacity-50"
                  disabled={isLoading || isRecording}
                />
                <button
                  type="submit"
                  className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 disabled:opacity-50 flex items-center"
                  disabled={isLoading || isRecording}
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
