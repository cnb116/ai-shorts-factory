import React from 'react';

const Header = ({ onOpenSettings, showSettings, onCloseSettings, apiKey, onSaveKey }) => {
    const [localKey, setLocalKey] = React.useState(apiKey);

    // Update localKey when apiKey prop changes
    React.useEffect(() => {
        setLocalKey(apiKey);
    }, [apiKey]);

    return (
        <>
            <header className="text-center space-y-2 mt-4 relative">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                    AI Shorts Maker 🚀
                </h1>
                <p className="text-gray-400 text-xs">나만의 쇼츠를 만들어보세요!</p>
                <button
                    onClick={onOpenSettings}
                    className="absolute right-0 top-0 text-xl p-2 opacity-50 hover:opacity-100"
                >
                    ⚙️
                </button>
            </header>

            {/* 설정 모달 */}
            {showSettings && (
                <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-gray-900 p-6 rounded-2xl border border-gray-700 w-full max-w-xs shadow-2xl">
                        <h3 className="text-white font-bold mb-4">⚙️ API Key 설정</h3>
                        <p className="text-xs text-gray-400 mb-2">Google AI Studio 키를 입력하세요.</p>
                        <input
                            type="password"
                            placeholder="AIza..."
                            className="w-full bg-black text-white p-3 rounded-xl border border-gray-600 mb-4 text-sm"
                            value={localKey}
                            onChange={(e) => setLocalKey(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => onSaveKey(localKey)}
                                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold text-sm"
                            >
                                저장
                            </button>
                            <button
                                onClick={onCloseSettings}
                                className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-bold text-sm"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;
