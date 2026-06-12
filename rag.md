```python
markdown_content = """# Static Client-Side RAG Chatbot: Implementation Guide

This guide details the step-by-step implementation of a fully static, serverless Retrieval-Augmented Generation (RAG) chatbot. By splitting the workload between a local build-time script and a runtime browser environment, you can host an intelligent, context-aware agent directly on GitHub Pages without backend infrastructure.

## Phase 1: Build-Time Data Pipeline (Python)

Before deploying, you must convert your textual data (resume, transcripts, project descriptions) into numerical vectors. This happens locally on your machine.

### 1. Setup Your Environment
Create a new directory for your data processing and install the required Python libraries.


```

````text
File generated successfully: [file-tag: static-rag-architecture-guide.md]

```bash
pip install sentence-transformers numpy json

````

### 2. Create the Embedding Script

Create a file named `generate_embeddings.py`. This script reads your source knowledge, chunks it, generates vector embeddings using a lightweight open-source model, and exports a JSON file to your React project's `public` folder.

```python
import json
from sentence_transformers import SentenceTransformer

# Initialize the lightweight embedding model
# This is the same model we will use in the browser to ensure vectors match
model = SentenceTransformer('all-MiniLM-L6-v2')

# Your raw knowledge base. In a real scenario, you might read this from a .md or .pdf file.
knowledge_base = [
    "Education: Student at the University of Waterloo.",
    "Experience: AI Intern at Edgemaker. Worked on developing AI chatbot systems and internal tools for Stajenn.",
    "Skills: Full-stack development with a strong focus on React.js, Tailwind CSS, Mapbox integrations, and prompt engineering.",
    "Projects: Developed a Chess AI engine using Convolutional Neural Networks and PyTorch.",
    "Projects: Integrated complex payment and subscription systems using HitPay APIs."
]

print("Generating embeddings...")
db = []

for chunk in knowledge_base:
    # Generate the vector for each chunk
    vector = model.encode(chunk).tolist()
    db.append({
        "text": chunk,
        "vector": vector
    })

# Export to your frontend's public directory so it can be fetched statically
output_path = "../public/vectors.json"
with open(output_path, "w") as f:
    json.dump(db, f)

print(f"Successfully exported {len(db)} vectors to {output_path}")

```

Run this script every time you update your resume or add a new project to your portfolio.

---

## Phase 2: Runtime Environment (React & Tailwind CSS)

On the client side, the application will fetch the static `vectors.json`, embed the user's query directly in the browser, perform a similarity search, and send the augmented prompt to OpenRouter.

### 1. Install Frontend Dependencies

Ensure you have the necessary packages installed in your project:

```bash
npm install @xenova/transformers lucide-react

```

### 2. The Vector Search Logic

Create a utility function to handle the cosine similarity math. This compares the user's embedded query against your pre-calculated document vectors.

```javascript
// utils/vectorSearch.js

export function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function searchKnowledgeBase(queryVector, vectorsData, topK = 2) {
  const scoredChunks = vectorsData.map((item) => ({
    text: item.text,
    score: cosineSimilarity(queryVector, item.vector),
  }));

  // Sort by highest similarity score
  scoredChunks.sort((a, b) => b.score - a.score);
  return scoredChunks.slice(0, topK);
}
```

### 3. The Chatbot Component

Here is the core React component. It handles UI state, loads the WebAssembly embedding model, executes the RAG pipeline, and calls OpenRouter.

```jsx
import React, { useState, useEffect, useRef } from "react";
import { pipeline } from "@xenova/transformers";
import { searchKnowledgeBase } from "./utils/vectorSearch";
import { Send, User, Bot } from "lucide-react";

export default function PortfolioChatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Refs for holding models and data without triggering re-renders
  const embedderRef = useRef(null);
  const vectorsRef = useRef(null);

  useEffect(() => {
    // Initialization: Load the model and fetch the static JSON
    const initRAG = async () => {
      try {
        // 1. Fetch static vector database
        const response = await fetch("/vectors.json");
        vectorsRef.current = await response.json();

        // 2. Load the embedding model in-browser
        embedderRef.current = await pipeline(
          "feature-extraction",
          "Xenova/all-MiniLM-L6-v2",
        );
      } catch (error) {
        console.error("Failed to initialize RAG pipeline", error);
      }
    };
    initRAG();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !embedderRef.current || !vectorsRef.current) return;

    const userMsg = input;
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setIsTyping(true);

    try {
      // STEP 1: Embed the user's query
      const queryOutput = await embedderRef.current(userMsg, {
        pooling: "mean",
        normalize: true,
      });
      const queryVector = Array.from(queryOutput.data);

      // STEP 2: Local Vector Search
      const relevantChunks = await searchKnowledgeBase(
        queryVector,
        vectorsRef.current,
        3, // retrieve top 3 chunks
      );

      const contextText = relevantChunks.map((c) => c.text).join("\\n\\n");

      // STEP 3: Construct the final prompt
      const systemPrompt = `You are a helpful assistant for my portfolio website. 
            Answer the user's questions using ONLY the context provided below. 
            If the answer is not in the context, say "I don't have enough information to answer that."
            
            CONTEXT:
            ${contextText}`;

      // STEP 4: Call OpenRouter API
      const openRouterRes = await fetch(
        "[https://openrouter.ai/api/v1/chat/completions](https://openrouter.ai/api/v1/chat/completions)",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer YOUR_OPENROUTER_API_KEY`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "meta-llama/llama-3-8b-instruct:free", // Free tier model
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMsg },
            ],
          }),
        },
      );

      const data = await openRouterRes.json();
      const botReply = data.choices[0].message.content;

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: botReply },
      ]);
    } catch (error) {
      console.error("Inference Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-96 w-full max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-lg shadow-sm font-sans">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`p-2 rounded-full ${msg.role === "user" ? "bg-blue-600" : "bg-slate-300"}`}
            >
              {msg.role === "user" ? (
                <User size={16} className="text-white" />
              ) : (
                <Bot size={16} className="text-slate-700" />
              )}
            </div>
            <div
              className={`p-3 rounded-lg text-sm max-w-[75%] ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-800"}`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="text-slate-400 text-xs italic flex items-center gap-2">
            <Bot size={14} /> Processing knowledge base...
          </div>
        )}
      </div>

      <form
        onSubmit={handleSendMessage}
        className="p-3 bg-white border-t border-slate-200 flex gap-2 rounded-b-lg"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about my experience..."
          className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isTyping}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition-colors disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
```

## Phase 3: Deployment Checklist

1. **Protect your API Key:** Since this is a static site, your OpenRouter key will technically be exposed in the client code. To secure this, you should either:

- Use OpenRouter's site URL restrictions in your dashboard to only allow requests originating from your specific `https://yourusername.github.io` domain.
- Set up strict spending limits (or stick entirely to the free models) to prevent abuse.

2. **Build the Application:** Run `npm run build` to generate your static bundle.
3. **Ensure `vectors.json` is public:** Verify that your `vectors.json` file is correctly placed in the `/public` directory so it gets copied to the root of your `dist` or `build` folder during the build process.
4. **Deploy:** Push your `dist` folder to your `gh-pages` branch. When users load the site, their browser will download the small `all-MiniLM-L6-v2` WebAssembly model once, cache it, and execute all vector math locally before querying the LLM.
   """

with open("static-rag-architecture-guide.md", "w") as f:
f.write(markdown_content)

print("File generated successfully: [file-tag: static-rag-architecture-guide.md]")

```
Your Markdown file is ready
[file-tag: code-generated-file-0-1781229661491258835]

I have generated a detailed Markdown guide that provides a complete blueprint for implementing the client-side RAG architecture.

The guide is broken down into two main phases:
1. **The Build-Time Pipeline (Python):** A script using `sentence-transformers` that you run locally to parse your resume, project data, and transcripts into a mathematical vector format (`vectors.json`), which gets exported to your static site's public directory.
2. **The Runtime Environment (React & Tailwind):** A custom component utilizing `@xenova/transformers` to generate embeddings locally in the browser, perform a similarity search against your static JSON file, and route the extracted context directly to an OpenRouter free-tier LLM model.

```
