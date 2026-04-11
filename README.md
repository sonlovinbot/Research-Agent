<div align="center">
</div>

# Research Agent Pro

**Research Agent Pro** is a Perplexity-style AI research assistant that searches the web in real-time via **Serper API** and synthesizes comprehensive, blog-quality answers using **Google Gemini Flash**. Built with React 19, TypeScript and Vite.

## Features

- **Web Search & Synthesis** -- Ask any question, the agent searches Google (text, images, videos) in parallel, then synthesizes a cited, well-structured answer via Gemini Flash.
- **Chat History** -- All conversations are automatically saved to localStorage. Rename, delete, or resume any past session from the sidebar.
- **Quiz Generation** -- Auto-generate multiple-choice quizzes from any research result to test comprehension.
- **Mindmap Generation** -- Visualize key concepts as interactive mindmaps powered by markmap.js.
- **Multi-language & Region** -- Configure search country and language (default: Vietnam / Vietnamese).
- **Dark / Light Theme** -- Toggle between themes, preference is persisted.
- **Session Auth & Settings** -- Simple login gate with per-user API key management stored in localStorage.

## Architecture

```mermaid
graph TD
    subgraph UI ["UI Layer (React 19 + Tailwind)"]
        A[App.tsx] --> B[LoginScreen]
        A --> C[SettingsModal]
        A --> D[ContentSelectionModal]
        A --> L[ChatHistory]
        A --> E[ChatMessage]
        E --> F[MarkdownRenderer]
        E --> G[ImageGallery]
        E --> H[VideoGallery]
        E --> I[SearchResultCard]
        E --> J[QuizComponent]
        E --> K[MindmapRenderer]
    end

    subgraph Services ["Service Layer"]
        S1[serperService.ts]
        S2[geminiService.ts]
    end

    subgraph Storage ["Client Storage"]
        LS[localStorage]
    end

    subgraph External ["External APIs"]
        EX1[Serper API]
        EX2[Gemini API]
    end

    A -- "user query" --> S1
    A -- "user query" --> S2
    A -- "sessions, settings" --> LS
    S1 -- "searchGoogle\nsearchGoogleImages\nsearchGoogleVideos" --> EX1
    S2 -- "generateSynthesis\ngenerateQuiz\ngenerateMindmap" --> EX2

    style UI fill:#0d1117,stroke:#30363d,color:#c9d1d9
    style Services fill:#161b22,stroke:#30363d,color:#c9d1d9
    style Storage fill:#1c2128,stroke:#30363d,color:#c9d1d9
    style External fill:#1c2128,stroke:#30363d,color:#c9d1d9
```

## Data Flow

```mermaid
sequenceDiagram
    participant U as User
    participant App as App.tsx
    participant LS as localStorage
    participant Serper as Serper API
    participant Gemini as Gemini API

    U->>App: Enter search query
    App->>LS: Create/load chat session
    App->>App: Add user message + placeholder agent message

    par Parallel Search
        App->>Serper: searchGoogle(query)
        App->>Serper: searchGoogleImages(query)
        App->>Serper: searchGoogleVideos(query)
    end

    Serper-->>App: Text + Image + Video results
    App->>App: Update agent message (stage: synthesizing)
    App->>Gemini: generateSynthesis(query, results)
    Gemini-->>App: Markdown blog post with citations
    App->>App: Update agent message (stage: done)
    App->>LS: Auto-save session
    App-->>U: Render full answer with sources, images, videos
```

## Project Structure

```
Research-Agent/
├── App.tsx              # Main app: state, auth, history, routing, handlers
├── index.tsx            # React entry point
├── index.html           # HTML shell
├── types.ts             # TypeScript interfaces (Message, Settings, ChatSession, etc.)
├── constants.ts         # Default settings, Gemini models, country/language options
├── components/
│   ├── ChatHistory.tsx          # Sidebar: list, rename, delete past sessions
│   ├── ChatMessage.tsx          # Single message bubble (text + media + actions)
│   ├── ContentSelectionModal.tsx # Modal to pick a message for quiz/mindmap
│   ├── ImageGallery.tsx         # Grid display for image results
│   ├── VideoGallery.tsx         # Grid display for video results
│   ├── LoginScreen.tsx          # Auth gate
│   ├── MarkdownRenderer.tsx     # Renders markdown with remark-gfm
│   ├── MindmapRenderer.tsx      # Interactive mindmap via markmap
│   ├── QuizComponent.tsx        # Interactive quiz UI
│   ├── SearchResultCard.tsx     # Single search result card
│   └── SettingsModal.tsx        # API keys, model, temperature, region
├── services/
│   ├── serperService.ts   # Serper API: text, image, video search
│   └── geminiService.ts   # Gemini API: synthesis, quiz, mindmap
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Markdown | react-markdown + remark-gfm |
| Mindmap | markmap-lib + markmap-view + D3 |
| Search API | Serper Dev (Google Search) |
| LLM API | Google Gemini Flash (gemini-2.0-flash default) |

## Getting Started

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open the app, go to **Settings**, and enter your **Gemini API Key** and **Serper API Key**.

   - Get a Gemini API key at [ai.google.dev](https://ai.google.dev)
   - Get a Serper API key at [serper.dev](https://serper.dev)

## License

This project is open source.
