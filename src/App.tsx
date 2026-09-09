import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { isTask, Person, queryKind, seedTasks, Status, Task, taskAnswer, updateTasks } from './logic'

const STORAGE_KEY = 'northstar.asana-agent.v1'
const people: Person[] = ['Maya Chen', 'Jon Bell', 'Priya Shah', 'Unassigned']
const statuses: Status[] = ['Planned', 'In progress', 'Blocked', 'In review', 'Complete']

type Page = 'board' | 'briefing' | 'case-study'
type Message = { id: number; role: 'You' | 'Agent'; text: string }
type Mutation = { ids: string[]; field: 'status' | 'assignee'; value: Status | Person; label: string; replacement?: Task[] }
type Snapshot = { tasks: Task[]; label: string }

function initialTasks(): { tasks: Task[]; warning: boolean; preserve?:boolean } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { tasks: seedTasks, warning: false }
    const parsed = JSON.parse(raw) as { version: number; tasks: Task[] }
    if (parsed.version !== 1 || !Array.isArray(parsed.tasks) || !parsed.tasks.length || !parsed.tasks.every(isTask)) return { tasks: seedTasks, warning: true, preserve:true }
    return { tasks: parsed.tasks, warning: false }
  } catch {
    return { tasks: seedTasks, warning: true, preserve:true }
  }
}

function currentPage(): Page {
  const hash = window.location.hash.replace('#', '')
  return hash === 'briefing' || hash === 'case-study' ? hash : 'board'
}

function formatDue(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`))
}

function parseMutation(input: string, tasks: Task[]): Mutation | null {
  const normalized = input.toLowerCase()
  if (/complete all.*review|all.*review.*complete/.test(normalized)) {
    const ids = tasks.filter((task) => task.status === 'In review').map((task) => task.id)
    return ids.length ? { ids, field: 'status', value: 'Complete', label: `Complete ${ids.length} task${ids.length === 1 ? '' : 's'} currently in review` } : null
  }
  const task = tasks.find((item) => normalized.includes(item.id.toLowerCase()))
  if (!task) return null
  const assignee = people.find((person) => normalized.includes(person.toLowerCase()))
  if (/assign/.test(normalized) && assignee) return { ids: [task.id], field: 'assignee', value: assignee, label: `Assign ${task.id} to ${assignee}` }
  const status = statuses.find((item) => normalized.includes(item.toLowerCase()))
  if (/(mark|move|set|complete)/.test(normalized) && status) return { ids: [task.id], field: 'status', value: status, label: `Move ${task.id} to ${status}` }
  if (/complete/.test(normalized)) return { ids: [task.id], field: 'status', value: 'Complete', label: `Complete ${task.id}` }
  return null
}

function App() {
  const [stored] = useState(initialTasks)
  const [tasks, setTasks] = useState(stored.tasks)
  const [storageWarning, setStorageWarning] = useState(stored.warning)
  const [persistEnabled,setPersistEnabled]=useState(!stored.preserve)
  const [page, setPage] = useState<Page>(currentPage)
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'Agent', text: 'Ask about Maya’s tasks, due dates, blockers, a team briefing, or project progress. You can also request a status or assignee change.' },
  ])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState<Mutation | null>(null)
  const [undo, setUndo] = useState<Snapshot | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const syncHash = () => setPage(currentPage())
    window.addEventListener('hashchange', syncHash)
    return () => window.removeEventListener('hashchange', syncHash)
  }, [])

  useEffect(() => {
    if(!persistEnabled)return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, tasks }))
    } catch {
      queueMicrotask(() => setStorageWarning(true))
    }
  }, [tasks,persistEnabled])

  useEffect(() => {
    if (!pending) return
    const firstButton = dialogRef.current?.querySelector<HTMLButtonElement>('button')
    firstButton?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPending(null)
      if (event.key === 'Tab') {
        const controls = [...(dialogRef.current?.querySelectorAll<HTMLElement>('button, [href], textarea, input, select, [tabindex]:not([tabindex="-1"])') ?? [])].filter((element) => !element.hasAttribute('disabled'))
        if (!controls.length) return
        const firstControl = controls[0]
        const lastControl = controls[controls.length - 1]
        if (event.shiftKey && document.activeElement === firstControl) { event.preventDefault(); lastControl.focus() }
        else if (!event.shiftKey && document.activeElement === lastControl) { event.preventDefault(); firstControl.focus() }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); previousFocusRef.current?.focus() }
  }, [pending])

  const summary = useMemo(() => ({
    active: tasks.filter((task) => task.status !== 'Complete').length,
    blocked: tasks.filter((task) => task.status === 'Blocked').length,
    complete: tasks.filter((task) => task.status === 'Complete').length,
  }), [tasks])

  function requestMutation(mutation: Mutation) {
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setPending(mutation)
  }

  function confirmMutation() {
    if (!pending) return
    if(pending.replacement){setPersistEnabled(true);setStorageWarning(false)}
    setUndo({ tasks, label: pending.label })
    setTasks((current) => pending.replacement ?? updateTasks(current, pending.ids, pending.field, pending.value))
    setMessages((current) => [...current, { id: Date.now(), role: 'Agent', text: `Done: ${pending.label}. You can undo this change.` }])
    setPending(null)
  }

  function runQuery(text: string) {
    const mutation = parseMutation(text, tasks)
    const reply = mutation ? `I prepared this change for review: ${mutation.label}. Nothing will change until you confirm.` : taskAnswer(queryKind(text), tasks)
    setMessages((current) => [...current, { id: Date.now(), role: 'You', text }, { id: Date.now() + 1, role: 'Agent', text: reply }])
    if (mutation) requestMutation(mutation)
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    const value = input.trim()
    if (!value) return
    setInput('')
    runQuery(value)
  }

  function resetDemo() {
    requestMutation({ ids: seedTasks.map((task) => task.id), field: 'status', value: 'Planned', label: 'Reset every task to the original sample state', replacement: seedTasks })
  }

  function undoLast() {
    if (!undo) return
    const previous = tasks
    setTasks(undo.tasks)
    setMessages((current) => [...current, { id: Date.now(), role: 'Agent', text: `Undid: ${undo.label}.` }])
    setUndo({ tasks: previous, label: `Undo ${undo.label}` })
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#board"><span className="brand-mark">N</span><span>Asana Agent</span><em>sample workspace</em></a>
        <nav aria-label="Primary navigation">
          <a className={page === 'board' ? 'active' : ''} href="#board">Workspace</a>
          <a className={page === 'briefing' ? 'active' : ''} href="#briefing">Briefing</a>
          <a className={page === 'case-study' ? 'active' : ''} href="#case-study">Case study</a>
        </nav>
        <div className="sample-badge">Independent sample demo</div>
      </header>

      {storageWarning && <div className="warning" role="status">{persistEnabled?'Browser storage is unavailable. Changes will last only until this tab closes.':'Saved data is unavailable or incompatible. The sample is shown and existing saved data is left untouched. Changes are session-only until you confirm Reset sample.'}</div>}

      <main>
        {page === 'board' && (
          <>
            <section className="intro-row" aria-labelledby="workspace-title">
              <div><p className="eyebrow">PRODUCT OPERATIONS · SEP 8, 2026 SAMPLE CLOCK</p><h1 id="workspace-title">Make the work legible.</h1><p>Explore a sample task workspace with a simulated assistant. Every task change waits for your approval.</p></div>
              <div className="summary-strip" aria-label="Workspace totals">
                <div><strong>{summary.active}</strong><span>Active</span></div><div><strong>{summary.blocked}</strong><span>Blocked</span></div><div><strong>{summary.complete}</strong><span>Complete</span></div>
              </div>
            </section>

            <div className="workspace-grid">
              <section className="board-panel" aria-labelledby="board-title">
                <div className="section-heading"><div><p className="eyebrow">WORKSTREAM</p><h2 id="board-title">Activation & retention</h2></div><div className="section-actions">{undo && <button className="text-button" onClick={undoLast}>Undo last</button>}<button className="text-button" onClick={resetDemo}>Reset sample</button></div></div>
                <div className="board-scroll">
                  <table>
                    <thead><tr><th>Task</th><th>Status</th><th>Owner</th><th>Due</th></tr></thead>
                    <tbody>{tasks.map((task) => (
                      <tr key={task.id}>
                        <td><span className="task-id">{task.id}</span><strong>{task.title}</strong><small>{task.project} · {task.priority} priority</small>{task.blocker && task.status === 'Blocked' && <span className="blocker-note">{task.blocker}</span>}</td>
                        <td><button className={`status status-${task.status.toLowerCase().replaceAll(' ', '-')}`} onClick={() => requestMutation({ ids: [task.id], field: 'status', value: task.status === 'Complete' ? 'In progress' : 'Complete', label: `${task.status === 'Complete' ? 'Reopen' : 'Complete'} ${task.id}` })}>{task.status}</button></td>
                        <td><button className="owner-button" onClick={() => { const index = people.indexOf(task.assignee); const next = people[(index + 1) % people.length]; requestMutation({ ids: [task.id], field: 'assignee', value: next, label: `Assign ${task.id} to ${next}` }) }}>{task.assignee}</button></td>
                        <td><time dateTime={task.due}>{formatDue(task.due)}</time></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                <div className="bulk-row"><span>Bulk action</span><button onClick={() => requestMutation({ ids: tasks.filter((task) => task.status === 'In review').map((task) => task.id), field: 'status', value: 'Complete', label: 'Complete every task currently in review' })} disabled={!tasks.some((task) => task.status === 'In review')}>Complete tasks in review</button></div>
              </section>

              <aside className="agent-panel" aria-labelledby="agent-title">
                <div className="agent-heading"><span className="agent-orb" aria-hidden="true">✦</span><div><p className="eyebrow">SIMULATED ASSISTANT</p><h2 id="agent-title">Ask the workspace</h2></div><button className="clear-button" onClick={() => setMessages([])} aria-label="Clear conversation">Clear</button></div>
                <div className="suggestions" aria-label="Suggested questions">
                  {['Show all tasks', 'What is blocked?', 'What is overdue?', 'What is due this week?', 'Give me a team briefing', 'Show Maya’s tasks'].map((question) => <button key={question} onClick={() => runQuery(question)}>{question}</button>)}
                </div>
                <div className="conversation" aria-live="polite">
                  {messages.length === 0 ? <div className="empty"><span>○</span><p>Conversation cleared.</p><small>Your tasks and any pending change are still here.</small></div> : messages.map((message) => <div key={message.id} className={`message ${message.role === 'You' ? 'user' : 'agent'}`}><b>{message.role}</b><p>{message.text}</p></div>)}
                </div>
                <form onSubmit={submit} className="composer"><label htmlFor="agent-input">Message</label><textarea id="agent-input" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Try “Assign NTH-104 to Jon Bell”" rows={2} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit() } }} /><button type="submit" aria-label="Send message">↑</button></form>
                <p className="fine-print">Uses only this sample dataset. No account, API, or external AI service.</p>
              </aside>
            </div>
          </>
        )}

        {page === 'briefing' && <Briefing tasks={tasks} onRun={(kind) => runQuery(kind)} />}
        {page === 'case-study' && <CaseStudy />}
      </main>

      <footer><span>Northstar is a fictional B2B SaaS company. Independent demo; no synchronization with other portfolio projects.</span><a href="#case-study">Read the product case study →</a></footer>

      {pending && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPending(null) }}>
          <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title" ref={dialogRef}>
            <p className="eyebrow">REVIEW CHANGE</p><h2 id="confirm-title">Confirm before updating</h2><p>{pending.label}</p>
            <div className="change-preview"><span>{pending.replacement ? 'All sample tasks' : pending.ids.join(', ')}</span><strong>{pending.replacement ? 'Restore original values' : `${pending.field === 'status' ? 'Status' : 'Assignee'} → ${pending.value}`}</strong></div>
            <p className="dialog-note">This updates local sample data only.</p>
            <div className="dialog-actions"><button className="text-button" onClick={() => setMessages([])}>Clear chat</button><button className="secondary" onClick={() => setPending(null)}>Cancel</button><button className="primary" onClick={confirmMutation}>Confirm change</button></div>
          </div>
        </div>
      )}
    </div>
  )
}

function Briefing({ tasks, onRun }: { tasks: Task[]; onRun: (query: string) => void }) {
  const blocked = tasks.filter((task) => task.status === 'Blocked')
  const due = tasks.filter((task) => task.status !== 'Complete' && task.due <= '2026-09-14').sort((a, b) => a.due.localeCompare(b.due))
  return <section className="briefing-page"><p className="eyebrow">DETERMINISTIC BRIEFING</p><h1>This week’s operating picture</h1><p className="lede">Generated from the current task state in this browser. Change the board, and these counts change with it.</p><div className="brief-grid"><article><span className="big-number">{due.length}</span><h2>Due by Sep 14</h2><ul>{due.map((task) => <li key={task.id}><b>{task.id}</b> {task.title}<time>{formatDue(task.due)}</time></li>)}</ul></article><article className="dark-card"><span className="big-number">{blocked.length}</span><h2>Blockers to resolve</h2>{blocked.length ? <ul>{blocked.map((task) => <li key={task.id}><b>{task.title}</b><span>{task.blocker}</span></li>)}</ul> : <div className="brief-empty">No active blockers.</div>}</article></div><button className="primary" onClick={() => { onRun('Give me a team briefing'); window.location.hash = 'board' }}>Open briefing in agent</button></section>
}

function CaseStudy() {
  return <article className="case-study"><p className="eyebrow">INDEPENDENT PRODUCT SAMPLE</p><h1>A safer pattern for conversational work management</h1><p className="lede">This prototype explores how a product manager might make natural-language task retrieval and updates useful without hiding scope or consequences.</p><div className="case-columns"><section><h2>The product question</h2><p>Can a task assistant save coordination time while preserving user control? The demo answers with a narrow, deterministic command surface and a confirmation step before every change.</p></section><section><h2>Product choices</h2><p>Answers cite visible task IDs and recalculate from current data. Unsupported requests get an honest boundary. Bulk operations receive the same preview as single edits, and the last write can be undone.</p></section><section><h2>Limits</h2><p>Northstar, its people, and all task records are fictional. No usability study, customer result, production integration, or model performance is claimed. The interface uses no Asana account or API.</p></section><section><h2>Ownership</h2><p>PM scope covers problem framing, flows, safety rules, evaluation criteria, and sample content. Implementation was produced with Antigravity/AI assistance and should be reviewed as a portfolio prototype.</p></section></div><a className="primary link-button" href="#board">Explore the workspace</a></article>
}

export default App
