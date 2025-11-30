import React from 'react';
import MyGallery from '../components/MyGallery';
import './MyProjects.css';

const MyProjects = ({ onBack, onCreateNew }) => {
    return (
        <div className="my-projects-container">
            <header className="projects-header">
                <button onClick={onBack} className="back-btn">⬅️</button>
                <h1 className="text-xl font-bold">내 프로젝트</h1>
            </header>

            <div className="p-4 max-w-6xl mx-auto w-full">
                {/* Create New Button (Banner Style) */}
                <button
                    onClick={onCreateNew}
                    className="w-full mb-6 py-6 rounded-2xl border-2 border-dashed border-gray-700 bg-gray-900/50 text-gray-400 hover:border-blue-500 hover:text-blue-400 hover:bg-gray-900 transition-all group flex flex-col items-center justify-center gap-2"
                >
                    <span className="text-3xl group-hover:scale-110 transition-transform">✨</span>
                    <span className="font-bold text-lg">새로운 AI 쇼츠 만들기</span>
                </button>

                {/* Gallery Component */}
                <MyGallery />
            </div>
        </div>
    );
};

export default MyProjects;
