import React from 'react';

const ResultCard = ({ card, index }) => {
    return (
        <div className="relative rounded-xl overflow-hidden aspect-[9/16] border border-gray-800 group cursor-pointer hover:border-purple-500 transition-all">
            <img src={card.imageUrl} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white font-bold">미리보기</span>
            </div>
            <div className="absolute bottom-0 inset-x-0 bg-black/60 p-3 text-xs text-white truncate backdrop-blur-sm">
                {index + 1}. {card.text}
            </div>
        </div>
    );
};

export default ResultCard;
