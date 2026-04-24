import google.generativeai as genai

genai.configure(api_key="AIzaSyACLDIiK-n_NWF3xdXDNPXCvJ2BJQ-lZYE")

for m in genai.list_models():
    if "generateContent" in m.supported_generation_methods:
        print(m.name)