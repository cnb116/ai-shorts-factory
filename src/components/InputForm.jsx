import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const InputForm = ({ topic, setTopic, onGenerate, loading }) => {
    return (
        <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 shadow-lg">
            <input
                type="text"
                placeholder="주제 입력 (예: 고양이의 하루)"
                className="w-full bg-gray-900 text-white p-4 rounded-xl border border-gray-600 focus:border-purple-500 focus:outline-none mb-4 text-sm"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onGenerate()}
            />
            <button
                onClick={onGenerate}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${loading
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg hover:shadow-purple-500/30"
                    }`}
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <LoadingSpinner />
                        생성 중...
                    </span>
                ) : (
                    "✨ 쇼츠 생성하기"
                )}
            </button>
        </div>
    );
};

export default InputForm;
