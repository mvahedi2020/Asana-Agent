import { Component, ErrorInfo, ReactNode, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import './accessibility.css'

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Asana Agent render error', error, info) }
  render() {
    if (!this.state.failed) return this.props.children
    return <main className="fatal-error" role="alert"><p className="eyebrow">SAMPLE WORKSPACE</p><h1>Something went wrong.</h1><p>The local demo could not be rendered. Reset its saved state and reload to continue.</p><button className="primary" onClick={() => { localStorage.removeItem('northstar.asana-agent.v1'); location.reload() }}>Reset and reload</button></main>
  }
}

createRoot(document.getElementById('root')!).render(<StrictMode><ErrorBoundary><App /></ErrorBoundary></StrictMode>)
