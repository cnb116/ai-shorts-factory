import google.generativeai as genai

MY_API_KEY = "AIzaSyBejIpKdcIFEYIvNZqD7Ja4bYNdgODb95c"
genai.configure(api_key=MY_API_KEY)

print("Available models:")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print(f"Error listing models: {e}")
