import  { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Shield, Clock, Trash2, MessageCircle, Copy, Save, Plus, Archive, Play, Pause, Settings, Timer, Bookmark } from "lucide-react";
import io from "socket.io-client";

const socket = io("https://wordcloud-twql.onrender.com");

const STORAGE_KEY = 'wordcloud_questions';
const SAVED_QUESTIONS_KEY = 'wordcloud_saved_questions';

const AdminPanel = () => {
  const [question, setQuestion] = useState("");
  const [questions, setQuestions] = useState([]);
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [autoSendEnabled, setAutoSendEnabled] = useState(false);
  const [sendInterval, setSendInterval] = useState(30);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [intervalId, setIntervalId] = useState(null);

  // Load questions from localStorage on component mount
  useEffect(() => {
    const storedQuestions = localStorage.getItem(STORAGE_KEY);
    const storedSavedQuestions = localStorage.getItem(SAVED_QUESTIONS_KEY);
    
    if (storedQuestions) {
      try {
        setQuestions(JSON.parse(storedQuestions));
      } catch (error) {
        console.error('Error loading sent questions:', error);
      }
    }
    
    if (storedSavedQuestions) {
      try {
        setSavedQuestions(JSON.parse(storedSavedQuestions));
      } catch (error) {
        console.error('Error loading saved questions:', error);
      }
    }
    
    document.title = "Admin Panel | Word Cloud";
    
    // Cleanup interval on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  // Save questions to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
      if (questions.length > 0) {
        setSaveStatus('Saved');
        const timer = setTimeout(() => setSaveStatus(''), 2000);
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error('Error saving questions:', error);
      setSaveStatus('Error saving');
    }
  }, [questions]);

  // Save saved questions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SAVED_QUESTIONS_KEY, JSON.stringify(savedQuestions));
    } catch (error) {
      console.error('Error saving saved questions:', error);
    }
  }, [savedQuestions]);

  const addQuestion = async () => {
    if (question.trim()) {
      setIsSubmitting(true);
      socket.emit("question", question);
      
      setQuestions([
        ...questions,
        { text: question, timestamp: new Date().toISOString() }
      ]);
      
      setQuestion("");
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsSubmitting(false);
    }
  };

  const clearAllQuestions = () => {
    if (window.confirm('Are you sure you want to clear all questions? This cannot be undone.')) {
      setQuestions([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addQuestion();
    }
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const copyQuestion = (text, index) => {
    setQuestion(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1000);
  };

  const addToSavedQuestions = () => {
    if (question.trim()) {
      const newSavedQuestion = {
        id: Date.now(),
        text: question.trim(),
        timestamp: new Date().toISOString()
      };
      setSavedQuestions([...savedQuestions, newSavedQuestion]);
      setQuestion("");
    }
  };

  const sendSavedQuestion = async (questionText, questionId) => {
    socket.emit("question", questionText);
    setQuestions(prev => [
      ...prev,
      { text: questionText, timestamp: new Date().toISOString() }
    ]);
    // Remove from saved questions after sending
    setSavedQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const removeSavedQuestion = (questionId) => {
    setSavedQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const startAutoSend = () => {
    if (savedQuestions.length === 0) return;
    
    setAutoSendEnabled(true);
    setCurrentIndex(0);
    
    const id = setInterval(() => {
      setSavedQuestions(prev => {
        if (prev.length === 0) {
          setAutoSendEnabled(false);
          clearInterval(id);
          return prev;
        }
        
        const questionToSend = prev[0];
        socket.emit("question", questionToSend.text);
        
        setQuestions(prevSent => [
          ...prevSent,
          { text: questionToSend.text, timestamp: new Date().toISOString() }
        ]);
        
        return prev.slice(1);
      });
    }, sendInterval * 1000);
    
    setIntervalId(id);
  };

  const stopAutoSend = () => {
    setAutoSendEnabled(false);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
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
        className="max-w-6xl mx-auto relative z-10"
      >
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="backdrop-blur-2xl bg-black/20 border border-white/10 rounded-3xl p-6 shadow-2xl ring-1 ring-white/5 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-2xl border border-white/10">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Admin Panel
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  Manage word cloud questions and scheduling
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Auto-send controls */}
              <div className="flex items-center space-x-3 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-3">
                <div className="flex items-center space-x-2">
                  <Timer className="w-4 h-4 text-gray-300" />
                  <input
                    type="number"
                    value={sendInterval}
                    onChange={(e) => setSendInterval(Math.max(5, parseInt(e.target.value) || 30))}
                    className="w-16 bg-black/30 border border-white/20 rounded-lg px-2 py-1 text-white text-sm"
                    min="5"
                    disabled={autoSendEnabled}
                  />
                  <span className="text-gray-400 text-sm">sec</span>
                </div>
                
                {savedQuestions.length > 0 && (
                  <button
                    onClick={autoSendEnabled ? stopAutoSend : startAutoSend}
                    className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                      autoSendEnabled 
                        ? 'bg-red-500/20 border border-red-400/30 text-red-300 hover:bg-red-500/30'
                        : 'bg-green-500/20 border border-green-400/30 text-green-300 hover:bg-green-500/30'
                    }`}
                  >
                    {autoSendEnabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{autoSendEnabled ? 'Stop' : 'Start'} Auto-send</span>
                  </button>
                )}
              </div>
              
              {saveStatus && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-green-400 flex items-center backdrop-blur-md bg-green-500/10 border border-green-400/20 rounded-xl px-3 py-2"
                >
                  <Save className="w-4 h-4 mr-1" />
                  {saveStatus}
                </motion.span>
              )}
              
              {questions.length > 0 && (
                <motion.button
                  onClick={clearAllQuestions}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-red-300 text-sm hover:text-red-200 backdrop-blur-md bg-red-500/10 border border-red-400/20 rounded-xl px-3 py-2 transition-all duration-200"
                >
                  Clear All
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Question Input Section */}
        <motion.div
          className="backdrop-blur-2xl bg-black/20 border border-white/10 rounded-3xl p-6 shadow-2xl ring-1 ring-white/5 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-gray-300" />
              <span>Create New Question</span>
            </h3>
            
            <div className="relative">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your question..."
                className="w-full px-6 py-4 backdrop-blur-xl bg-black/30 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:bg-black/40 focus:border-white/30 outline-none transition-all duration-300 resize-none min-h-[120px] text-lg ring-1 ring-white/5"
              />
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <motion.button
                onClick={addToSavedQuestions}
                disabled={!question.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 backdrop-blur-xl bg-gray-700/60 border border-white/20 text-white rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ring-1 ring-white/10 hover:bg-gray-600/60"
              >
                <Bookmark className="w-5 h-5" />
                <span>Save for Later</span>
              </motion.button>
              
              <motion.button
                onClick={addQuestion}
                disabled={isSubmitting || !question.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 backdrop-blur-xl bg-gradient-to-r from-gray-800/80 to-gray-900/80 border border-white/20 text-white rounded-2xl font-bold shadow-2xl hover:from-gray-700/80 hover:to-gray-800/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ring-1 ring-white/10"
              >
                <Send className="w-5 h-5" />
                <span>Send Now</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Saved Questions Bucket */}
          <motion.div
            className="backdrop-blur-2xl bg-black/20 border border-white/10 rounded-3xl p-6 shadow-2xl ring-1 ring-white/5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Archive className="w-5 h-5 text-gray-300" />
                <h2 className="text-xl font-semibold text-white">Saved Questions</h2>
                <span className="px-2 py-1 bg-gray-600/50 text-gray-300 text-xs rounded-full">
                  {savedQuestions.length}
                </span>
              </div>
              {savedQuestions.length > 0 && (
                <span className="text-sm text-gray-400">
                  Next in {sendInterval}s
                </span>
              )}
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {savedQuestions.length === 0 ? (
                <div className="text-center py-8">
                  <Archive className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No saved questions yet</p>
                  <p className="text-gray-500 text-sm mt-1">Save questions to send them later</p>
                </div>
              ) : (
                savedQuestions.map((q, index) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium mb-2 break-words">{q.text}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimestamp(q.timestamp)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-3">
                        <motion.button
                          onClick={() => sendSavedQuestion(q.text, q.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 bg-green-500/20 border border-green-400/30 text-green-300 rounded-lg hover:bg-green-500/30 transition-all duration-200"
                          title="Send now"
                        >
                          <Send className="w-4 h-4" />
                        </motion.button>
                        
                        <motion.button
                          onClick={() => removeSavedQuestion(q.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 bg-red-500/20 border border-red-400/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-all duration-200 opacity-0 group-hover:opacity-100"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* Sent Questions List */}
          <motion.div
            className="backdrop-blur-2xl bg-black/20 border border-white/10 rounded-3xl p-6 shadow-2xl ring-1 ring-white/5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center space-x-2 mb-6">
              <MessageCircle className="w-5 h-5 text-gray-300" />
              <h2 className="text-xl font-semibold text-white">Sent Questions</h2>
              <span className="px-2 py-1 bg-gray-600/50 text-gray-300 text-xs rounded-full">
                {questions.length}
              </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {questions.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-8"
                  >
                    <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No questions sent yet</p>
                    <p className="text-gray-500 text-sm mt-1">Send questions to start the session</p>
                  </motion.div>
                ) : (
                  questions.map((q, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                      className="group backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium mb-2 break-words">{q.text}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimestamp(q.timestamp)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-3">
                          <motion.button
                            onClick={() => copyQuestion(q.text, index)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`p-2 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                              copiedIndex === index 
                                ? 'bg-green-500/20 border border-green-400/30 text-green-300' 
                                : 'bg-gray-600/20 border border-gray-500/30 text-gray-300 hover:bg-gray-600/30'
                            }`}
                            title="Copy to input"
                          >
                            <Copy className="w-4 h-4" />
                          </motion.button>
                          
                          <motion.button
                            onClick={() => removeQuestion(index)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 bg-red-500/20 border border-red-400/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-all duration-200 opacity-0 group-hover:opacity-100"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminPanel;