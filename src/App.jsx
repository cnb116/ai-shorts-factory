import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Header from './components/Header';
import InputForm from './components/InputForm';
import ResultCard from './components/ResultCard';
import ControlPanel from './components/ControlPanel';

const App = () => {
  // API Key from Environment Variable
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  console.log("Current API Key:", apiKey ? apiKey.substring(0, 8) + "..." : "Not Found");

  const [topic, setTopic] = useState("");
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [debugLog, setDebugLog] = useState(""); // 디버깅 로그 상태
  const [isRecording, setIsRecording] = useState(false); // 녹화 상태
  const [isKakaoBrowser, setIsKakaoBrowser] = useState(false); // 카카오톡 인앱 브라우저 감지

  const cardRefs = useRef([]);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const currentAudioRef = useRef(null); // 현재 재생 중인 오디오 객체

  // Gemini 인스턴스 생성 (API Key가 변경될 때마다)
  const getGenAI = () => new GoogleGenerativeAI(apiKey);

  // 카카오톡 인앱 브라우저 감지 및 탈출 로직
  useEffect(() => {
    const userAgent = navigator.userAgent;
    // 카카오톡 인앱 브라우저라면
    if (userAgent.match(/KAKAOTALK/i)) {
      // 안드로이드: 크롬으로 자동 전환
      if (userAgent.match(/Android/i)) {
        location.href = 'intent://' + location.href.replace(/https?:\/\//i, '') + '#Intent;scheme=https;package=com.android.chrome;end';
      }
      // 아이폰: 안내 모달 표시
      else if (userAgent.match(/iPhone|iPad|iPod/i)) {
        setIsKakaoBrowser(true);
      }
    }
  }, []);

  // 로그 출력 함수

  // 로그 출력 함수
  const log = (message, isError = false) => {
    console.log(message);
    setDebugLog((prev) => prev + (prev ? "\n" : "") + (isError ? "❌ " : "✅ ") + message);
  };

  // 1. 콘텐츠 생성 (Gemini + Pollinations)
  const generateContent = async () => {
    if (!topic) return alert("주제를 입력해주세요!");
    if (!topic) return alert("주제를 입력해주세요!");

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
        alert("API Key가 올바르지 않습니다. 코드를 확인해주세요.");
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

            <Header />

            <InputForm
              topic={topic}
              setTopic={setTopic}
              onGenerate={generateContent}
              loading={loading}
            />

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
                  <ResultCard key={card.id} card={card} index={index} />
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
          <ControlPanel
            isPlaying={isPlaying}
            isRecording={isRecording}
            onStartAutoPlay={startAutoPlay}
            onStartRecording={startRecording}
            onStop={stopAutoPlay}
          />
        )}
        {/* 카카오톡 인앱 브라우저 안내 모달 (iOS) */}
        {isKakaoBrowser && (
          <div className="absolute inset-0 z-[100] bg-black/90 flex flex-col justify-center items-center p-8 text-center animate-fade-in">
            <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700 max-w-xs">
              <div className="text-4xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-white mb-3">브라우저 변경 안내</h2>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                카카오톡에서는 오디오 재생이<br />
                원활하지 않을 수 있습니다.
              </p>
              <div className="space-y-3 text-left bg-black/50 p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <span className="bg-yellow-500 text-black font-bold rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">1</span>
                  <p className="text-gray-200 text-xs">화면 우측 하단 <span className="text-white font-bold">점 3개(⋯)</span> 클릭</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-yellow-500 text-black font-bold rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">2</span>
                  <p className="text-gray-200 text-xs"><span className="text-white font-bold">다른 브라우저로 열기</span> 선택</p>
                </div>
              </div>
              <button
                onClick={() => setIsKakaoBrowser(false)}
                className="mt-6 w-full py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm font-medium transition-colors"
              >
                닫기 (그냥 계속하기)
              </button>
            </div>
            {/* 화살표 애니메이션 (우측 하단을 가리킴) */}
            <div className="absolute bottom-8 right-8 animate-bounce">
              <span className="text-4xl">↘️</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
