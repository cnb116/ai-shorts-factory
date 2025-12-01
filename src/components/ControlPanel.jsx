import React from 'react';

const ControlPanel = ({ isPlaying, isRecording, onStartAutoPlay, onStartRecording, onStop }) => {
    return (
        <div className="absolute bottom-6 left-0 right-0 z-50 flex gap-2 px-4 justify-center">
            {!isPlaying ? (
                <>
                    <button
                        onClick={onStartAutoPlay}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white py-4 rounded-full font-bold shadow-lg hover:shadow-green-500/30 transition-all animate-bounce text-sm"
                    >
                        <span>▶️</span> 전체 재생
                    </button>
                    <button
                        onClick={onStartRecording}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white py-4 rounded-full font-bold shadow-lg hover:shadow-red-500/30 transition-all text-sm"
                    >
                        <span>💾</span> 영상 추출
                    </button>
                </>
            ) : (
                <button
                    onClick={onStop}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white py-4 rounded-full font-bold shadow-lg hover:shadow-red-500/30 transition-all"
                >
                    <span>⏹️</span> {isRecording ? "녹화 및 재생 중지" : "재생 중지"}
                </button>
            )}
        </div>
    );
};

export default ControlPanel;
