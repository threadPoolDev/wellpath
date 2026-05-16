import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const message: string =
      err?.response?.data?.error?.message ?? err?.message ?? 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)
