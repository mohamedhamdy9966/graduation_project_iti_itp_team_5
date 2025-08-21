import React, { useState, useContext, useEffect, useRef } from "react";
import axios from "axios";
import { assets } from "../assets/assets";
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
  const chatContainerRef = useRef(null);
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
  // Updated startRecording function
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      // Try different MIME types for better compatibility
      const mimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/wav",
        "audio/mp4",
      ];

      let selectedMimeType = "audio/webm";
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }

      console.log("Using MIME type:", selectedMimeType);

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
      });

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: selectedMimeType,
        });

        console.log("Audio blob created:", {
          size: audioBlob.size,
          type: audioBlob.type,
        });

        setAudioBlob(audioBlob);

        // Stop all tracks to release the microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start(1000); // Collect data every second
      setIsRecording(true);
      toast.info("Recording started...");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Failed to access microphone: " + error.message);
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
  // Updated handleSendMessage function for better audio handling
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
    const currentAudioBlob = audioBlob; // Store reference before clearing
    setAudioBlob(null);
    setSelectedFile(null);
    setIsLoading(true);

    try {
      let response;

      if (currentAudioBlob) {
        // Handle audio upload and transcription
        const formData = new FormData();
        formData.append("audio", currentAudioBlob, "recording.webm");

        const endpoint = token
          ? `${backendUrl}/api/user/upload-audio`
          : `${backendUrl}/api/user/upload-audio-public`;

        console.log("Uploading audio to:", endpoint);

        const audioResponse = await axios.post(endpoint, formData, {
          headers: {
            ...(token ? { token } : {}),
            "Content-Type": "multipart/form-data",
          },
          timeout: 90000, // 90 seconds for audio processing
        });

        console.log("Audio upload response:", audioResponse.data);

        // Check the response structure
        if (audioResponse.data.success) {
          // Check if transcription was successful
          if (audioResponse.data.transcriptionSuccess) {
            console.log(
              "Transcription successful:",
              audioResponse.data.transcription
            );

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
            // Upload succeeded but transcription failed
            console.log(
              "Transcription failed:",
              audioResponse.data.transcription
            );

            const errorMessage = {
              sender: "bot",
              text: `Audio uploaded successfully, but ${audioResponse.data.transcription}`,
            };
            setMessages((prevMessages) => [...prevMessages, errorMessage]);
            setIsLoading(false);
            return;
          }
        } else {
          // Upload failed
          throw new Error(audioResponse.data.message || "Audio upload failed");
        }
      } else if (selectedFile) {
        // Handle file upload (existing code)
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

      // Handle the final response
      if (response && response.data.success) {
        const botMessage = {
          sender: "bot",
          text: response.data.reply || "Response received.",
        };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } else if (response) {
        throw new Error(response.data.message || "Failed to get response");
      }
    } catch (error) {
      console.error("Error processing message:", error);

      let errorText = "Sorry, something went wrong. Please try again.";

      // Provide more specific error messages
      if (error.code === "ECONNABORTED") {
        errorText =
          "Request timed out. Please try with a shorter audio recording or check your connection.";
      } else if (error.response?.status === 413) {
        errorText =
          "File too large. Please try with a shorter audio recording.";
      } else if (error.response?.status === 400) {
        errorText =
          "Invalid request. Please try recording again or type your message.";
      } else if (error.message) {
        errorText = `Error: ${error.message}`;
      }

      const errorMessage = {
        sender: "bot",
        text: errorText,
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

  // Close chatbot when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        chatContainerRef.current &&
        !chatContainerRef.current.contains(event.target) &&
        !event.target.closest(".chatbot-toggle-button")
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="chatbot-toggle-button bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 flex items-center space-x-2 animate-bounce shadow-lg hover:shadow-indigo-500/50"
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
        <span className="hidden sm:inline">Chat</span>
      </button>
      {isOpen && (
        <div
          ref={chatContainerRef}
          className="mt-2 bg-white rounded-2xl shadow-2xl w-screen max-w-sm sm:max-w-md md:max-w-lg lg:w-96 h-[85vh] max-h-[32rem] sm:h-[32rem] flex flex-col overflow-hidden border border-indigo-100 transition-all duration-300 fixed bottom-16 right-0 sm:right-4 sm:bottom-20 animate-fade-in-up"
        >
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-3 h-3 bg-green-400 rounded-full absolute -top-1 -right-1 animate-ping"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full absolute -top-1 -right-1"></div>
              </div>
              <h2 className="text-lg font-semibold">Roshetta Assistant</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 focus:outline-none transition-transform duration-200 hover:scale-110"
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
          <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-indigo-50 to-white space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                } animate-fade-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl shadow-md transition-all duration-300 transform ${
                    msg.sender === "user"
                      ? "bg-indigo-100 text-indigo-900 hover:scale-105"
                      : "bg-white text-gray-800 border border-indigo-100 hover:scale-105"
                  }`}
                >
                  {msg.text && <p className="leading-relaxed">{msg.text}</p>}
                  {msg.audio && (
                    <audio
                      controls
                      src={msg.audio}
                      className="w-full mt-2 rounded-lg"
                    />
                  )}
                  {msg.file && (
                    <p className="mt-2 text-sm text-indigo-600 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                          clipRule="evenodd"
                        />
                      </svg>
                      File: {msg.file}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-white p-3 rounded-2xl shadow-md border border-indigo-100">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
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
                  className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 disabled:opacity-50 flex items-center transform hover:scale-105 active:scale-95 shadow-md hover:shadow-indigo-500/40"
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
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 disabled:opacity-50 flex items-center space-x-2 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-green-500/40`}
                  disabled={isLoading}
                >
                  {isRecording ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 animate-pulse"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="hidden xs:inline">Stop</span>
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
                      <span className="hidden xs:inline">Record</span>
                    </>
                  )}
                </button>
                <label className="flex-1 p-3 border border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-400 transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2 transform hover:scale-105 active:scale-95">
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
                  <span className="text-sm text-gray-600 hidden xs:inline">
                    Upload
                  </span>
                </label>
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
              </div>
              {audioBlob && (
                <div className="mt-2 p-3 bg-gray-100 rounded-xl animate-fade-in">
                  <audio
                    controls
                    src={URL.createObjectURL(audioBlob)}
                    className="w-full"
                  />
                </div>
              )}
              {selectedFile && (
                <div className="mt-2 p-3 bg-indigo-50 rounded-xl flex items-center justify-between animate-fade-in">
                  <span className="text-sm text-indigo-700 truncate">
                    {selectedFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-indigo-900 hover:text-indigo-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
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
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;

// Add these styles to your global CSS file or use a CSS-in-JS solution
const styles = `
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate3d(0, 20px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    transform: translate3d(0, -8px, 0);
  }
  70% {
    transform: translate3d(0, -4px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out;
}

.animate-bounce {
  animation: bounce 1s infinite;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* Responsive breakpoints */
@media (max-width: 640px) {
  .xs\\:hidden {
    display: none;
  }
  
  .xs\\:inline {
    display: inline;
  }
}
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
