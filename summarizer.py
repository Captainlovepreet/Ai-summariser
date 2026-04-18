import os
import google.generativeai as genai
from typing import List, Optional

class AuraSummarizer:
    """
    A Python-based AI Summarizer using Gemini.
    Can be used as a CLI or imported as a module.
    """
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel("gemini-3-flash-preview")

    def summarize_text(self, text: str, style: str = "bullet points", length: str = "medium") -> str:
        prompt = f"Summarize the following text in {length} length using {style}:\n\n{text}"
        response = self.model.generate_content(prompt)
        return response.text

    def summarize_file(self, file_path: str, mime_type: str) -> str:
        # Load the file
        with open(file_path, 'rb') as f:
            data = f.read()
        
        response = self.model.generate_content([
            {"mime_type": mime_type, "data": data},
            "Provide a detailed summary of this file content."
        ])
        return response.text

if __name__ == "__main__":
    # Example usage
    summarizer = AuraSummarizer()
    print("Aura Summarizer Python Logic Ready")
