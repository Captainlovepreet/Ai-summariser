# Aura Summarizer - Python Backend

This application uses a TypeScript/React frontend for a seamless interactive experience. However, the core summarization logic is also available as a standalone Python script for CLI or server integration.

## Usage

1. **Install Dependencies**:
   ```bash
   pip install google-generativeai
   ```

2. **Set API Key**:
   ```bash
   export GEMINI_API_KEY="your_api_key_here"
   ```

3. **Run the Script**:
   ```bash
   python summarizer.py
   ```

## Why Python?
Python is excellent for batch processing and data science workflows. If you wish to extend this app to handle massive datasets or integrate with machine learning pipelines, the `summarizer.py` script provided in the root directory is your starting point.

## In this App
In this web application, we use the `@google/genai` TypeScript SDK to provide:
- Instant feedback
- Multimodal file uploads (PDF/Audio) directly from the browser
- Zero-latency chat interaction
