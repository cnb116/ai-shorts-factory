from google import genai
from google.genai import types
import json
import os
import webbrowser 
import time

# ==========================================
# ▼ [필수] API 키 입력 (따옴표 지우지 마세요!)
MY_API_KEY = "AIzaSyBejIpKdcIFEYIvNZqD7Ja4bYNdgODb95c"# ==========================================

def generate_content(product_info):
    client = genai.Client(api_key=MY_API_KEY)
    
    sys_instruct = """
    당신은 '바이럴 마케팅 전문가'이자 '프론트엔드 웹 개발자'입니다.
    사용자가 [상품 정보]를 입력하면, 분석 후 다음 두 가지를 포함한 JSON 데이터만 출력하세요.
    1. shorts_script: 유튜브 쇼츠용 대본 (후킹, 본문, 행동 유도)
    2. html_code: 모바일 랜딩 페이지 HTML/CSS 코드 (카드 뉴스 스타일, 이미지는 400x400 placeholder 사용)
    
    [제약 사항]
    - 반드시 순수한 JSON 형식으로만 출력할 것.
    - 마크다운(```json 등) 기호 절대 사용 금지.
    """

    response = client.models.generate_content(
        # ▼ [복구 완료] 아까 성공했던 그 모델입니다!
        model="gemini-2.0-flash-exp", 
        config=types.GenerateContentConfig(
            system_instruction=sys_instruct,
            response_mime_type="application/json",
            temperature=0.7
        ),
        contents=product_info
    )
    return response.text

# === 메인 실행 ===
if __name__ == "__main__":
    print("🛒 AI 마케터에게 상품 정보를 전달합니다...")
    print("⏳ (잠시만 기다려주세요, 생각하는 중입니다...)")
    
    input_product = "상품명: 부산 할매 김치찜. 특징: 3년 묵은지, 전자레인지 5분 컷, 고기 듬뿍."
    
    try:
        result_text = generate_content(input_product)
        data = json.loads(result_text)
        
        # HTML 저장
        html_content = data['html_code']
        file_path = "result_page.html"
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(html_content)
            
        print(f"\n✅ 파일 저장 완료: {file_path}")
        print("🚀 3초 뒤 브라우저가 뜹니다!")
        
        time.sleep(3) # 파일 저장 안정화 대기
        webbrowser.open(os.path.abspath(file_path))
        
    except Exception as e:
        print("\n❌ 오류가 발생했습니다.")
        print(e)
        if "429" in str(e):
            print("\n🚨 [과속 방지] 너무 빨리 재실행했습니다. 1분만 쉬었다가 다시 해보세요!")