import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

// ⚠️ API KEY 설정 (환경 변수 사용)
const App = () => {
  // State for API Key (Safe LocalStorage Access)
  const [apiKey, setApiKey] = useState(() => {
    try {
      return localStorage.getItem("gemini_api_key") || import.meta.env.VITE_GEMINI_API_KEY || "";
    } catch (e) {
      console.warn("LocalStorage access denied:", e);
      return import.meta.env.VITE_GEMINI_API_KEY || "";
    }
  });
  const [showSettings, setShowSettings] = useState(false);

  // Gemini 인스턴스 생성 (API Key가 변경될 때마다)
  const getGenAI = () => new GoogleGenerativeAI(apiKey);

  // API Key 저장 함수
  const handleSaveKey = (key) => {
    setApiKey(key);
    try {
      localStorage.setItem("gemini_api_key", key);
      alert("API Key가 안전하게 저장되었습니다!");
    } catch (e) {
      console.error("LocalStorage save failed:", e);
      alert("브라우저 보안 설정으로 인해 키 자동 저장이 불가능합니다. (앱 사용은 가능합니다)");
    }
    setShowSettings(false);
  };

  // 로그 출력 함수
  const log = (message, isError = false) => {
    console.log(message);
    setDebugLog((prev) => prev + (prev ? "\n" : "") + (isError ? "❌ " : "✅ ") + message);
  };

  // 1. 콘텐츠 생성 (Gemini + Pollinations)
  const generateContent = async () => {
    if (!topic) return alert("주제를 입력해주세요!");
    if (!apiKey) {
      alert("API Key가 없습니다. 설정 버튼(⚙️)을 눌러 키를 입력해주세요.");
      setShowSettings(true);
      return;
    }

    setLoading(true);
    setCards([]);
    setIsPlaying(false);
    setDebugLog("🚀 생성 시작...");

    // API Key 확인 로그 (앞 8자리만 표시)
    log("🔑 API Key 확인: " + (apiKey ? apiKey.substring(0, 8) + "..." : "없음"));

    try {
      // 모델 변경: list_models.py 결과에 따라 gemini-2.5-flash 사용
      const modelName = "gemini-2.5-flash";
      log(`🤖 모델 설정: ${modelName}`);
      const genAI = getGenAI();
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `
        You are a professional short video director.
        Create a 5-scene script about "${topic}".
        Return ONLY a raw JSON array (no markdown, no code blocks).
        Each object must have:
        - "text": Korean narration script (engaging, short, under 100 characters).
        - "imagePrompt": Detailed English description for an AI image generator (photorealistic, cinematic lighting, 9:16 vertical ratio).
      `;

      log("🤖 Gemini에게 요청 중...");
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      log("✅ 응답 수신 완료. 데이터 처리 중...");

      // JSON 파싱 전처리
      const jsonStartIndex = text.indexOf('[');
      const jsonEndIndex = text.lastIndexOf(']') + 1;

      if (jsonStartIndex === -1 || jsonEndIndex === -1) {
        log(`❌ 응답에서 JSON 시작/끝을 찾을 수 없습니다. 원본 응답: ${text.substring(0, 200)}...`, true);
        throw new Error("응답에서 JSON 형식을 찾을 수 없습니다.");
      }

      text = text.substring(jsonStartIndex, jsonEndIndex);

      let scriptData;
      try {
        scriptData = JSON.parse(text);
      } catch (e) {
        log(`❌ JSON 파싱 실패: ${e.message}. 파싱 시도 텍스트: ${text.substring(0, 200)}...`, true);
        throw new Error(`JSON 파싱 실패: ${e.message}`);
      }

      // 이미지 URL 생성 (Pollinations.ai)
      const generatedCards = scriptData?.map((item, index) => ({
        id: index,
        text: item?.text || "내용 없음",
        imagePrompt: item?.imagePrompt || "abstract background",
        imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(item.imagePrompt)}?width=720&height=1280&nologo=true&seed=${Math.random()}`
      }));

      setCards(generatedCards);
      log(`✨ ${generatedCards.length}개의 장면 생성 완료!`);
    } catch (error) {
      console.error("Error generating content:", error);
      // 구체적인 에러 메시지 출력
      log(`❌ 오류 발생: ${error.message}`, true);

      if (error.message.includes("API key not valid") || error.message.includes("400") || error.message.includes("403")) {
        alert("API Key가 올바르지 않습니다. 설정에서 키를 다시 확인해주세요.");
        setShowSettings(true);
      } else {
        alert(`오류가 발생했습니다:\n${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. TTS 음성 읽기 (하이브리드 방식)
  const speakText = (text, callback) => {
    // 이전 오디오 정지
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    window.speechSynthesis.cancel();

    log(`🔊 음성 재생 시도: ${text.substring(0, 10)}...`);

    // 1차 시도: Google Translate TTS (녹화 호환용)
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ko&q=${encodeURIComponent(text)}`;
    const audio = new Audio(url);
    currentAudioRef.current = audio;

    audio.onended = () => {
      currentAudioRef.current = null;
      if (callback) callback();
    };

    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error("Google TTS Playback Failed:", error);
        log("⚠️ Google TTS 실패. 기본 음성으로 전환합니다.");
        // 2차 시도: Web Speech API (Fallback)
        speakTextFallback(text, callback);
      });
    }
  };

  // Fallback: Web Speech API (기본 음성)
  const speakTextFallback = (text, callback) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      if (callback) callback();
    };

    window.speechSynthesis.speak(utterance);
  };

  // 3. 자동 재생 로직 (Auto-Play)
  useEffect(() => {
    if (isPlaying && cards?.length > 0) {
      const currentCard = cards[currentIndex];

      // 해당 카드로 스크롤 이동
      if (cardRefs.current[currentIndex]) {
        cardRefs.current[currentIndex].scrollIntoView({ behavior: "smooth", block: "center" });
      }

      // 음성 재생 후 다음 카드로 이동
      speakText(currentCard?.text, () => {
        if (currentIndex < cards.length - 1) {
          // 약간의 딜레이 후 다음 장으로
          setTimeout(() => setCurrentIndex((prev) => prev + 1), 1000);
        } else {
          // 끝까지 다 읽으면 종료
          // 녹화 중이라면 녹화 종료
          if (isRecording && mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
          }
          setIsPlaying(false);
          setCurrentIndex(0);
        }
      });
    } else if (!isPlaying) {
      // 재생 중지 시 오디오도 정지
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      window.speechSynthesis.cancel();
    }
  }, [isPlaying, currentIndex, cards, isRecording]);

  // 재생 모드 시작
  const startAutoPlay = () => {
    if (cards?.length === 0) return;
    log("▶️ 전체 재생 시작");
    setIsPlaying(true);
    setCurrentIndex(0);
  };

  // 재생 모드 중지
  const stopAutoPlay = () => {
    setIsPlaying(false);
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    window.speechSynthesis.cancel();
    // 녹화 중지
    if (isRecording && mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  // 녹화 시작 함수
  const startRecording = async () => {
    try {
      // 0. 모바일 지원 여부 확인
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        alert("📱 모바일 브라우저 보안 정책상 '앱 내 화면 녹화'가 불가능합니다.\n\n상단바를 내려 휴대폰 자체의 [화면 녹화] 기능을 켜고 '전체 재생'을 눌러주세요!");
        return;
      }

      // 1. 사용자 안내 (필수)
      const confirmed = window.confirm(
        "🎥 [녹화 준비 가이드]\n\n" +
        "브라우저 화면 공유 창이 뜨면 다음을 꼭 지켜주세요!\n\n" +
        "1. 상단 탭에서 [Chrome 탭] (또는 브라우저 탭) 선택\n" +
        "2. 현재 실행 중인 [쇼츠 앱] 탭 선택\n" +
        "3. ⭐⭐ 하단 [오디오 공유] 스위치 ON 필수! ⭐⭐\n" +
        "   (이걸 켜야 목소리가 녹음됩니다)\n\n" +
        "준비되셨나요?"
      );

      if (!confirmed) return;

      // 2. 화면 공유 요청 (오디오 포함)
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
        preferCurrentTab: true // Chrome 힌트
      });

      // 3. MediaRecorder 설정 (코덱 지원 확인)
      const mimeType = MediaRecorder.isTypeSupported("video/webm; codecs=vp9")
        ? "video/webm; codecs=vp9"
        : "video/webm"; // Fallback

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      recordedChunks.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        // 5. 파일 다운로드
        const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'shopping_shorts.webm'; // 파일명 변경
        a.click();
        URL.revokeObjectURL(url);

        // 트랙 종료 (공유 중지)
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      };

      // 4. 녹화 시작
      recorder.start();
      setIsRecording(true);

      // 5. 자동 재생 실행 (100ms 딜레이)
      setTimeout(() => startAutoPlay(), 100);

    } catch (err) {
      console.error("녹화 시작 실패:", err);
      // 취소했을 때 등 에러 처리
    }
  };

  return (
    // PC 배경 (회색) - 핸드폰 시뮬레이터 느낌
    // 모바일에서는 전체 화면 (bg-black), PC에서는 회색 배경 (bg-gray-900)
    <div className="min-h-screen bg-black md:bg-gray-900 flex justify-center items-center font-sans md:py-8">

      {/* 핸드폰 프레임 컨테이너 */}
      {/* 모바일: 전체 화면 꽉 채움 (w-full h-dvh) */}
      {/* PC: 핸드폰 프레임 스타일 적용 (max-w-[480px] rounded border shadow 등) */}
      <div className="w-full h-[100dvh] md:max-w-[480px] md:h-[850px] bg-black md:rounded-[3rem] md:border-[8px] md:border-gray-800 md:shadow-2xl relative overflow-hidden flex flex-col md:ring-4 md:ring-gray-900/50">

        {/* 상단 상태바 (가짜) - PC에서만 표시 */}
        <div className="hidden md:flex absolute top-0 inset-x-0 h-6 bg-black z-50 justify-between items-center px-6 text-[10px] text-white font-medium">
          <span>9:41</span>
          <div className="flex gap-1">
            <span>📶</span>
            <span>🔋</span>
          </div>
        </div>

        {/* 헤더 & 입력창 (재생 중에는 숨김, 스크롤 가능) */}
        {!isPlaying && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide pt-6 md:pt-12">
            <header className="text-center space-y-2 mt-4 relative">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                AI Shorts Maker 🚀
              </h1>
              <p className="text-gray-400 text-xs">나만의 쇼츠를 만들어보세요!</p>
              <button
                onClick={() => setShowSettings(true)}
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
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveKey(apiKey)}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold text-sm"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-bold text-sm"
                    >
                      닫기
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 shadow-lg">
              <input
                type="text"
                placeholder="주제 입력 (예: 고양이의 하루)"
                className="w-full bg-gray-900 text-white p-4 rounded-xl border border-gray-600 focus:border-purple-500 focus:outline-none mb-4 text-sm"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generateContent()}
              />
              <button
                onClick={generateContent}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${loading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg hover:shadow-purple-500/30"
                  }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    생성 중...
                  </span>
                ) : (
                  "✨ 쇼츠 생성하기"
                )}
              </button>
            </div>

            {/* 디버그 로그 영역 */}
            {debugLog && (
              <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 text-xs font-mono text-gray-400 whitespace-pre-wrap break-all">
                {debugLog.split('\n').map((line, index) => (
                  <p key={index} className={line.startsWith('❌') ? 'text-red-400' : 'text-gray-400'}>
                    {line}
                  </p>
                ))}
              </div>
            )}

            {/* 카드 리스트 (재생 아닐 때 미리보기) */}
            {!isPlaying && cards?.length > 0 && (
              <div className="space-y-4 pb-24">
                {cards.map((card, index) => (
                  <div key={card.id} className="relative rounded-xl overflow-hidden aspect-[9/16] border border-gray-800 group cursor-pointer hover:border-purple-500 transition-all">
                    <img src={card.imageUrl} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white font-bold">미리보기</span>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 p-3 text-xs text-white truncate backdrop-blur-sm">
                      {index + 1}. {card.text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 결과 화면 (재생 모드) */}
        <div className={`transition-all duration-500 ${isPlaying ? "absolute inset-0 z-40 bg-black flex items-center justify-center" : "hidden"}`}>
          {cards?.length > 0 && (
            <div className="w-full h-full relative">
              {cards.map((card, index) => (
                <div
                  key={card.id}
                  ref={(el) => (cardRefs.current[index] = el)}
                  className={`absolute inset-0 transition-opacity duration-500 ${index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                    }`}
                >
                  {/* 이미지 */}
                  <img
                    src={card?.imageUrl}
                    alt={card?.imagePrompt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* 텍스트 오버레이 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-8 pb-32">
                    {/* 스피커 아이콘 (현재 재생 중일 때만 표시) */}
                    {index === currentIndex && (
                      <div className="mb-4 flex justify-center">
                        <span className="text-4xl animate-pulse filter drop-shadow-lg">🔊</span>
                      </div>
                    )}
                    <p className="text-white text-2xl font-bold leading-relaxed drop-shadow-lg break-keep text-center animate-fade-in-up">
                      {card?.text}
                    </p>
                  </div>

                  {/* 순서 표시 */}
                  <div className="absolute top-8 right-6 bg-black/60 px-3 py-1 rounded-full text-xs font-mono backdrop-blur-md border border-white/10">
                    {index + 1} / {cards.length}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 하단 컨트롤 바 (Fixed within Phone Container) */}
        {cards?.length > 0 && (
          <div className="absolute bottom-6 left-0 right-0 z-50 flex gap-2 px-4 justify-center">
            {!isPlaying ? (
              <>
                <button
                  onClick={startAutoPlay}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white py-4 rounded-full font-bold shadow-lg hover:shadow-green-500/30 transition-all animate-bounce text-sm"
                >
                  <span>▶️</span> 전체 재생
                </button>
                <button
                  onClick={startRecording}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white py-4 rounded-full font-bold shadow-lg hover:shadow-red-500/30 transition-all text-sm"
                >
                  <span>💾</span> 영상 추출
                </button>
              </>
            ) : (
              <button
                onClick={stopAutoPlay}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white py-4 rounded-full font-bold shadow-lg hover:shadow-red-500/30 transition-all"
              >
                <span>⏹️</span> {isRecording ? "녹화 및 재생 중지" : "재생 중지"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
