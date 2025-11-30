# Shopping Shorts App Architecture

This document outlines the system architecture and data flow of the Shopping Shorts App, detailing how user input is processed by AI to generate monetizable short-form video content.

```mermaid
graph TD
    subgraph User_Input [사용자 입력 단계]
        RawData[원시 상품 정보] --> |입력| UI[쇼핑 쇼츠 앱 UI]
    end

    subgraph The_Brain [AI 뇌: Google AI Studio]
        UI --> |API Call| ModelA[모델 A: 분석가<br/>(Summarizer)]
        ModelA --> |요약 텍스트| ModelB[모델 B: 창작자<br/>(Creator)]
        ModelB --> |Strict JSON| Logic[데이터 구조화]
    end

    subgraph The_Body [몸체: React Web App]
        Logic --> |JSON Parsing| Script[쇼츠 대본]
        Logic --> |JSON Parsing| HTML[랜딩 페이지 코드]
        Logic --> |Image Prompt| ImgGen[이미지 생성<br/>(Pollinations.ai)]
        Logic --> |Text| Audio[TTS & BGM<br/>(Web Speech API)]
        
        Script & HTML & ImgGen & Audio --> |Rendering| Preview[화면 렌더링]
        Preview --> |MediaRecorder| FinalVideo[최종 영상 파일<br/>(.webm)]
    end

    subgraph Profit [수익화]
        FinalVideo --> |업로드| Platform[유튜브/틱톡]
        HTML --> |링크 치환| Affiliate[수익 링크<br/>(쿠팡 파트너스)]
    end
```

## Workflow Description

1.  **User Input**: The user provides raw product information (URL, description, price, etc.) into the app's UI.
2.  **The Brain (AI Processing)**:
    *   **Summarizer (Model A)**: Analyzes the raw data to extract key marketing points (Product Name, Price, USP, Target Audience).
    *   **Creator (Model B)**: Takes the summarized data and generates a creative shorts script and a responsive HTML landing page code. It enforces a strict JSON output format.
3.  **The Body (Application Logic)**:
    *   **Parsing**: The app parses the JSON response.
    *   **Asset Generation**:
        *   **Script**: Used for TTS (Text-to-Speech) and on-screen text.
        *   **HTML**: Renders the visual preview of the landing page.
        *   **Images**: Generated dynamically using Pollinations.ai based on prompts derived from the product description.
        *   **Audio**: Background music and TTS voiceover are mixed.
    *   **Rendering & Recording**: The combined visual and audio elements are rendered in the browser and captured using the `MediaRecorder` API to create a `.webm` video file.
4.  **Profit (Monetization)**:
    *   The final video is uploaded to platforms like YouTube Shorts or TikTok.
    *   The generated HTML can be used as a landing page with affiliate links (e.g., Coupang Partners) to drive sales.
