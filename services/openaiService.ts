import { SearchResult, Settings } from '../types';

export const generateSynthesis = async (
  query: string,
  searchResults: SearchResult[],
  settings: Settings
): Promise<string> => {
  if (!settings.openAiKey) {
    throw new Error('API Key for OpenAI is missing. Please check settings.');
  }

  // Construct a context-rich prompt
  const sourcesText = searchResults.map((result, index) => {
    return `[${index + 1}] Title: ${result.title}\nURL: ${result.link}\nSummary: ${result.snippet}\n`;
  }).join('\n---\n');

  const systemPrompt = `You are a professional research assistant AI agent. 
Your goal is to answer the user's query comprehensively using ONLY the provided search results.

FORMATTING RULES:
1.  **Format as a Professional Blog Post**:
    *   Start with a catchy **Main Title** (using Markdown #).
    *   Use **Section Headers** (using Markdown ##, ###) to organize the content logicallly.
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

  const payload = {
    model: settings.model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: settings.temperature
  };

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${settings.openAiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
       const errorData = await response.json();
       throw new Error(errorData.error?.message || 'Failed to generate response from OpenAI');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "No content generated.";

  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw error;
  }
};

export const generateQuiz = async (
  content: string,
  settings: Settings
): Promise<any> => {
  if (!settings.openAiKey) {
    throw new Error('API Key for OpenAI is missing. Please check settings.');
  }

  const prompt = `Based on the following content, generate a multiple-choice quiz with 5 questions to test comprehension.
  
  Content:
  "${content.substring(0, 15000)}"

  Requirements:
  1. **Language: Vietnamese** (The quiz must be in Vietnamese).
  2. Return the output as a valid JSON object with the following structure:
  {
    "questions": [
      {
        "question": "Câu hỏi ở đây?",
        "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
        "answer": 0, // index of correct option (0-3)
        "explanation": "Giải thích ngắn gọn tại sao đúng."
      }
    ]
  }
  
  IMPORTANT: Return ONLY the JSON object. Do not wrap in markdown code blocks.`;

  const payload = {
    model: settings.model,
    messages: [
      { role: "system", content: "You are a helpful education assistant. Output valid JSON." },
      { role: "user", content: prompt }
    ],
    temperature: 0.5,
    response_format: { type: "json_object" }
  };

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${settings.openAiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
       const errorData = await response.json();
       throw new Error(errorData.error?.message || 'Failed to generate quiz');
    }

    const data = await response.json();
    let result = data.choices[0]?.message?.content || "{}";
    return JSON.parse(result);

  } catch (error) {
    console.error("OpenAI Quiz Error:", error);
    throw error;
  }
};

export const generateMindmap = async (
  content: string,
  settings: Settings
): Promise<string> => {
   if (!settings.openAiKey) {
    throw new Error('API Key for OpenAI is missing. Please check settings.');
  }

  const prompt = `Based on the following content, create a Markdown Mindmap structure compatible with markmap.js.
  
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
  4. **Language**: Vietnamese (or match the input language).
  5. Return ONLY the markdown code. Do not wrap in markdown code blocks like \`\`\`markdown.
  `;

  const payload = {
    model: settings.model,
    messages: [
      { role: "system", content: "You are a visual learning assistant. Output Markmap-compatible Markdown." },
      { role: "user", content: prompt }
    ],
    temperature: 0.3
  };

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${settings.openAiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
       const errorData = await response.json();
       throw new Error(errorData.error?.message || 'Failed to generate mindmap');
    }

    const data = await response.json();
    let result = data.choices[0]?.message?.content || "";
    // Remove markdown code blocks if present
    result = result.replace(/^```markdown\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '');
    return result.trim();

  } catch (error) {
    console.error("OpenAI Mindmap Error:", error);
    throw error;
  }
};