import React, { useState, useRef } from 'react';
import './Create.css';

const Create = ({ isOpen, onClose, addShort }) => {
    const [step, setStep] = useState(1);
    const [videoFile, setVideoFile] = useState(null);
    const [productInfo, setProductInfo] = useState({
        name: '',
        price: '',
        link: '',
        promoText: ''
    });
    const [generatedVideo, setGeneratedVideo] = useState(null);

    // TTS & Recording State
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    // BGM State & Ref
    const bgmRef = useRef(null);
    const [selectedBgm, setSelectedBgm] = useState('');
    const [bgmVolume, setBgmVolume] = useState(0.2);

    const BGM_LIST = [
        { name: "🔇 BGM 없음", url: "" },
        { name: "🎵 신나는 (Upbeat)", url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=good-day-16824.mp3" },
        { name: "☕ 차분한 (Chill)", url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3" },
        { name: "⚔️ 비장한 (Epic)", url: "https://cdn.pixabay.com/download/audio/2022/03/24/audio_c8c8a73467.mp3?filename=action-rock-116087.mp3" }
    ];

    if (!isOpen) return null;

    // --- 기능 함수들 (TTS, 녹화) ---

    // 1. TTS (말하기)
    const toggleTTS = () => {
        const text = productInfo.promoText || "상품 설명을 입력해주세요.";

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ko-KR';
            utterance.rate = 1.0;
            utterance.onend = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
            setIsSpeaking(true);
        }
    };

    // 2. 녹화 시작
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: "never" },
                audio: true
            });

            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `shorts_${Date.now()}.webm`;
                a.click();
                URL.revokeObjectURL(url);
                stream.getTracks().forEach(track => track.stop());
                setIsRecording(false);
            };

            mediaRecorder.start();
            setIsRecording(true);

            // BGM 재생 (녹화 시작 시)
            if (selectedBgm && bgmRef.current) {
                bgmRef.current.volume = bgmVolume;
                bgmRef.current.currentTime = 0;
                bgmRef.current.play().catch(e => console.log("BGM Play Error:", e));
            }

            // TTS 자동 재생 (BGM과 겹치지 않게 약간 딜레이)
            if (productInfo.promoText) {
                setTimeout(() => toggleTTS(), 500);
            }

        } catch (err) {
            console.error("녹화 실패:", err);
            alert("녹화 권한이 필요하거나 취소되었습니다.");
        }
    };

    // 3. 녹화 종료
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            if (isSpeaking) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
            }
            // BGM 정지
            if (bgmRef.current) {
                bgmRef.current.pause();
            }
        }
    };

    // --- 핸들러들 ---
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setVideoFile(URL.createObjectURL(e.target.files[0]));
            setStep(2);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProductInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        // 더미 생성 로직 (실제 앱에서는 여기서 AI API 호출)
        const mockGenerated = {
            videoUrl: videoFile,
            overlayText: productInfo.promoText || "이 상품 완전 대박! 지금 바로 확인하세요.",
            productCard: {
                name: productInfo.name || "상품명 예시",
                price: productInfo.price || "10,000원",
                link: productInfo.link || "#"
            }
        };
        setGeneratedVideo(mockGenerated);
        setStep(3);
    };

    return (
        <div className="create-modal-overlay">
            <div className="create-modal-content">

                {/* 헤더 */}
                <div className="create-header">
                    <h2>
                        {step === 1 && "영상 업로드"}
                        {step === 2 && "정보 입력"}
                        {step === 3 && "쇼츠 완성"}
                    </h2>
                    <button onClick={onClose} className="close-btn">
                        ✕
                    </button>
                </div>

                {/* 컨텐츠 영역 */}
                <div className="create-body">

                    {/* STEP 1: 업로드 */}
                    {step === 1 && (
                        <div className="step-upload">
                            <div className="upload-icon-circle">
                                <span>📁</span>
                            </div>
                            <div className="upload-text">
                                <h3>영상을 선택해주세요</h3>
                                <p>쇼츠로 만들 원본 영상을 업로드합니다.</p>
                            </div>
                            <label className="upload-label">
                                파일 찾기
                                <input type="file" accept="video/*" onChange={handleFileChange} style={{ display: 'none' }} />
                            </label>
                        </div>
                    )}

                    {/* STEP 2: 정보 입력 */}
                    {step === 2 && (
                        <div className="step-info">
                            {videoFile && (
                                <div className="video-preview-sm">
                                    <video src={videoFile} />
                                </div>
                            )}
                            <div className="input-group">
                                <input
                                    name="name"
                                    placeholder="상품명 (예: 마법 소파)"
                                    className="create-input"
                                    onChange={handleInputChange}
                                />
                                <input
                                    name="price"
                                    placeholder="가격 (예: 29,900원)"
                                    className="create-input"
                                    onChange={handleInputChange}
                                />
                                <input
                                    name="link"
                                    placeholder="구매 링크 (쿠팡 파트너스 등)"
                                    className="create-input"
                                    onChange={handleInputChange}
                                />
                                <textarea
                                    name="promoText"
                                    placeholder="홍보 문구 (AI가 읽어줄 내용)"
                                    className="create-textarea"
                                    onChange={handleInputChange}
                                />
                            </div>
                            <button
                                onClick={handleSubmit}
                                className="submit-btn"
                            >
                                ✨ 쇼츠 생성하기
                            </button>
                        </div>
                    )}

                    {/* STEP 3: 미리보기 및 완성 */}
                    {step === 3 && generatedVideo && (
                        <div className="step-preview">
                            {/* BGM 컨트롤러 추가 */}
                            {/* BGM 컨트롤러 추가 */}
                            <div className="bgm-control-panel">
                                <span style={{ fontSize: '1.2rem' }}>🎧</span>
                                <select
                                    value={selectedBgm}
                                    onChange={(e) => {
                                        setSelectedBgm(e.target.value);
                                        // 선택 즉시 재생 테스트
                                        if (bgmRef.current) {
                                            bgmRef.current.src = e.target.value;
                                            if (e.target.value) bgmRef.current.play();
                                            else bgmRef.current.pause();
                                        }
                                    }}
                                    className="bgm-select"
                                >
                                    {BGM_LIST.map((bgm, idx) => (
                                        <option key={idx} value={bgm.url}>{bgm.name}</option>
                                    ))}
                                </select>
                                <div className="bgm-volume-wrapper">
                                    <span className="bgm-volume-label">Vol</span>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={bgmVolume}
                                        onChange={(e) => {
                                            const vol = parseFloat(e.target.value);
                                            setBgmVolume(vol);
                                            if (bgmRef.current) bgmRef.current.volume = vol;
                                        }}
                                        className="bgm-volume-slider"
                                    />
                                </div>
                                <audio ref={bgmRef} loop />
                            </div>

                            {/* 1. 비디오 레이어 */}
                            <div className="video-wrapper" id="capture-area">
                                <video
                                    src={generatedVideo.videoUrl}
                                    className="preview-video"
                                    autoPlay loop playsInline muted
                                />

                                {/* 2. 오버레이 텍스트 */}
                                <div className="overlay-text-container">
                                    <h2 className="overlay-text">
                                        {generatedVideo.overlayText}
                                    </h2>
                                </div>

                                {/* 3. 하단 상품 카드 */}
                                <div className="product-card-overlay">
                                    <div className="product-icon">
                                        🎁
                                    </div>
                                    <div className="product-details">
                                        <p className="product-name">{generatedVideo.productCard.name}</p>
                                        <p className="product-price">{generatedVideo.productCard.price}</p>
                                    </div>
                                    <button className="buy-btn-sm">
                                        구매하기
                                    </button>
                                </div>
                            </div>

                            {/* 4. 컨트롤 버튼 */}
                            <div className={`control-bar ${isRecording ? 'recording' : ''}`}>

                                {/* 듣기 버튼 */}
                                <button
                                    onClick={toggleTTS}
                                    className={`control-btn btn-tts ${isSpeaking ? 'speaking' : ''}`}
                                >
                                    {isSpeaking ? '🔇 멈추기' : '🔊 들어보기'}
                                </button>

                                {/* 녹화 버튼 */}
                                {!isRecording ? (
                                    <button
                                        onClick={startRecording}
                                        className="control-btn btn-record"
                                    >
                                        🔴 녹화 시작
                                    </button>
                                ) : (
                                    <button
                                        onClick={stopRecording}
                                        className="control-btn btn-stop"
                                    >
                                        ⏹ 녹화 종료
                                    </button>
                                )}
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Create;
