
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveToCloud } from '../SaveProject';
import { auth } from '../firebase';

const ShortsMaker = ({ onBack }) => {
    // --- State ---
    const [step, setStep] = useState(0); // 0: Input, 1: Edit Script, 2: Result
    const [apiKey, setApiKey] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [productInfo, setProductInfo] = useState('');
    const [editableScript, setEditableScript] = useState(''); // 편집 가능한 대본 상태
    const [analyzedData, setAnalyzedData] = useState(''); // 분석된 데이터 저장
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [selectedPreset, setSelectedPreset] = useState(null);

    // --- Presets ---
    const presets = [
        { id: 'home', name: '🔥🔥 홈쇼핑 텐션', style: '홈쇼핑 호스트처럼 아주 높은 텐션! 과장된 감탄사("대박!", "이건 사야해!")와 긴박한 말투 사용.', bgm: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3" },
        { id: 'vlog', name: '🌿 감성 브이로그', style: '차분하고 감성적인 브이로그 독백 톤. 친구에게 속삭이듯 부드럽고 친근한 말투 사용.', bgm: "https://cdn.pixabay.com/download/audio/2022/03/24/audio_c8c8a73467.mp3" },
        { id: 'info', name: '💼 정보 전달', style: '뉴스 앵커나 IT 리뷰어처럼 신뢰감 있고 명확한 정보 전달 톤. 군더더기 없이 깔끔하고 전문적인 말투.', bgm: "https://cdn.pixabay.com/download/audio/2022/10/25/audio_51596e0030.mp3" }
    ];

    // Audio & Recording State
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [bgm, setBgm] = useState('');

    // Refs
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const audioRef = useRef(new Audio());
    const cardRefs = useRef([]);
    const [isPlayingMode, setIsPlayingMode] = useState(false);

    // --- Constants ---
    const bgmOptions = [
        { name: "🔇 BGM 없음", url: "" },
        { name: "💪 신나는 (에너지)", url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3" },
        { name: "☕ 차분한 (카페)", url: "https://cdn.pixabay.com/download/audio/2022/03/24/audio_c8c8a73467.mp3" },
        { name: "✨ 트렌디 (팝)", url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3" },
        { name: "🔥 비장한 (시네마틱)", url: "https://cdn.pixabay.com/download/audio/2022/10/25/audio_51596e0030.mp3" }
    ];

    // --- Effects ---
    useEffect(() => {
        const audio = audioRef.current;
        return () => { audio.pause(); };
    }, []);

    // Load API Key from LocalStorage
    useEffect(() => {
        const savedKey = localStorage.getItem('gemini_api_key');
        const envKey = import.meta.env.VITE_GEMINI_API_KEY;

        if (savedKey) {
            setApiKey(savedKey);
        } else if (envKey) {
            setApiKey(envKey);
        } else {
            setShowSettings(true); // 키가 없으면 설정창 자동 오픈
        }
    }, []);

    // --- Handlers ---
    const saveApiKey = (key) => {
        setApiKey(key);
        localStorage.setItem('gemini_api_key', key);
        alert("API Key가 저장되었습니다!");
        setShowSettings(false);
    };

    const applyPreset = (preset) => {
        setSelectedPreset(preset);
        setBgm(preset.bgm);
        if (preset.bgm) {
            audioRef.current.src = preset.bgm;
            audioRef.current.loop = true;
            audioRef.current.volume = 0.2;
            audioRef.current.play().catch(err => console.log("BGM Error:", err));
        } else {
            audioRef.current.pause();
        }
    };

    const handleBgmChange = (e) => {
        const selectedUrl = e.target.value;
        setBgm(selectedUrl);
        if (selectedUrl) {
            audioRef.current.src = selectedUrl;
            audioRef.current.loop = true;
            audioRef.current.volume = 0.2;
            audioRef.current.play().catch(err => console.log("BGM Error:", err));
        } else {
            audioRef.current.pause();
        }
    };

    // 1단계: 상품 분석 및 초안 대본 생성
    const analyzeProduct = async () => {
        if (!apiKey) { alert("API Key 설정이 필요합니다."); setShowSettings(true); return; }
        if (!productInfo) { alert("상품 정보를 입력해주세요."); return; }

        setLoading(true);
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            // 1. Analyze
            const analysisPrompt = `
            상품 정보 분석가로서 다음 텍스트에서 핵심 마케팅 요소(상품명, 가격, USP 3가지, 타겟)를 추출해 요약해줘:
            ${productInfo}
            `;
            const analysisResult = await model.generateContent(analysisPrompt);
            const analyzedText = analysisResult.response.text();
            setAnalyzedData(analyzedText);

            // 2. Draft Script
            const styleGuide = selectedPreset ? selectedPreset.style : "후킹 멘트로 시작하고, 구어체를 사용해.";
            const scriptPrompt = `
            숏폼 마케팅 전문가로서, 분석된 정보를 바탕으로 30초 분량의 쇼츠 대본을 작성해.
            [톤앤매너]: ${styleGuide}
            
            [분석 정보]: ${analyzedText}
            
            [출력]: 오직 대본 텍스트만 출력해.
            `;
            const scriptResult = await model.generateContent(scriptPrompt);
            setEditableScript(scriptResult.response.text());

            setStep(1); // 편집 모드로 이동

        } catch (error) {
            console.error(error);
            alert("분석 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 2단계: 최종 영상(HTML) 생성
    const createVideo = async () => {
        setLoading(true);
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const creativePrompt = `
            웹 개발자로서, 다음 대본과 분석 정보를 바탕으로 쇼츠 영상을 위한 HTML 코드를 생성해.

            [분석 정보]: ${analyzedData}
            [확정 대본]: ${editableScript}

            [요청사항]:
            1. 모바일 최적화(Responsive), 블랙 테마, 세련된 CSS.
            2. 이미지: 'https://image.pollinations.ai/prompt/{영어_키워드}' 사용.
            3. 구매 버튼 포함.
            
            [출력 포맷(JSON Only)]:
            { "shorts_script": "${editableScript.replace(/\n/g, ' ')}", "html_code": "..." }
            `;

            const creativeResult = await model.generateContent(creativePrompt);
            const responseText = creativeResult.response.text().replace(/```json|```/g, "").trim();
            setResult(JSON.parse(responseText));
            setStep(2); // 결과 모드로 이동

        } catch (error) {
            console.error(error);
            alert("영상 생성 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const toggleTTS = () => {
        if (!result?.shorts_script) return;
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            const utterance = new SpeechSynthesisUtterance(result.shorts_script);
            utterance.lang = 'ko-KR';
            utterance.onend = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
            setIsSpeaking(true);
        }
    };

    const startRecording = async () => {
        try {
            alert("⚠️ [탭 공유] -> [오디오 공유] 체크 필수!");
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: "never" }, audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];
            mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `shorts_${Date.now()}.webm`; a.click();
                URL.revokeObjectURL(url); stream.getTracks().forEach(track => track.stop());
                setIsRecording(false);
            };
            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) { alert("녹화 취소됨"); }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) mediaRecorderRef.current.stop();
    };

    const openPreview = () => {
        if (!result?.html_code) return;
        const win = window.open('', '_blank');
        win.document.write(result.html_code);
        win.document.close();
    };

    const handleSaveProject = async () => {
        if (!result || !auth.currentUser) { alert("로그인이 필요하거나 결과가 없습니다."); return; }
        try {
            await saveToCloud(auth.currentUser, { name: 'New Project', desc: productInfo }, result);
            alert("✅ 저장 완료!");
        } catch (e) { alert("❌ 저장 실패"); }
    };

    // --- Auto Play Logic ---
    const scriptLines = result?.shorts_script
        ? result.shorts_script.split('\n').filter(line => line.trim() !== '')
        : [];

    useEffect(() => {
        if (isPlayingMode) {
            const playSequence = async () => {
                await new Promise(r => setTimeout(r, 100)); // Wait for render

                for (let i = 0; i < scriptLines.length; i++) {
                    if (!cardRefs.current[i]) continue;

                    // 1. Scroll
                    cardRefs.current[i].scrollIntoView({ behavior: 'smooth', block: 'center' });

                    // 2. Wait 0.5s
                    await new Promise(r => setTimeout(r, 500));

                    // 3. Play TTS
                    await new Promise((resolve) => {
                        const utterance = new SpeechSynthesisUtterance(scriptLines[i]);
                        utterance.lang = 'ko-KR';
                        utterance.rate = 1.0;
                        utterance.onend = resolve;
                        utterance.onerror = resolve;
                        window.speechSynthesis.speak(utterance);
                    });
                }
                setIsPlayingMode(false);
            };
            playSequence();
        } else {
            window.speechSynthesis.cancel();
        }
    }, [isPlayingMode]);

    // --- Render ---
    console.log("ShortsMaker Rendered, Step:", step);
    return (
        <div className="min-h-screen bg-black text-white p-6 pb-32 max-w-4xl mx-auto relative">
            {/* Header */}
            {!isPlayingMode && (
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => step > 0 ? setStep(step - 1) : onBack()} className="text-2xl hover:opacity-80 transition">⬅️</button>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {step === 0 && "Shopping Shorts Maker"}
                        {step === 1 && "대본 편집 (Script Editor)"}
                        {step === 2 && "Final Studio"}
                    </h1>
                    <button
                        onClick={() => setShowSettings(true)}
                        className="text-xl p-2 hover:bg-gray-800 rounded-full transition-colors"
                        title="설정"
                    >
                        ⚙️
                    </button>
                </div>
            )}

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-gray-900 p-6 rounded-2xl w-full max-w-sm border border-gray-700 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">⚙️ 설정</h3>
                            <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Google Gemini API Key</label>
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    className="w-full bg-black border border-gray-700 rounded-xl p-3 text-sm focus:border-blue-500 outline-none text-white"
                                    placeholder="AI Studio에서 발급받은 키 입력"
                                />
                                <p className="text-[10px] text-gray-500 mt-1">* 키는 브라우저(Local Storage)에만 안전하게 저장됩니다.</p>
                            </div>
                            <button onClick={() => saveApiKey(apiKey)} className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-sm transition-colors">저장하기</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 0: Input */}
            {!isPlayingMode && step === 0 && (
                <div className="space-y-3 mb-8 border-2 border-red-500">
                    <div className="flex justify-end gap-2">
                        <button onClick={() => { const match = productInfo.match(/(https?:\/\/[^\s]+)/g); match ? window.open(match[0], '_blank') : alert("URL이 없습니다."); }} className="text-xs bg-gray-800 hover:bg-gray-700 text-blue-400 px-3 py-1.5 rounded-lg border border-gray-700">↗ 웹으로 이동</button>
                        <button onClick={() => { const match = productInfo.match(/(https?:\/\/[^\s]+)/g); match ? alert(`URL 감지됨: ${match[0]}`) : alert("URL이 없습니다."); }} className="text-xs bg-gray-800 hover:bg-gray-700 text-purple-400 px-3 py-1.5 rounded-lg border border-gray-700">🔗 URL 가져오기</button>
                        <button onClick={() => setProductInfo(`https://www.coupang.com/vp/products/7335526849\n\n상품명: 곰곰 소중한 우리 쌀\n가격: 28,900원\n특징: 100% 국내산, 찰지고 맛있는 밥맛`)} className="text-xs bg-gray-800 hover:bg-gray-700 text-green-400 px-3 py-1.5 rounded-lg border border-gray-700">🎲 샘플</button>
                    </div>

                    <textarea
                        className="w-full h-60 bg-gray-900 rounded-2xl p-4 border border-gray-800 focus:border-blue-500 outline-none resize-none text-sm leading-relaxed"
                        value={productInfo}
                        onChange={(e) => setProductInfo(e.target.value)}
                        placeholder="상품 URL이나 특징을 입력하세요..."
                    />

                    {/* Mood Selection (Radio Style) */}
                    <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
                        <label className="text-xs font-bold text-gray-400 mb-3 block uppercase">분위기 선택 (Mood & BGM)</label>
                        <div className="flex flex-col gap-2">
                            {presets.map(preset => (
                                <label
                                    key={preset.id}
                                    className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${selectedPreset?.id === preset.id
                                        ? 'bg-blue-900/20 border-blue-500'
                                        : 'bg-gray-900 border-gray-700 hover:bg-gray-800'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="mood"
                                        className="w-4 h-4 text-blue-500 bg-gray-800 border-gray-600 focus:ring-blue-500 focus:ring-2 mr-3"
                                        checked={selectedPreset?.id === preset.id}
                                        onChange={() => applyPreset(preset)}
                                    />
                                    <span className={`text-sm ${selectedPreset?.id === preset.id ? 'text-white font-bold' : 'text-gray-300'}`}>
                                        {preset.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={analyzeProduct}
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-bold text-lg shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50"
                    >
                        {loading ? '🔍 분석 중...' : '다음: 대본 생성'}
                    </button>
                </div>
            )}

            {/* Step 1: Edit Script (Split View) */}
            {!isPlayingMode && step === 1 && (
                <div className="animate-fade-in h-[calc(100vh-150px)] flex flex-col">
                    <div className="flex-1 grid grid-cols-2 gap-4 mb-4 min-h-0">
                        {/* Left: Original Info */}
                        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 overflow-y-auto custom-scrollbar">
                            <h3 className="text-gray-400 text-xs font-bold mb-2 uppercase">Original Info</h3>
                            <p className="text-sm text-gray-300 whitespace-pre-wrap">{productInfo}</p>
                            <div className="mt-4 pt-4 border-t border-gray-800">
                                <h3 className="text-gray-400 text-xs font-bold mb-2 uppercase">AI Analysis</h3>
                                <p className="text-xs text-gray-400 whitespace-pre-wrap">{analyzedData}</p>
                            </div>
                        </div>

                        {/* Right: Editable Script */}
                        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 flex flex-col">
                            <h3 className="text-blue-400 text-xs font-bold mb-2 uppercase">Edit Script</h3>
                            <textarea
                                className="flex-1 bg-transparent outline-none resize-none text-sm leading-relaxed text-white custom-scrollbar"
                                value={editableScript}
                                onChange={(e) => setEditableScript(e.target.value)}
                                placeholder="AI가 생성한 대본이 여기에 표시됩니다. 자유롭게 수정하세요."
                            />
                        </div>
                    </div>
                    <button
                        onClick={createVideo}
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl font-bold text-lg shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50"
                    >
                        {loading ? '🎬 영상 생성 중...' : '✨ 이 대본으로 영상 만들기'}
                    </button>
                </div>
            )}

            {/* Step 2: Result */}
            {step === 2 && result && (
                <div className={`space-y-6 animate-fade-in ${isPlayingMode ? 'fixed inset-0 z-50 bg-black flex flex-col items-center overflow-y-auto pt-20 pb-20' : ''}`}>

                    {!isPlayingMode && <div className="h-px bg-gray-800" />}

                    {/* Normal Mode UI */}
                    {!isPlayingMode && (
                        <>
                            {/* Script Card */}
                            <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-gray-400 text-sm font-bold">📜 AI 대본</span>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(result.shorts_script)}
                                        className="text-xs text-gray-500 hover:text-white"
                                    >
                                        복사
                                    </button>
                                </div>
                                <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                                    {result.shorts_script}
                                </p>
                            </div>

                            {/* Audio Controls */}
                            <div className="flex items-center gap-3 bg-gray-900 rounded-xl p-3 border border-gray-800">
                                <span className="text-lg">🎵</span>
                                <select
                                    value={bgm}
                                    onChange={handleBgmChange}
                                    className="bg-transparent text-sm text-gray-300 outline-none flex-1"
                                >
                                    {bgmOptions.map((opt, i) => <option key={i} value={opt.url}>{opt.name}</option>)}
                                </select>
                                <button
                                    onClick={toggleTTS}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${isSpeaking ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-300'}`}
                                >
                                    {isSpeaking ? '🔇 중지' : '🔊 듣기'}
                                </button>
                            </div>

                            {/* Action Grid */}
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={openPreview}
                                    className="bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-bold text-sm transition-colors"
                                >
                                    🌐 미리보기
                                </button>

                                {!isRecording ? (
                                    <button
                                        onClick={startRecording}
                                        className="bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-bold text-sm transition-colors"
                                    >
                                        🔴 녹화
                                    </button>
                                ) : (
                                    <button
                                        onClick={stopRecording}
                                        className="bg-gray-800 border-2 border-red-500 text-red-500 py-3 rounded-xl font-bold text-sm animate-pulse"
                                    >
                                        ⏹ 종료
                                    </button>
                                )}

                                <button
                                    onClick={handleSaveProject}
                                    className="bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold text-sm transition-colors"
                                >
                                    💾 저장
                                </button>

                                <button
                                    onClick={() => setIsPlayingMode(true)}
                                    className="col-span-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:scale-[1.02] transition-all mt-2"
                                >
                                    🎬 영상 녹화 모드 (Auto-Play)
                                </button>
                            </div>
                        </>
                    )}

                    {/* Auto-Play Mode UI (Card List) */}
                    {isPlayingMode && (
                        <div className="w-full max-w-2xl px-6 space-y-40">
                            {scriptLines.map((line, index) => (
                                <div
                                    key={index}
                                    ref={el => cardRefs.current[index] = el}
                                    className="bg-gray-900/90 border border-gray-700 p-10 rounded-3xl text-3xl font-bold text-center leading-relaxed text-white shadow-2xl"
                                >
                                    {line}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ShortsMaker;
