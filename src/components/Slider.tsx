import React from 'react';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Slider: React.FC<SliderProps> = ({ value, min, max, step = 1, onChange, ...props }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div className="relative w-full h-4 flex items-center group">
      <div className="absolute w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden pointer-events-none">
        <div className="h-full bg-blue-500" style={{ width: `${percentage}%` }}></div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="absolute w-full h-full opacity-0 cursor-pointer z-10"
        {...props}
      />
      <div 
        className="absolute w-3.5 h-3.5 bg-white border-2 border-blue-500 rounded-full shadow-sm pointer-events-none transition-transform group-active:scale-125 z-0"
        style={{ left: `calc(${percentage}% - 7px)` }}
      ></div>
    </div>
  );
};