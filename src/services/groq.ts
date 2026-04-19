import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL_NAME = 'llama-3.3-70b-versatile';
const FALLBACK_MODELS = ['llama-3.1-8b-instant', 'openai/gpt-oss-20b'];
const RUNTIME_API_KEY_STORAGE = 'summora_groq_api_key';

// Initialize PDF.js worker using Vite's URL import
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
}

let activeClientApiKey = '';
let runtimeApiKey = '';
let runtimeApiKeyLoaded = false;

function readRuntimeKeyFromStorage() {
  if (typeof window === 'undefined') return '';

  try {
    return window.localStorage.getItem(RUNTIME_API_KEY_STORAGE)?.trim() || '';
  } catch {
    return '';
  }
}

function writeRuntimeKeyToStorage(key: string) {
  if (typeof window === 'undefined') return;

  try {
    if (key) {
      window.localStorage.setItem(RUNTIME_API_KEY_STORAGE, key);
    } else {
      window.localStorage.removeItem(RUNTIME_API_KEY_STORAGE);
    }
  } catch {
    // Ignore storage write errors in restricted browser modes.
  }
}

function getEnvironmentApiKey() {
  const viteKey = import.meta.env.VITE_GROQ_API_KEY;
  const legacyKey = (import.meta.env as Record<string, string | undefined>).GROQ_API_KEY;
  return (viteKey || legacyKey || '').trim();
}

function resetClient() {
  activeClientApiKey = '';
}

function ensureRuntimeKeyLoaded() {
  if (runtimeApiKeyLoaded) return;
  runtimeApiKey = readRuntimeKeyFromStorage();
  runtimeApiKeyLoaded = true;
}

export function loadRuntimeGroqApiKey() {
  ensureRuntimeKeyLoaded();
  return runtimeApiKey;
}

export function setRuntimeGroqApiKey(apiKey: string) {
  const nextKey = apiKey.trim();
  runtimeApiKey = nextKey;
  runtimeApiKeyLoaded = true;
  writeRuntimeKeyToStorage(nextKey);
  resetClient();
  return runtimeApiKey;
}

export function clearRuntimeGroqApiKey() {
  return setRuntimeGroqApiKey('');
}

export function getGroqApiKeySource() {
  const runtimeKey = loadRuntimeGroqApiKey();
  if (runtimeKey) return 'runtime' as const;
  if (getEnvironmentApiKey()) return 'environment' as const;
  return null;
}

export function getResolvedGroqApiKey() {
  const runtimeKey = loadRuntimeGroqApiKey();
  return runtimeKey || getEnvironmentApiKey();
}

export function hasGroqApiKey() {
  return Boolean(getResolvedGroqApiKey());
}

export type SummaryStyle = 'bullet points' | 'prose' | 'executive summary' | 'action items';
export type SummaryLength = 'short' | 'medium' | 'detailed';

export interface SummarizeOptions {
  style: SummaryStyle;
  length: SummaryLength;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;

  try {
    return JSON.stringify(error);
  } catch {
    return 'Unknown Groq API error.';
  }
}

// Limit conversation history to prevent token overflow (keep last 10 messages)
function truncateMessages(messages: Array<{ role: string; content: string }>) {
  const maxMessages = 10;
  if (messages.length <= maxMessages) return messages;
  
  // Keep system message if exists, plus last N messages
  const systemMessages = messages.filter(m => m.role === 'system');
  const nonSystemMessages = messages.filter(m => m.role !== 'system');
  
  return [...systemMessages, ...nonSystemMessages.slice(-maxMessages)];
}

// Truncate large text content to prevent token limits (approximately 30KB)
function truncateContent(text: string, maxChars: number = 30000): string {
  if (text.length <= maxChars) return text;
  
  const truncated = text.substring(0, maxChars);
  return truncated + '\n\n[Content truncated due to size limits...]';
}

// Extract text from PDF base64 - much more efficient than sending raw base64
async function extractTextFromPDF(base64Data: string): Promise<string> {
  try {
    // Verify we have a valid worker source
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      console.warn('PDF worker not properly initialized, attempting text extraction without worker');
    }

    // Convert base64 to ArrayBuffer
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const arrayBuffer = bytes.buffer;

    // Load PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let extractedText = '';

    // Extract text from each page (max 50 pages to prevent excessive processing)
    const totalPages = Math.min(pdf.numPages, 50);
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => (typeof item.str === 'string' ? item.str : ''))
          .join(' ');
        extractedText += pageText + '\n';
      } catch (pageError) {
        console.warn(`Failed to extract text from page ${pageNum}:`, pageError);
        // Continue with next page even if one fails
      }
    }

    if (!extractedText.trim()) {
      throw new Error('No text could be extracted from PDF. The PDF may be image-based.');
    }

    return extractedText.trim();
  } catch (error) {
    console.error('PDF extraction error:', error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to extract text from PDF: ${message}`);
  }
}

async function callGroqAPI(messages: Array<{ role: string; content: string }>) {
  const apiKey = getResolvedGroqApiKey();

  if (!apiKey) {
    throw new Error(
      'Missing Groq API key. Set it in API Settings or provide VITE_GROQ_API_KEY (or GROQ_API_KEY) in .env.local.',
    );
  }

  // Truncate message history to prevent token overflow
  const truncatedMessages = truncateMessages(messages);
  
  const models = [DEFAULT_MODEL_NAME, ...FALLBACK_MODELS];
  let lastError: unknown = null;

  for (const model of models) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: truncatedMessages,
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
        lastError = new Error(`Groq API error: ${errorMessage}`);
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        lastError = new Error('No content in Groq API response');
        continue;
      }

      return content;
    } catch (error) {
      lastError = error;
      continue;
    }
  }

  const message = getErrorMessage(lastError);
  throw new Error(message);
}

export async function summarizeContent(
  content: string | { mimeType: string; data: string },
  options: SummarizeOptions,
) {
  let textContent: string;

  if (typeof content === 'string') {
    textContent = truncateContent(content, 20000);
  } else {
    const mimeType = content.mimeType;
    
    // Special handling for PDFs - extract text instead of sending base64
    if (mimeType === 'application/pdf') {
      textContent = await extractTextFromPDF(content.data);
      textContent = truncateContent(textContent, 20000);
    } else {
      // For other binary formats, still use truncated base64
      const truncatedBase64 = truncateContent(content.data, 10000);
      textContent = `[${mimeType}]\n${truncatedBase64}`;
    }
  }

  const prompt = `Summarize the provided content. 
Style: ${options.style}
Length: ${options.length}
Focus on key insights and main takeaways. 
If it's a transcript, identify speakers if possible. 
If it's a PDF, maintain technical accuracy.

Content to summarize:
${textContent}`;

  const messages = [
    {
      role: 'user',
      content: prompt,
    },
  ];

  return await callGroqAPI(messages);
}

export async function chatWithContent(
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  message: string,
) {
  const messages = history.map((msg) => ({
    role: msg.role === 'model' ? 'assistant' : 'user',
    content: truncateContent(msg.parts[0]?.text || '', 5000), // Limit individual message size
  }));

  messages.push({
    role: 'user',
    content: truncateContent(message, 5000),
  });

  return await callGroqAPI(messages);
}
