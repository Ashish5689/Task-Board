import './App.css'
import './index.css'
import { BoardProvider } from './context/BoardContext'
import { PresenceProvider } from './context/PresenceContext'
import Board from './components/Board'

function App() {
  return (
    <PresenceProvider>
      <BoardProvider>
        <div className="min-h-screen bg-gray-100">
          <Board />
        </div>
      </BoardProvider>
    </PresenceProvider>
  )
}

export default App
