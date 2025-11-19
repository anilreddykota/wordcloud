import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {  Send, RefreshCw, Sparkles,  Settings, X, Save, History, Eye, ArrowLeft, Calendar, MessageSquare } from "lucide-react";
import io from "socket.io-client";

const socket = io("https://wordcloud-twql.onrender.com");

const SendResponses = () => {
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showResponsesView, setShowResponsesView] = useState(false);
  const [saveLocally, setSaveLocally] = useState(() => {
    return localStorage.getItem('wordcloud-save-locally') === 'true';
  });
  const [savedResponses, setSavedResponses] = useState(() => {
    const saved = localStorage.getItem('wordcloud-responses');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    socket.on("question", (newQuestion) => {
      setQuestions([newQuestion]);
      setResponses([[""]]);;
      setSubmitted(false);
    });

    return () => {
      socket.off("question");
    };
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('wordcloud-save-locally', saveLocally.toString());
  }, [saveLocally]);

  // Save responses to localStorage
  useEffect(() => {
    if (saveLocally) {
      localStorage.setItem('wordcloud-responses', JSON.stringify(savedResponses));
    }
  }, [savedResponses, saveLocally]);

  const handleChange = (questionIndex, value) => {
    const newResponses = [...responses];
    newResponses[questionIndex][0] = value;
    setResponses(newResponses);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const firstResponse = responses.flat().find((answer) => answer.trim());

    if (firstResponse) {
      setIsSubmitting(true);
      socket.emit("word", firstResponse);
      setSubmitted(true);
      
      // Save to localStorage if enabled
      if (saveLocally) {
        const responseData = {
          id: Date.now(),
          question: questions[0],
          response: firstResponse,
          timestamp: new Date().toISOString()
        };
        setSavedResponses(prev => [responseData, ...prev.slice(0, 49)]); // Keep last 50
      }
      
      // Simulate network delay for animation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setResponses([[""]]);;
      setIsSubmitting(false);
    }
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
    setShowResponsesView(false);
  };

  const showResponsesList = () => {
    setShowResponsesView(true);
  };

  const backToSettings = () => {
    setShowResponsesView(false);
  };

  const clearSavedResponses = () => {
    setSavedResponses([]);
    localStorage.removeItem('wordcloud-responses');
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black p-4 sm:p-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-5 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-400 rounded-full mix-blend-overlay filter blur-3xl opacity-5 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-slate-400 rounded-full mix-blend-overlay filter blur-3xl opacity-5 animate-pulse animation-delay-4000"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-xl mx-auto relative z-10"
      >
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="backdrop-blur-2xl bg-black/20 border border-white/10 rounded-3xl p-6 shadow-2xl ring-1 ring-white/5">
      
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
              Share Your Thoughts
            </h1>
            <p className="text-gray-400 text-sm">
              Your response will appear in the live word cloud
            </p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {questions.map((question, questionIndex) => (
              <motion.div
                key={questionIndex}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="backdrop-blur-2xl bg-black/20 border border-white/10 rounded-3xl p-6 shadow-2xl mb-6 hover:bg-black/30 hover:border-white/20 transition-all duration-300 ring-1 ring-white/5"
              >
                <motion.h3 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-xl font-bold text-white mb-6 text-center"
                >
                  {question}
                </motion.h3>
                <div className="relative">
                  {submitted ? (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="backdrop-blur-xl bg-gradient-to-r from-gray-800/80 to-gray-700/80 border border-gray-600/30 text-white text-sm font-semibold px-6 py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg ring-1 ring-white/10"
                    >
                      <Sparkles className="w-4 h-4 text-gray-300" />
                      <span>Response submitted successfully!</span>
                      <Sparkles className="w-4 h-4 text-gray-300" />
                    </motion.div>
                  ) : (
                    <motion.input
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      type="text"
                      value={responses[questionIndex]?.[0] || ""}
                      onChange={(e) => handleChange(questionIndex, e.target.value)}
                      maxLength="100"
                      className="w-full px-6 py-4 backdrop-blur-xl bg-black/30 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:bg-black/40 focus:border-white/30 outline-none transition-all duration-300 text-lg shadow-lg ring-1 ring-white/5"
                      placeholder="Type your response..."
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            disabled={isSubmitting || questions.length === 0 || submitted || !responses.flat().find((answer) => answer.trim())}
            className="w-full backdrop-blur-2xl bg-gradient-to-r from-gray-800/80 to-gray-900/80 border border-white/20 text-white py-4 px-8 rounded-2xl font-bold shadow-2xl hover:from-gray-700/80 hover:to-gray-800/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 text-lg relative overflow-hidden group ring-1 ring-white/10"
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {isSubmitting ? (
              <>
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-200" />
                <span>Submit Response</span>
                <Sparkles className="w-5 h-5 opacity-70 text-gray-300" />
              </>
            )}
          </motion.button>
        </form>
        
        {/* Floating particles */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, -120],
                opacity: [0, 0.6, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>
        
        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8"
        >
          <p className="text-gray-500 text-sm">
            Powered by <span className="text-gray-300 font-semibold">AniSol Tech</span>
          </p>
        </motion.div>
      </motion.div>

      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, duration: 0.3 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleSettings}
        className="fixed bottom-6 right-6 w-14 h-14 backdrop-blur-xl bg-gray-800/80 border border-white/20 rounded-full shadow-2xl flex items-center justify-center z-50 ring-1 ring-white/10 hover:bg-gray-700/80 transition-all duration-300"
      >
        <Settings className="w-6 h-6 text-white" />
      </motion.button>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={toggleSettings}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              className="backdrop-blur-2xl bg-black/40 border border-white/20 rounded-3xl p-6 max-w-md w-full shadow-2xl ring-1 ring-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  {showResponsesView ? (
                    <>
                      <button
                        onClick={backToSettings}
                        className="p-1 hover:bg-white/10 rounded-full transition-colors mr-2"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <History className="w-5 h-5" />
                      <span>Saved Responses</span>
                    </>
                  ) : (
                    <>
                      <Settings className="w-5 h-5" />
                      <span>Settings</span>
                    </>
                  )}
                </h3>
                <button
                  onClick={toggleSettings}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {showResponsesView ? (
                /* Saved Responses List View */
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {savedResponses.length === 0 ? (
                    <div className="text-center py-8">
                      <History className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">No saved responses yet</p>
                      <p className="text-gray-500 text-sm mt-1">Enable &quot;Save Responses&quot; to start collecting</p>
                    </div>
                  ) : (
                    savedResponses.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-200"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-gray-700/50 rounded-lg mt-0.5">
                            <MessageSquare className="w-4 h-4 text-gray-300" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-400 text-sm font-medium mb-1 truncate">
                              {item.question}
                            </p>
                            <p className="text-white font-medium mb-2 break-words">
                              "{item.response}"
                            </p>
                            <div className="flex items-center space-x-1 text-gray-500 text-xs">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(item.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              ) : (
                /* Settings View */
                <div className="space-y-4">
                  {/* Save Locally Toggle */}
                  <div className="flex items-center justify-between p-4 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl">
                    <div className="flex items-center space-x-3">
                      <Save className="w-5 h-5 text-gray-300" />
                      <div>
                        <p className="text-white font-medium">Save Responses</p>
                        <p className="text-gray-400 text-sm">Store responses locally on your device</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSaveLocally(!saveLocally)}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                        saveLocally ? 'bg-gray-600' : 'bg-gray-800'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-200 ${
                          saveLocally ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Saved Responses Count */}
                  {saveLocally && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-4 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <History className="w-5 h-5 text-gray-300" />
                          <div>
                            <p className="text-white font-medium">
                              {savedResponses.length} Saved Response{savedResponses.length !== 1 ? 's' : ''}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {savedResponses.length > 0 
                                ? `Last saved: ${new Date(savedResponses[0]?.timestamp).toLocaleDateString()}`
                                : 'No responses saved yet'
                              }
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {savedResponses.length > 0 && (
                            <>
                              <button
                                onClick={showResponsesList}
                                className="px-3 py-1 text-xs text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-colors flex items-center space-x-1"
                              >
                                <Eye className="w-3 h-3" />
                                <span>View</span>
                              </button>
                              <button
                                onClick={clearSavedResponses}
                                className="px-3 py-1 text-xs text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-colors"
                              >
                                Clear
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* App Info */}
                  <div className="p-4 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl">
                    <p className="text-gray-400 text-sm text-center">
                      Word Cloud Response Panel v1.0
                    </p>
                    <p className="text-gray-500 text-xs text-center mt-1">
                      Built with React & Socket.io
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SendResponses;