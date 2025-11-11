declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_URL?: string
    }
  }
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';