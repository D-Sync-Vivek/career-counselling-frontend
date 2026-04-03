from google import genai
import sys

# 1. Setup the client
# PRO TIP: Replace 'YOUR_API_KEY' with your actual key
client = genai.Client(api_key="AIzaSyDDhH7q8EPRz0gty5bDEFZsU6dWIRXaO4g")

# 2. Get the prompt from the terminal
user_prompt = " ".join(sys.argv[1:])

if not user_prompt:
    print("Usage: python gemini.py 'your question here'")
else:
    # 3. Generate content using the latest model
    response = client.models.generate_content(
        model="gemini-1.5-flash", 
        contents=user_prompt
    )
    print("\nGemini:")
    print(response.text)