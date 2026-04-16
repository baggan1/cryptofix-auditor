'use client';

import React, { useEffect, useState } from 'react';

interface ScoreGaugeProps {
  score: number;
  grade: string;
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, grade }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const offset = circumference - (animatedScore / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 70) return '#10B981'; // Brand Accent Green
    if (s >= 50) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  const currentColor = getColor(score);

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative w-64 h-64 flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="#E2E8F0"
            strokeWidth="12"
            fill="none"
          />
          {/* Progress arc */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke={currentColor}
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-[1000ms] ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <div className="flex items-baseline">
            <span className="text-6xl font-bold text-slate-800">{score}</span>
            <span className="text-xl text-slate-400 font-medium ml-1">/100</span>
          </div>
        </div>
      </div>
      <div 
        className="mt-4 px-6 py-2 rounded-full font-bold text-lg uppercase tracking-widest shadow-sm"
        style={{ backgroundColor: `${currentColor}15`, color: currentColor }}
      >
        {grade}
      </div>
    </div>
  );
};

export default ScoreGauge;
