import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <p className="p-8 text-foreground">WellPath — coming soon.</p>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
