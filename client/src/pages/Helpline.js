import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FaHeadset,
  FaTelegramPlane,
  FaWhatsapp,
  FaFacebookMessenger,
  FaPaperPlane,
  FaImage,
  FaVideo,
} from "react-icons/fa";
import { useHelpline } from "../contexts/HelplineContext";
import { helplineAPI } from "../services/api";

const Helpline = () => {
  const { messages, loadMessages, sendMessage, markAsRead } = useHelpline();
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
    markAsRead();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await sendMessage(text.trim());
    setText("");
  };

  const handleFileChange = async (e, typeHint) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await helplineAPI.sendWithAttachment("[Attachment]", file, typeHint);
      await loadMessages();
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-3xl font-bold text-white">Helpline & Support</h1>
        <p className="text-dark-300">
          Chat with admins here or reach us via Telegram, WhatsApp, or Facebook.
        </p>
      </motion.div>

      {/* External Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gaming-card p-4"
      >
        <div className="flex flex-wrap gap-3">
          <a
            href="https://t.me/Gamingdreamersupport"
            target="_blank"
            rel="noreferrer"
            className="btn-outline flex items-center gap-2"
          >
            <FaTelegramPlane /> Telegram
          </a>
          <a
            href="https://wa.me/message/TUBNKXNEN2KIM1?src=qr"
            target="_blank"
            rel="noreferrer"
            className="btn-outline flex items-center gap-2"
          >
            <FaWhatsapp /> WhatsApp
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=61579688351869&mibextid=ZbWKwL"
            target="_blank"
            rel="noreferrer"
            className="btn-outline flex items-center gap-2"
          >
            <FaFacebookMessenger /> Facebook Chat
          </a>
        </div>
      </motion.div>

      {/* Chat UI */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gaming-card p-0 overflow-hidden"
      >
        <div className="h-[60vh] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-dark-800">
            {messages.map((m) => (
              <div
                key={m._id}
                className={`max-w-[75%] ${
                  m.isFromAdmin ? "self-start" : "self-end ml-auto"
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-lg text-sm ${
                    m.isFromAdmin
                      ? "bg-dark-700 text-white"
                      : "bg-primary-500 text-white"
                  }`}
                >
                  {m.message}
                  {m.attachment && (
                    <div className="mt-2">
                      {m.messageType === "image" ? (
                        <img
                          src={m.attachment}
                          alt="attachment"
                          className="max-h-64 rounded"
                        />
                      ) : m.messageType === "video" ? (
                        <video
                          src={m.attachment}
                          controls
                          className="max-h-64 rounded"
                        />
                      ) : (
                        <a
                          href={m.attachment}
                          className="underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Download file
                        </a>
                      )}
                    </div>
                  )}
                  <div className="text-[10px] opacity-70 mt-1">
                    {new Date(m.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form
            onSubmit={handleSend}
            className="p-3 bg-dark-900 border-t border-dark-700 flex items-center gap-2"
          >
            <input
              type="text"
              className="input-field w-full"
              placeholder="Type your message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={uploading}
            />

            <button
              type="submit"
              className="btn-primary flex items-center gap-2"
              disabled={uploading || !text.trim()}
            >
              <FaPaperPlane /> Send
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Helpline;
