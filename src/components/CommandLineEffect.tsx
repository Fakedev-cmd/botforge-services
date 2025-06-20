
import React, { useState, useEffect } from 'react';
import { Terminal } from 'lucide-react';

const CommandLineEffect = () => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);

  const texts = [
    'npm install botforge',
    'git clone https://github.com/your-bot-dreams',
    'node deploy.js --production',
    'docker run botforge:latest',
    'yarn build --optimize',
    'sudo systemctl start botforge',
    './configure --advanced-ai',
    'python train_model.py --gpu'
  ];

  useEffect(() => {
    const typeText = () => {
      const targetText = texts[currentTextIndex];
      
      if (currentText.length < targetText.length && isTyping) {
        setTimeout(() => {
          setCurrentText(targetText.slice(0, currentText.length + 1));
        }, 100);
      } else if (currentText.length === targetText.length && isTyping) {
        setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      } else if (!isTyping && currentText.length > 0) {
        setTimeout(() => {
          setCurrentText(currentText.slice(0, -1));
        }, 50);
      } else if (!isTyping && currentText.length === 0) {
        setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        setIsTyping(true);
      }
    };

    typeText();
  }, [currentText, isTyping, currentTextIndex, texts]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <div className="flex justify-center mb-8">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-xl blur-lg opacity-75 animate-pulse"></div>
        <div className="relative bg-gray-900/95 backdrop-blur-xl border border-blue-400/30 rounded-xl p-4 font-mono text-sm shadow-2xl">
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex space-x-1.5">
              <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-sm"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
            </div>
            <Terminal className="h-4 w-4 text-blue-400" />
            <span className="text-gray-400 text-xs">terminal</span>
          </div>
          <div className="text-blue-400 min-h-[20px] flex items-center">
            <span className="text-blue-500 mr-2">$</span>
            <span className="text-blue-300">{currentText}</span>
            <span className={`ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}>
              <span className="bg-blue-400 text-black px-1">_</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandLineEffect;
