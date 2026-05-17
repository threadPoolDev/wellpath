import { GoogleGenerativeAI } from '@google/generative-ai'

// ─── Shared interface ─────────────────────────────────────────────────────────

export interface AIClient {
  chat(prompt: string): Promise<string>
  embed(text: string): Promise<number[]>
}

// ─── Ollama ───────────────────────────────────────────────────────────────────

function ollamaClient(): AIClient {
  const base = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'
  const chatModel = process.env.OLLAMA_CHAT_MODEL ?? 'llama3.2'
  const embedModel = process.env.OLLAMA_EMBED_MODEL ?? 'nomic-embed-text'

  return {
    async chat(prompt: string): Promise<string> {
      const res = await fetch(`${base}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: chatModel,
          messages: [{ role: 'user', content: prompt }],
          stream: false,
        }),
        signal: AbortSignal.timeout(60_000),
      })
      if (!res.ok) throw new Error(`Ollama chat failed: ${res.status}`)
      const data = (await res.json()) as { message: { content: string } }
      return data.message.content
    },

    async embed(text: string): Promise<number[]> {
      const res = await fetch(`${base}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: embedModel, prompt: text }),
        signal: AbortSignal.timeout(30_000),
      })
      if (!res.ok) throw new Error(`Ollama embed failed: ${res.status}`)
      const data = (await res.json()) as { embedding: number[] }
      return data.embedding
    },
  }
}

// ─── Gemini ───────────────────────────────────────────────────────────────────

function geminiClient(): AIClient {
  const apiKey = process.env.GEMINI_API_KEY ?? ''
  const chatModel = process.env.GEMINI_CHAT_MODEL ?? 'gemini-1.5-pro'
  const embedModel = process.env.GEMINI_EMBED_MODEL ?? 'text-embedding-004'
  const genAI = new GoogleGenerativeAI(apiKey)

  return {
    async chat(prompt: string): Promise<string> {
      const model = genAI.getGenerativeModel({ model: chatModel })
      const result = await model.generateContent(prompt)
      return result.response.text()
    },

    async embed(text: string): Promise<number[]> {
      const model = genAI.getGenerativeModel({ model: embedModel })
      const result = await model.embedContent(text)
      return result.embedding.values
    },
  }
}

// ─── Factory — reads USE_LOCAL_AI at call time ────────────────────────────────

export function getAIClient(): AIClient {
  return process.env.USE_LOCAL_AI === 'true' ? ollamaClient() : geminiClient()
}
