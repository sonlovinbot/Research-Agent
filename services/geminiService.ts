import { SearchResult, Settings } from '../types';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const callGemini = async (
  settings: Settings,
  systemPrompt: string,
  userPrompt: string,
  temperature: number,
  jsonMode = false
): Promise<string> => {
  if (!settings.geminiKey) {
    throw new Error('API Key for Gemini is missing. Please check settings.');
  }

  const url = `${GEMINI_BASE}/${settings.model}:generateContent?key=${settings.geminiKey}`;

  const payload: any = {
    contents: [
      { role: 'user', parts: [{ text: userPrompt }] }
    ],
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    generationConfig: {
      temperature,
      ...(jsonMode ? { responseMimeType: 'application/json' } : {})
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to get response from Gemini');
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

export const generateSynthesis = async (
  query: string,
  searchResults: SearchResult[],
  settings: Settings
): Promise<string> => {
  const sourcesText = searchResults.map((result, index) => {
    return `[${index + 1}] Title: ${result.title}\nURL: ${result.link}\nSummary: ${result.snippet}\n`;
  }).join('\n---\n');

  const systemPrompt = `You are a professional research assistant AI agent.
Your goal is to answer the user's query comprehensively using ONLY the provided search results.

LANGUAGE RULE (CRITICAL):
- You MUST reply in the SAME language as the user's query.
- If the user writes in Vietnamese, reply in Vietnamese.
- If the user writes in English, reply in English.
- If the user writes in any other language, reply in that language.
- When in doubt, default to Vietnamese (Tiếng Việt).

FORMATTING RULES:
1.  **Format as a Professional Blog Post**:
    *   Start with a catchy **Main Title** (using Markdown #).
    *   Use **Section Headers** (using Markdown ##, ###) to organize the content logically.
    *   Use **Bold** for key terms.
    *   Use Bullet points for lists.

2.  **Citations (CRITICAL)**:
    *   You MUST cite your sources using bracket notation like [1], [2], [3].
    *   Place citations immediately after the claim or at the end of the sentence/paragraph.
    *   Ensure every major claim maps back to a source from the list.
    *   Do NOT generate a "References" list at the bottom. The system will handle that.

3.  **Tone**:
    *   Professional, objective, engaging, and informative.
    *   Avoid generic AI intros like "Here is a blog post about...". Jump straight into the title.

If the search results don't contain enough information to answer fully, state what is missing.`;

  const userPrompt = `User Topic/Query: "${query}"

Here are the Top Search Results to use for your analysis:

${sourcesText}

Please write the comprehensive blog post now.`;

  return callGemini(settings, systemPrompt, userPrompt, settings.temperature);
};

export const generateQuiz = async (
  content: string,
  settings: Settings
): Promise<any> => {
  const systemPrompt = 'You are a helpful education assistant. Output valid JSON. You MUST generate the quiz in the same language as the input content. If the content is in Vietnamese, the quiz must be in Vietnamese. If the content is in English, the quiz must be in English. When in doubt, default to Vietnamese.';

  const userPrompt = `Based on the following content, generate a multiple-choice quiz with 5 questions to test comprehension.

  Content:
  "${content.substring(0, 15000)}"

  Requirements:
  1. **Language**: The quiz MUST be in the same language as the content above. Default to Vietnamese if unclear.
  2. Return the output as a valid JSON object with the following structure:
  {
    "questions": [
      {
        "question": "Câu hỏi ở đây?",
        "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
        "answer": 0,
        "explanation": "Giải thích ngắn gọn tại sao đúng."
      }
    ]
  }

  IMPORTANT: Return ONLY the JSON object.`;

  const result = await callGemini(settings, systemPrompt, userPrompt, 0.5, true);
  return JSON.parse(result);
};

export const generateMindmap = async (
  content: string,
  settings: Settings
): Promise<string> => {
  const systemPrompt = 'You are a visual learning assistant. Output Markmap-compatible Markdown. You MUST use the same language as the input content. If the content is in Vietnamese, output in Vietnamese. If in English, output in English. When in doubt, default to Vietnamese.';

  const userPrompt = `Based on the following content, create a Markdown Mindmap structure compatible with markmap.js.

  Content:
  "${content.substring(0, 15000)}"

  Requirements:
  1. **Structure**: Use Markdown headers (##) and list items (-) to create the hierarchy.
  2. **Frontmatter**: You MUST start the output with this exact frontmatter:
     ---
     title: markmap
     markmap:
       colorFreezeLevel: 2
     ---
  3. **Content**: Summarize the key concepts from the text. Keep nodes concise.
  4. **Language**: MUST match the input content language. Default to Vietnamese if unclear.
  5. Return ONLY the markdown code. Do not wrap in markdown code blocks.`;

  let result = await callGemini(settings, systemPrompt, userPrompt, 0.3);
  result = result.replace(/^```markdown\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '');
  return result.trim();
};
