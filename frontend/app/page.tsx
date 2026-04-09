"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface ISpeechRecognition extends EventTarget {
  start(): void;
  stop(): void;
  continuous: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
}

export default function Home() {
  const [listening, setListening] = useState(false);
  const [text, setText] = useState("");
  const [status, setStatus] = useState("Click mic to start");

  let recognition: ISpeechRecognition | null = null;

  if (typeof window !== "undefined") {
    const SpeechRecognition = (
      window as unknown as {
        webkitSpeechRecognition: new () => ISpeechRecognition;
      }
    ).webkitSpeechRecognition;

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-IN";

    recognition.onresult = async (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setText(transcript);
      setStatus("Processing...");
      setListening(false);

      const res = await fetch("http://localhost:5000/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: transcript }),
      });

      const data = await res.json();
      setStatus(data.message);

      const speech = new SpeechSynthesisUtterance(data.message);
      speechSynthesis.speak(speech);
    };
  }

  const startListening = () => {
    if (!recognition) return;
    recognition.start();
    setListening(true);
    setStatus("Listening...");
  };

  return (
    <div className="flex items-center justify-center h-screen text-white">
      <div className="text-center space-y-6">
        {/* Title */}
        <h1 className="text-4xl font-bold tracking-wide">AI Voice Agent</h1>

        {/* Mic Button */}
        <div className="relative flex items-center justify-center">
          {/* Animated Rings */}
          {listening && (
            <>
              <motion.div
                className="absolute w-40 h-40 rounded-full bg-green-500/20"
                animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <motion.div
                className="absolute w-40 h-40 rounded-full bg-green-400/20"
                animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </>
          )}

          {/* Mic */}
          <motion.button
            onClick={startListening}
            whileTap={{ scale: 0.9 }}
            className={`text-6xl p-6 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 ${
              listening ? "glow" : ""
            }`}
          >
            🎤
          </motion.button>
        </div>

        {/* Status */}
        <p className="text-gray-400">{status}</p>

        {/* Transcript Card */}
        {text && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-lg"
          >
            <p className="text-lg text-gray-200">{text}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
