import React from 'react';
import { Clock, ThumbsUp } from 'lucide-react';

const CardPadre2 = ({ image, title, subtitle, text, date }) => {
  return (
    <div className="max-w-2xl overflow-hidden group relative rounded-lg shadow-lg">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0" 
        style={{ backgroundImage: `url(${image})` }}
      />
      
      {/* Content overlay */}
      <div className="relative z-10 bg-black bg-opacity-50 text-white h-full flex flex-col justify-between">
        <div className="p-6 space-y-4">
          <div className="text-sm text-gray-300">{date}</div>
          <h2 className="text-4xl font-serif font-bold">
            {title}
          </h2>
          <h3 className="text-xl text-gray-200">{subtitle}</h3>
        </div>
        
        <div className="p-6 space-y-6">
          <p className="text-gray-200 line-clamp-3">
            {text}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <div className="flex items-center gap-1">
              <ThumbsUp className="w-4 h-4" />
              <span>38</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>7 min read</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardPadre2;

