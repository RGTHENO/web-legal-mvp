# LexVisual Frontend

**Visual Document Intelligence for Legal Professionals**

A modern, real-time chat interface for AI-powered legal document analysis with visual retrieval capabilities. This frontend connects to the LexVisual backend to deliver an intuitive experience for querying PDF documents and receiving answers with visual evidence (actual page screenshots).

---

## ✨ Features

- **Real-time Streaming Chat** — Token-by-token response streaming via Server-Sent Events (SSE)
- **Visual Citations** — See the exact document pages that support each answer, with relevance scores
- **PDF Upload & Indexing** — Drag-and-drop or click to upload legal documents with live progress
- **Multi-Document Support** — Query across all documents or scope to a specific one
- **Quick Prompts** — Pre-built queries for common legal analysis tasks (key clauses, risks, summaries)
- **Dark Mode UI** — Premium dark theme optimized for extended use

---

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| UI Components | Custom components + [Lucide Icons](https://lucide.dev/) |
| Typography | [Geist Font](https://vercel.com/font) (Sans & Mono) |
| HTTP Client | Native Fetch with SSE streaming |

---

## 📁 Project Structure

```
├── app/
│   ├── globals.css          # Global styles, CSS variables, utilities
│   ├── layout.tsx           # Root layout with fonts and metadata
│   └── page.tsx             # Main application page
│
├── components/
│   ├── chat/
│   │   ├── ChatInterface.tsx    # Main chat container with sidebar
│   │   ├── ChatInput.tsx        # Message input with file attachment
│   │   ├── ChatMessage.tsx      # User/assistant message bubbles
│   │   └── VisualCitation.tsx   # Citation thumbnails with modal preview
│   ├── ui/
│   │   ├── Button.tsx           # Reusable button component
│   │   └── Skeleton.tsx         # Loading skeleton
│   └── upload/
│       └── FileUploader.tsx     # Standalone file upload component
│
├── lib/
│   ├── api.ts               # Typed API client for backend communication
│   ├── types.ts             # TypeScript interfaces and types
│   ├── useAgentStream.ts    # Custom hook for SSE stream handling
│   └── utils.ts             # Utility functions (cn, formatters)
│
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind theme customization
└── tsconfig.json            # TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.17 or later
- **pnpm**, **npm**, or **yarn**
- **LexVisual Backend** running (see [Backend Repository](#-backend))

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd web-legal-mvp

# Install dependencies
npm install
# or
pnpm install
```

### Environment Setup

Create a `.env.local` file in the project root:

```env
# Backend API URL (defaults to http://localhost:8000 if not set)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Development

```bash
# Start the development server
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Create optimized production build
npm run build

# Start production server
npm run start
```

---

## ⚙️ Configuration

### API Endpoint

The frontend expects the backend API at the URL specified in `NEXT_PUBLIC_API_URL`. The following endpoints are consumed:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check with GPU/model status |
| `/api/documents` | GET | List all indexed documents |
| `/api/documents/:id` | DELETE | Remove a document |
| `/api/documents/upload` | POST (SSE) | Upload and index a PDF |
| `/api/query` | POST (SSE) | Query documents with streaming response |

### Tailwind Theme

Custom colors and animations are defined in `tailwind.config.ts`:

- **Slate** palette for neutral tones
- **Accent** (Indigo) for interactive elements
- **Violet/Fuchsia** gradients for branding
- Custom animations: `fade-in`, `slide-up`, `pulse-subtle`

---

## 🔗 Backend

This frontend is designed to work with the **LexVisual Backend** — a Python FastAPI service that handles:

- PDF processing and page rendering
- Vector embeddings and similarity search
- LLM-powered answer generation with citations
- GPU-accelerated inference (optional)

> **Note:** The backend repository contains the API, model integrations, and document processing pipeline. Ensure it's running before using this frontend.

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint for code quality |

---

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes with clear, descriptive commits
3. Ensure `npm run lint` passes
4. Test thoroughly with the backend running
5. Submit a pull request with a description of changes

### Code Style

- TypeScript strict mode enabled
- Functional components with hooks
- Tailwind for styling (avoid inline styles)
- Use the `cn()` utility for conditional classes

---

## 📄 License

Proprietary — All rights reserved.

---

<p align="center">
  <sub>Built with Next.js, TypeScript, and Tailwind CSS</sub>
</p>
