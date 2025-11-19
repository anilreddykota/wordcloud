import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, Maximize, Minimize, QrCode, X, Moon, Sun, Settings, Monitor } from "lucide-react";
import io from "socket.io-client";
import WordCloud from "./Cloud";


const socket = io("https://wordcloud-twql.onrender.com");

// WordCloud Component
const WordCloudComp = () => {
  const [words, setWords] = useState([]);
  const [question, setQuestion] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [showMinimalView, setShowMinimalView] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [contentVisibility, setContentVisibility] = useState({
    header: true,
    question: true,
    controls: true
  });
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    socket.on("word", (word) => {
      setWords((prevWords) => [...prevWords, word]);
    });

    socket.on("question", (newQuestion) => {
      setQuestion(newQuestion);
      setWords([]);

    //   window.location.reload();
    });

    return () => {
      socket.off("word");
      socket.off("question");
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  const toggleQRModal = () => {
    setShowQRModal(!showQRModal);
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const toggleMinimalView = () => {
    setShowMinimalView(!showMinimalView);
    if (!showMinimalView) {
      setContentVisibility({
        header: false,
        question: true,
        controls: false
      });
    } else {
      setContentVisibility({
        header: true,
        question: true,
        controls: true
      });
    }
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // Generate QR code URL using a free QR code API
  const generateQRCodeURL = (text) => {
    const encodedText = encodeURIComponent(text);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedText}`;
  };

  const currentURL = window.location.origin;

  // Calculate responsive dimensions
  const getWordCloudDimensions = () => {
    if (isFullscreen) {
      return {
        width: windowSize.width - 100, // Leave some margin in fullscreen
        height: windowSize.height - 200 // Account for header and padding
      };
    }
    
    const containerWidth = Math.min(windowSize.width - 64, 1200); // 64px for padding, max 1200px
    const containerHeight = Math.min(windowSize.height * 0.6, 600); // 60% of viewport height, max 600px
    
    return {
      width: Math.max(containerWidth * 0.9, 400), // 90% of container, min 400px
      height: Math.max(containerHeight, 300) // min 300px
    };
  };

  const { width: cloudWidth, height: cloudHeight } = getWordCloudDimensions();

  const themeClasses = isDarkTheme 
    ? "min-h-screen w-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black" 
    : "min-h-screen w-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50";

  const cardClasses = isDarkTheme
    ? "bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 shadow-2xl"
    : "bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl";

  const textClasses = isDarkTheme
    ? "text-gray-100"
    : "text-gray-800";

  return (
    <div className={`${themeClasses} ${isFullscreen ? 'p-2' : 'p-8'} transition-all duration-500`}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={isFullscreen ? "w-full h-full" : "max-w-6xl mx-auto"}
      >
        <AnimatePresence>
          {contentVisibility.header && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex items-center justify-between ${isFullscreen ? 'mb-4' : 'mb-8'}`}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${isDarkTheme ? 'bg-blue-500/20' : 'bg-blue-500/10'} backdrop-blur-sm`}>
                  <Cloud className={`w-8 h-8 ${isDarkTheme ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <div>
                  <h1 className={`text-3xl font-bold ${textClasses} tracking-tight`}>
                    Word Cloud
                  </h1>
                  <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'} font-medium`}>
                    by AniSol Tech
                  </p>
                </div>
              </div>
              
              {contentVisibility.controls && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleSettings}
                    className={`p-3 rounded-xl transition-all duration-200 ${
                      isDarkTheme 
                        ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white border border-gray-600/30' 
                        : 'bg-white/50 hover:bg-white/80 text-gray-600 hover:text-gray-800 border border-gray-200/50'
                    } backdrop-blur-sm hover:scale-105 shadow-lg hover:shadow-xl`}
                    title="Settings"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={toggleMinimalView}
                    className={`p-3 rounded-xl transition-all duration-200 ${
                      showMinimalView
                        ? isDarkTheme
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
                        : isDarkTheme
                          ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white border border-gray-600/30'
                          : 'bg-white/50 hover:bg-white/80 text-gray-600 hover:text-gray-800 border border-gray-200/50'
                    } backdrop-blur-sm hover:scale-105 shadow-lg hover:shadow-xl`}
                    title="Toggle Minimal View"
                  >
                    <Monitor className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={toggleTheme}
                    className={`p-3 rounded-xl transition-all duration-200 ${
                      isDarkTheme 
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                        : 'bg-gray-800/10 text-gray-700 border border-gray-300/30'
                    } backdrop-blur-sm hover:scale-105 shadow-lg hover:shadow-xl`}
                    title={isDarkTheme ? "Switch to Light Theme" : "Switch to Dark Theme"}
                  >
                    {isDarkTheme ? (
                      <Sun className="w-5 h-5" />
                    ) : (
                      <Moon className="w-5 h-5" />
                    )}
                  </button>
                  
                  <button
                    onClick={toggleQRModal}
                    className={`p-3 rounded-xl transition-all duration-200 ${
                      isDarkTheme 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-green-500/10 text-green-600 border border-green-500/20'
                    } backdrop-blur-sm hover:scale-105 shadow-lg hover:shadow-xl`}
                    title="Show QR Code"
                  >
                    <QrCode className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={toggleFullscreen}
                    className={`p-3 rounded-xl transition-all duration-200 ${
                      isDarkTheme 
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                        : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                    } backdrop-blur-sm hover:scale-105 shadow-lg hover:shadow-xl`}
                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                  >
                    {isFullscreen ? (
                      <Minimize className="w-5 h-5" />
                    ) : (
                      <Maximize className="w-5 h-5" />
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {question && contentVisibility.question && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`${cardClasses} rounded-2xl p-6 ${isFullscreen ? 'mb-4' : 'mb-8'} transition-all duration-300`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-8 rounded-full ${isDarkTheme ? 'bg-blue-400' : 'bg-blue-500'}`}></div>
                <h2 className={`text-xl font-bold ${isDarkTheme ? 'text-blue-400' : 'text-blue-600'} leading-tight`}>
                  {question}
                </h2>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          layout
          className={`${cardClasses} rounded-2xl ${isFullscreen ? 'p-4' : 'p-8'} transition-all duration-300 overflow-hidden`}
        >
          <WordCloud 
            words={words} 
            question={question} 
            width={cloudWidth} 
            height={cloudHeight}
            theme={isDarkTheme ? 'dark' : 'light'}
          />
        </motion.div>

        {/* Settings Modal */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={toggleSettings}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className={`${cardClasses} rounded-2xl p-6 max-w-md w-full`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl font-bold ${textClasses}`}>Display Settings</h3>
                  <button
                    onClick={toggleSettings}
                    className={`p-2 rounded-xl transition-colors ${
                      isDarkTheme 
                        ? 'hover:bg-gray-700/50 text-gray-400 hover:text-gray-200' 
                        : 'hover:bg-gray-100/50 text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className={`font-semibold mb-3 ${textClasses}`}>Content Visibility</h4>
                    <div className="space-y-3">
                      {Object.entries(contentVisibility).map(([key, value]) => (
                        <label key={key} className="flex items-center justify-between">
                          <span className={`capitalize ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                            {key === 'header' ? 'Header & Logo' : key === 'question' ? 'Question Display' : 'Control Buttons'}
                          </span>
                          <button
                            onClick={() => setContentVisibility(prev => ({ ...prev, [key]: !prev[key] }))}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              value
                                ? isDarkTheme ? 'bg-blue-500' : 'bg-blue-600'
                                : isDarkTheme ? 'bg-gray-700' : 'bg-gray-300'
                            }`}
                          >
                            <div
                              className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                                value ? 'translate-x-6' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className={`border-t ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'} pt-4`}>
                    <h4 className={`font-semibold mb-3 ${textClasses}`}>Presentation Mode</h4>
                    <p className={`text-sm mb-3 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                      Optimized for projector display with minimal distractions
                    </p>
                    <button
                      onClick={toggleMinimalView}
                      className={`w-full p-3 rounded-xl font-medium transition-all duration-200 ${
                        showMinimalView
                          ? isDarkTheme
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
                          : isDarkTheme
                            ? 'bg-gray-700/50 text-gray-300 border border-gray-600/30 hover:bg-gray-600/50'
                            : 'bg-gray-100/50 text-gray-600 border border-gray-200/50 hover:bg-gray-200/50'
                      }`}
                    >
                      {showMinimalView ? 'Exit Presentation Mode' : 'Enter Presentation Mode'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* QR Code Modal */}
        <AnimatePresence>
          {showQRModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={toggleQRModal}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className={`${cardClasses} rounded-2xl p-6 max-w-sm w-full`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl font-bold ${textClasses}`}>Share Word Cloud</h3>
                  <button
                    onClick={toggleQRModal}
                    className={`p-2 rounded-xl transition-colors ${
                      isDarkTheme 
                        ? 'hover:bg-gray-700/50 text-gray-400 hover:text-gray-200' 
                        : 'hover:bg-gray-100/50 text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-center">
                  <div className="mb-6">
                    <div className={`p-4 rounded-2xl inline-block ${
                      isDarkTheme ? 'bg-white' : 'bg-gray-50'
                    }`}>
                      <img
                        src={generateQRCodeURL(currentURL)}
                        alt="QR Code for Word Cloud"
                        className="mx-auto rounded-lg"
                        width="200"
                        height="200"
                      />
                    </div>
                  </div>
                  <p className={`text-sm mb-3 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                    Scan to join the word cloud
                  </p>
                  <p className={`text-xs break-all p-3 rounded-xl ${
                    isDarkTheme 
                      ? 'bg-gray-800/50 text-gray-400 border border-gray-700/50' 
                      : 'bg-gray-50/50 text-gray-500 border border-gray-200/50'
                  }`}>
                    {currentURL}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// SendResponses Component


export default  WordCloudComp ;