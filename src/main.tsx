import { Component, ErrorInfo, ReactNode, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import './accessibility.css'

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Task Assistant render error', error, info) }
  render() {
    if (!this.state.failed) return this.props.children
    return <main className="fatal-error" role="alert"><p className="eyebrow">SAMPLE WORKSPACE</p><h1>Something went wrong.</h1><p>The local demo could not be rendered. Reload to try again; this also attempts to clear its saved state. If browser storage is blocked, saved data stays unchanged.</p><button className="primary" onClick={() => { try { localStorage.removeItem('northstar.asana-agent.v1') } catch { /* Saved data remains unchanged when storage is blocked. */ } finally { location.reload() } }}>Reload sample</button></main>
  }
}

createRoot(document.getElementById('root')!).render(<StrictMode><ErrorBoundary><App /></ErrorBoundary></StrictMode>)
