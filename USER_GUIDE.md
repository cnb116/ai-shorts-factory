# Shopping Shorts App - 사용자 가이드

이 문서는 **Shopping Shorts App**의 관리 및 사용 방법을 설명합니다.

## 1. 상품 추가하기 (Adding Products)

새로운 쇼츠 영상과 상품을 추가하려면 `src/data/mockVideos.js` 파일을 수정해야 합니다.

1.  `src/data/mockVideos.js` 파일을 엽니다.
2.  파일 상단에 있는 **"복사해서 쓰세요"** 주석 아래의 템플릿 코드를 복사합니다.
3.  `mockVideos` 배열 안에 복사한 코드를 붙여넣고, 내용을 수정합니다.

```javascript
{
    id: 4, // 겹치지 않는 고유한 숫자
    url: "영상_URL",
    title: "영상 제목",
    description: "영상 설명",
    likes: 0,
    comments: 0,
    user: {
        name: "사용자명",
        avatar: "프로필_이미지_URL"
    },
    product: {
        id: "prod_004", // 겹치지 않는 상품 ID
        name: "상품명",
        price: "가격 (예: ₩10,000)",
        image: "상품_이미지_URL",
        promoText: "홍보 문구 (선택사항, 예: 🔥 인기 상품)"
    }
}
```

## 2. 구매 링크 연결 설정 (Link Configuration)

'바로 구매하기' 버튼을 눌렀을 때 이동하는 쇼핑몰 주소를 변경하려면:

1.  `src/components/VideoPlayer.jsx` 파일을 엽니다.
2.  `handleBuyClick` 함수를 찾습니다 (약 70번째 줄).
3.  아래 코드에서 `https://your-shop-link.com/` 부분을 실제 쇼핑몰 주소로 변경하세요.

```javascript
const productUrl = `https://your-shop-link.com/${video.product.id}`;
```

*   **참고:** 뒤에 붙는 `${video.product.id}`는 위에서 설정한 상품 ID가 자동으로 들어갑니다.

## 3. 모바일 앱처럼 사용하기 (Mobile Usage)

이 웹사이트는 **PWA (Progressive Web App)** 기술이 적용되어 있어, 스마트폰에 앱처럼 설치할 수 있습니다.

1.  스마트폰 브라우저(Chrome, Safari 등)로 접속합니다.
2.  브라우저 메뉴에서 **"홈 화면에 추가"**를 선택합니다.
3.  홈 화면에 생긴 아이콘을 누르면, 주소창 없는 전체 화면으로 실행됩니다.
4.  가로로 회전해도 스마트폰 비율이 유지됩니다.

## 4. 분석 데이터 확인 (Analytics)

현재는 기본적인 방문 및 클릭 로그가 브라우저 콘솔에 기록되도록 설정되어 있습니다.

1.  PC 브라우저에서 **F12** 키를 눌러 개발자 도구를 엽니다.
2.  **Console** 탭을 클릭합니다.
3.  다음과 같은 로그를 확인할 수 있습니다:
    *   `[Analytics] Event: page_view` (페이지 접속 시)
    *   `[Analytics] Event: buy_click` (구매 버튼 클릭 시)

*   **참고:** 실제 Google Analytics 등을 연동하려면 `src/utils/analytics.js` 파일을 수정하여 코드를 추가하면 됩니다.

## 5. 웹페이지 활용 가이드 (Webpage Usage)

이 웹페이지는 단순한 쇼핑몰이 아니라, **쇼츠 영상 제작을 돕는 도구**로도 활용할 수 있습니다.

### 🅰️ 일반 사용자 모드 (General)
*   **영상 시청**: 틱톡이나 릴스처럼 위아래로 스크롤하면 다음 영상이 자동으로 재생됩니다.
*   **상품 확인**: 영상 하단에 상품 정보가 표시됩니다.
*   **구매하기**: '바로 구매하기' 버튼을 누르면 실제 쇼핑몰 페이지로 이동합니다.

### 🅱️ 크리에이터 모드 (For Creators)
화면 상단의 아이콘을 활용하여 고퀄리티 쇼츠 영상을 쉽게 만들 수 있습니다.

1.  **투명 레이어 (Overlay Mode)**
    *   상단의 **테마 버튼(🌙/☀️)**을 눌러 배경을 **녹색(Green Screen)**으로 만드세요.
    *   이 상태로 화면을 녹화한 뒤, 영상 편집 앱(CapCut 등)에서 '크로마키' 기능을 사용하면 상품 정보만 내 영상 위에 띄울 수 있습니다.

2.  **인트로 강조 (Highlight Mode)**
    *   상단의 **반짝이 버튼(✨)**을 누르면 상품 정보가 강조됩니다.
    *   쇼츠 도입부("오늘 소개할 꿀템은?")에 이 화면을 넣으면 시선을 사로잡을 수 있습니다.

3.  **사용법 가이드 (In-App Guide)**
    *   상단의 **물음표 버튼(?)**을 누르면 상황별 활용 꿀팁을 언제든 다시 볼 수 있습니다.
