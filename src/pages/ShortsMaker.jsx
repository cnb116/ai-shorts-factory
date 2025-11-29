import { useState, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './ShortsMaker.css';

const ShortsMaker = ({ onBack }) => {
    const [apiKey, setApiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || '');
    const [productInfo, setProductInfo] = useState('');
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // TTS & Recording & BGM State
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    // BGM Settings
    const bgmRef = useRef(null);
    const [selectedBgm, setSelectedBgm] = useState('');
    const [bgmVolume, setBgmVolume] = useState(0.2); // Default low volume for background

    const BGM_LIST = [
        { name: "🚫 없음", url: "" },
        { name: "🎵 신나는 (Upbeat)", url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=good-day-16824.mp3" },
        { name: "☕ 차분한 (Chill)", url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3" },
        { name: "🏃‍♂️ 역동적인 (Action)", url: "https://cdn.pixabay.com/download/audio/2022/03/24/audio_c8c8a73467.mp3?filename=action-rock-116087.mp3" }
    ];

    // URL 분석 함수
    const fetchUrlInfo = async () => {
        const urlMatch = productInfo.match(/(https?:\/\/[^\s]+)/g);
        const url = urlMatch ? urlMatch[0] : null;

        if (!url) {
            alert("입력창에 URL을 먼저 넣어주세요!");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
            const data = await response.json();

            if (data.contents) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(data.contents, "text/html");

                const title = doc.querySelector('meta[property="og:title"]')?.content || doc.title || "";
                const description = doc.querySelector('meta[property="og:description"]')?.content || "";

                const newInfo = `상품명: ${title}\n특징: ${description}\n구매 링크: ${url}`;
                setProductInfo(newInfo);
            }
        } catch (err) {
            console.error("URL Fetch Error:", err);
            alert("URL 정보를 가져오는데 실패했습니다. 직접 내용을 입력해주세요.");
        } finally {
            setIsLoading(false);
        }
    };

    // 링크 열기 함수
    const openLink = () => {
        const urlMatch = productInfo.match(/(https?:\/\/[^\s]+)/g);
        const url = urlMatch ? urlMatch[0] : null;
        if (url) {
            window.open(url, '_blank');
        } else {
            alert("입력창에서 URL을 찾을 수 없습니다.");
        }
    };

    const handleGenerate = async () => {
        if (!apiKey) {
            setError('Google API Key를 입력해주세요.');
            return;
        }
        if (!productInfo) {
            setError('상품 정보를 입력해주세요.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
                generationConfig: { responseMimeType: "application/json" }
            });

            const sysInstruct = `
            당신은 '바이럴 마케팅 전문가'이자 '프론트엔드 웹 개발자'입니다.
            사용자가 [상품 정보]를 입력하면, 분석 후 다음 두 가지를 포함한 JSON 데이터만 출력하세요.
            1. shorts_script: 유튜브 쇼츠용 대본 (반드시 줄바꿈(\n)이 포함된 '하나의 긴 문자열(String)'로 출력할 것. 절대 내부를 객체로 나누지 말 것.)
            2. html_code: 모바일 랜딩 페이지 HTML/CSS 코드 (카드 뉴스 스타일)

            [디자인 가이드 (High-End Premium)]
            - 전체 테마: 다크 모드 (#111 배경), 텍스트는 흰색(#fff).
            - 폰트: 시스템 폰트(Pretendard, -apple-system, sans-serif) 사용.
            - 히어로 섹션:
              - 상단 60vh 높이의 풀사이즈 이미지.
              - **중요**: 이미지 위에 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' 오버레이를 씌워 텍스트 가독성을 확보할 것.
              - 텍스트(상품명, 가격)는 이미지 하단에 배치하며, 텍스트 그림자(text-shadow) 적용.
            - 특징 섹션: 깔끔한 아이콘(이모지) + 텍스트 리스트 형태. 배경색은 #222.
            - CTA 버튼:
              - 화면 하단에 꽉 차게 배치하거나 눈에 띄는 색상(#ff4757 등) 사용.
              - 'pulse' 애니메이션을 적용하여 클릭 유도.
              - **중요**: [상품 정보] 내에 'http'로 시작하는 링크가 있다면 href 속성에 넣을 것. 없다면 '#' 사용.

            [이미지 생성 규칙]
            - <img> 태그의 src에는 반드시 'Pollinations.ai' URL을 사용하세요.
            - URL 형식: https://image.pollinations.ai/prompt/{English_Prompt}?width=720&height=1280&nologo=true
            - {English_Prompt}: 상품의 핵심 특징을 묘사하는 '영어 프롬프트'를 자동으로 생성하여 넣으세요. (예: Premium%20Massage%20Device%20dark%20mood)
            - 주의: URL 내의 공백은 반드시 %20으로 치환해야 합니다.
            
            [제약 사항]
            - 반드시 순수한 JSON 형식으로만 출력할 것.
            - 마크다운(js, json 등) 기호 절대 사용 금지.
            `;

            const prompt = `${sysInstruct}\n\n[상품 정보]: ${productInfo}`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const data = JSON.parse(text);

            if (typeof data.shorts_script === 'object') {
                data.shorts_script = JSON.stringify(data.shorts_script, null, 2);
            }

            setResult(data);

        } catch (err) {
            console.error(err);
            setError('오류가 발생했습니다: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenPreview = () => {
        if (!result || !result.html_code) {
            alert("먼저 마케팅 콘텐츠를 생성해주세요!");
            return;
        }
        const newWindow = window.open();
        newWindow.document.write(result.html_code);
        newWindow.document.close();
    };

    const toggleTTS = (text) => {
        if (!window.speechSynthesis) {
            alert("TTS를 지원하지 않는 브라우저입니다.");
            return;
        }
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }
        if (!text) return;

        const textToSpeak = typeof text === 'object' ? JSON.stringify(text) : text;
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'ko-KR';
        utterance.rate = 1.0;
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: "never" },
                audio: true
            });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
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
                a.download = `shorts_maker_${Date.now()}.webm`;
                a.click();
                URL.revokeObjectURL(url);
                stream.getTracks().forEach(track => track.stop());
                setIsRecording(false);
            };

            mediaRecorder.start();
            setIsRecording(true);

            if (selectedBgm && bgmRef.current) {
                bgmRef.current.volume = bgmVolume;
                bgmRef.current.currentTime = 0;
                bgmRef.current.play().catch(e => console.log("BGM Play Error:", e));
            }

            if (result?.shorts_script) {
                setTimeout(() => toggleTTS(result.shorts_script), 500);
            }

        } catch (err) {
            console.error("Recording failed:", err);
            alert("녹화가 취소되었습니다.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            if (isSpeaking) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
            }
            if (bgmRef.current) {
                bgmRef.current.pause();
            }
        }
    };

    return (
        <div className="shorts-maker-container">
            <div className="shorts-maker-header">
                <button onClick={onBack} className="back-btn">← 뒤로가기</button>
                <h2>🛍️ AI 쇼츠 메이커</h2>
            </div>

            <div className="shorts-maker-content">
                <div className="input-section">
                    <div className="form-group">
                        <label>🔑 Google API Key</label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="API Key를 입력하세요"
                        />
                    </div>

                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ margin: 0 }}>📦 상품 정보 (URL 포함)</label>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <button
                                    onClick={openLink}
                                    style={{
                                        background: '#333',
                                        color: '#aaa',
                                        border: '1px solid #555',
                                        padding: '4px 10px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    ↗️ 웹으로 이동
                                </button>
                                <button
                                    onClick={fetchUrlInfo}
                                    style={{
                                        background: '#333',
                                        color: '#4285f4',
                                        border: '1px solid #4285f4',
                                        padding: '4px 10px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    🔗 URL 내용 가져오기
                                </button>
                            </div>
                        </div>
                        <textarea
                            value={productInfo}
                            onChange={(e) => setProductInfo(e.target.value)}
                            placeholder="예: 부산 할매 김치찜. 특징: 3년 묵은지, 전자레인지 5분 컷, 고기 듬뿍."
                            rows={5}
                        />
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="generate-btn"
                    >
                        {isLoading ? '⏳ 생각하는 중...' : '🚀 마케팅 콘텐츠 생성'}
                    </button>

                    {error && <div className="error-msg">{error}</div>}
                </div>

                {result && (
                    <div className="result-section">
                        <div className="result-card">
                            <div className="result-header">
                                <h3>📜 쇼츠 대본</h3>
                                <div className="button-group" style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        className="action-btn"
                                        onClick={() => navigator.clipboard.writeText(result.shorts_script)}
                                        style={{ background: '#555', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        📋 복사
                                    </button>
                                    <button
                                        className="action-btn"
                                        onClick={() => toggleTTS(result.shorts_script)}
                                        style={{ background: isSpeaking ? '#e74c3c' : '#3498db', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        {isSpeaking ? '🔇 중지' : '🔊 듣기'}
                                    </button>
                                </div>
                            </div>
                            <textarea
                                className="script-textarea text-white"
                                style={{ color: 'white', width: '100%', marginTop: '10px', minHeight: '100px', background: '#222', border: '1px solid #444', padding: '10px', borderRadius: '4px' }}
                                value={result.shorts_script || ''}
                                onChange={(e) => setResult({ ...result, shorts_script: e.target.value })}
                            />
                        </div>

                        <div className="result-card" style={{ marginTop: '20px' }}>
                            <h3>🎨 랜딩 페이지 & 녹화</h3>

                            <div className="bgm-control" style={{ background: '#333', padding: '10px', borderRadius: '8px', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '1.2rem' }}>🎵</span>
                                <select
                                    value={selectedBgm}
                                    onChange={(e) => setSelectedBgm(e.target.value)}
                                    style={{ flex: 1, padding: '8px', borderRadius: '4px', border: 'none', background: '#222', color: 'white' }}
                                >
                                    {BGM_LIST.map((bgm, idx) => (
                                        <option key={idx} value={bgm.url}>{bgm.name}</option>
                                    ))}
                                </select>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#aaa' }}>Vol</span>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={bgmVolume}
                                        onChange={(e) => {
                                            setBgmVolume(parseFloat(e.target.value));
                                            if (bgmRef.current) bgmRef.current.volume = parseFloat(e.target.value);
                                        }}
                                        style={{ width: '60px' }}
                                    />
                                </div>
                                <audio ref={bgmRef} src={selectedBgm} loop />
                            </div>

                            <div className="action-buttons" style={{
                                display: 'flex',
                                gap: '10px',
                                marginTop: '15px',
                                flexWrap: 'wrap',
                                opacity: isRecording ? 0.3 : 1,
                                transition: 'opacity 0.5s ease-in-out'
                            }}>
                                <button
                                    onClick={handleOpenPreview}
                                    className="preview-btn"
                                    style={{ flex: 1, padding: '10px', background: '#9b59b6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    🌐 브라우저에서 보기
                                </button>

                                {!isRecording ? (
                                    <button
                                        onClick={startRecording}
                                        style={{ flex: 1, padding: '10px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                                    >
                                        🔴 녹화 시작
                                    </button>
                                ) : (
                                    <button
                                        onClick={stopRecording}
                                        style={{ flex: 1, padding: '10px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', animation: 'pulse 1s infinite' }}
                                    >
                                        ⏹ 녹화 종료
                                    </button>
                                )}
                            </div>
                            <div className="code-preview" style={{ marginTop: '10px', fontSize: '0.8rem', color: '#aaa' }}>
                                <code>* '녹화 시작'을 누르고 [새 창]을 띄운 뒤 화면을 공유하세요.</code>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShortsMaker;
