import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { ChangeRequest, isTask, interpretRequest, people, seedTasks, Status, statuses, Task, updateTasks } from './logic'

const STORAGE_KEY = 'northstar.asana-agent.v1'
type Page = 'board' | 'briefing' | 'case-study'
type Message = { id: number; role: 'You' | 'Workspace guide'; text: string }
type ReplaceRequest = { kind: 'replace'; tasks: Task[]; label: string }
type Pending = ChangeRequest | ReplaceRequest
type Snapshot = { tasks: Task[]; label: string }

function initialTasks(): { tasks: Task[]; warning: boolean; preserve?: boolean } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { tasks: seedTasks, warning: false }
    const parsed = JSON.parse(raw) as { version: number; tasks: Task[] }
    if (parsed.version !== 1 || !Array.isArray(parsed.tasks) || !parsed.tasks.length || !parsed.tasks.every(isTask)) return { tasks: seedTasks, warning: true, preserve: true }
    return { tasks: parsed.tasks, warning: false }
  } catch { return { tasks: seedTasks, warning: true, preserve: true } }
}

function currentPage(): Page {
  const hash = window.location.hash.replace('#', '')
  return hash === 'briefing' || hash === 'case-study' ? hash : 'board'
}

function formatDue(value: string) { return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`)) }

function App() {
  const [stored] = useState(initialTasks)
  const [tasks, setTasks] = useState(stored.tasks)
  const [storageWarning, setStorageWarning] = useState(stored.warning)
  const [persistEnabled, setPersistEnabled] = useState(!stored.preserve)
  const [page, setPage] = useState<Page>(currentPage)
  const [messages, setMessages] = useState<Message[]>([{ id: 1, role: 'Workspace guide', text: 'Hi — I can help you understand this sample board and safely prepare a task change. Tell me what you want to do in your own words.' }])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState<Pending | null>(null)
  const [undo, setUndo] = useState<Snapshot | null>(null)
  const [contextTaskId, setContextTaskId] = useState<string | undefined>()
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const syncHash = () => setPage(currentPage())
    window.addEventListener('hashchange', syncHash)
    return () => window.removeEventListener('hashchange', syncHash)
  }, [])

  useEffect(() => {
    if (!persistEnabled) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, tasks })) }
    catch { queueMicrotask(() => setStorageWarning(true)) }
  }, [tasks, persistEnabled])

  useEffect(() => {
    if (!pending) return
    dialogRef.current?.querySelector<HTMLButtonElement>('button')?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPending(null)
      if (event.key !== 'Tab') return
      const controls = [...(dialogRef.current?.querySelectorAll<HTMLElement>('button, [href], textarea, input, select, [tabindex]:not([tabindex="-1"])') ?? [])].filter((element) => !element.hasAttribute('disabled'))
      if (!controls.length) return
      const first = controls[0]; const last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); previousFocusRef.current?.focus() }
  }, [pending])

  const summary = useMemo(() => ({ open: tasks.filter((task) => task.status !== 'Complete').length, blocked: tasks.filter((task) => task.status === 'Blocked').length, done: tasks.filter((task) => task.status === 'Complete').length }), [tasks])
  const previewRows = pending ? pending.kind === 'replace'
    ? tasks.map((task) => ({ title: task.title, before: `${task.status}; ${task.assignee}`, after: `${pending.tasks.find((item) => item.id === task.id)?.status}; ${pending.tasks.find((item) => item.id === task.id)?.assignee}` }))
    : tasks.filter((task) => pending.ids.includes(task.id)).map((task) => {
      const changes = [{ field: pending.field, value: pending.value }, ...(pending.secondary ? [pending.secondary] : [])]
      return { title: task.title, before: changes.map((change) => `${change.field === 'status' ? 'Status' : 'Owner'}: ${change.field === 'status' ? task.status : task.assignee}`).join(' · '), after: changes.map((change) => `${change.field === 'status' ? 'Status' : 'Owner'}: ${change.value}`).join(' · ') }
    }) : []

  function requestMutation(mutation: Pending) {
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setPending(mutation)
  }

  function addMessage(role: Message['role'], text: string) { setMessages((current) => [...current, { id: Date.now() + Math.random(), role, text }]) }

  function confirmMutation() {
    if (!pending) return
    if (pending.kind === 'replace') {
      setPersistEnabled(true); setStorageWarning(false); setUndo({ tasks, label: pending.label }); setTasks(pending.tasks)
    } else {
      setUndo({ tasks, label: pending.label }); setTasks((current) => {
        const primary = updateTasks(current, pending.ids, pending.field, pending.value)
        return pending.secondary ? updateTasks(primary, pending.ids, pending.secondary.field, pending.secondary.value) : primary
      })
    }
    addMessage('Workspace guide', `Done. ${pending.label}. You can use “Undo last change” if you need to recover it.`)
    setPending(null)
  }

  function runQuery(text: string) {
    const result = interpretRequest(text, tasks, contextTaskId)
    addMessage('You', text)
    addMessage('Workspace guide', result.text)
    if (result.contextTaskId) setContextTaskId(result.contextTaskId)
    if (result.type === 'change') requestMutation(result.request)
  }

  function submit(event: FormEvent) { event.preventDefault(); const value = input.trim(); if (!value) return; setInput(''); runQuery(value) }
  function directChange(task: Task, field: 'status' | 'assignee', value: string) {
    if ((field === 'status' && task.status === value) || (field === 'assignee' && task.assignee === value)) return
    setContextTaskId(task.id)
    const isStatus = field === 'status'
    requestMutation({ kind: 'change', ids: [task.id], field, value: value as Status, label: isStatus ? `Change “${task.title}” from ${task.status} to ${value}` : `Change the owner of “${task.title}” from ${task.assignee} to ${value}` })
  }

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#board"><span className="brand-mark" aria-hidden="true">✦</span><span>Asana Agent</span><em>sample workspace</em></a>
      <nav aria-label="Primary navigation"><a className={page === 'board' ? 'active' : ''} href="#board">Workspace</a><a className={page === 'briefing' ? 'active' : ''} href="#briefing">Weekly view</a><a className={page === 'case-study' ? 'active' : ''} href="#case-study">About this sample</a></nav>
      <span className="sample-badge">Fictional data only</span>
    </header>
    {storageWarning && <div className="warning" role="status">{persistEnabled ? 'Browser storage is unavailable. Changes last until this tab closes.' : 'Saved sample data could not be read. The original saved data is untouched; changes stay in this tab until you confirm Reset sample.'}</div>}
    <main>
      {page === 'board' && <>
        <section className="welcome" aria-labelledby="workspace-title">
          <div><p className="eyebrow">NORTHSTAR · FICTIONAL PRODUCT TEAM</p><h1 id="workspace-title">A calmer way to move work forward.</h1><p>Ask about the work in plain English, or choose a new status or owner directly. This is a transparent sample: every change is shown to you before it happens.</p></div>
          <div className="summary-strip" aria-label="Workspace totals"><div><strong>{summary.open}</strong><span>Open</span></div><div><strong>{summary.blocked}</strong><span>Need help</span></div><div><strong>{summary.done}</strong><span>Done</span></div></div>
        </section>
        <div className="workspace-grid">
          <section className="board-panel" aria-labelledby="board-title">
            <div className="section-heading"><div><p className="eyebrow">YOUR WORKSPACE</p><h2 id="board-title">Activation & retention</h2><p>Choose a status or owner for a task. You will review the change next.</p></div><div className="section-actions">{undo && <button className="quiet-button" onClick={() => requestMutation({ kind: 'replace', tasks: undo.tasks, label: `Undo: ${undo.label}` })}>Undo last change</button>}<button className="quiet-button" onClick={() => requestMutation({ kind: 'replace', tasks: seedTasks, label: 'Restore the original sample tasks' })}>Reset sample</button></div></div>
            <div className="task-list">{tasks.map((task) => <TaskCard key={task.id} task={task} onChange={directChange} />)}</div>
            <div className="bulk-row"><div><span>Ready to wrap up?</span><p>Review every affected task before confirming a group change.</p></div><button onClick={() => runQuery('Complete all tasks in review')} disabled={!tasks.some((task) => task.status === 'In review')}>Complete tasks in review</button></div>
          </section>
          <aside className="agent-panel" aria-labelledby="agent-title">
            <div className="agent-heading"><span className="agent-orb" aria-hidden="true">✦</span><div><p className="eyebrow">WORKSPACE GUIDE</p><h2 id="agent-title">Talk it through</h2></div><button className="clear-button" onClick={() => setMessages([])}>Clear chat</button></div>
            <div className="capability-note"><strong>What I can do here</strong><span>Find work, explain blockers and due dates, or prepare a status or owner change in this sample board.</span></div>
            <div className="suggestions" aria-label="Try one of these examples">{['What is blocked?', 'When is Validate admin invite flow due?', 'Mark Finalize onboarding checklist as done', 'Assign Review trial nurture copy to Jon Bell', 'Complete all tasks in review'].map((question) => <button key={question} onClick={() => runQuery(question)}>{question}</button>)}</div>
            <div className="conversation" aria-live="polite">{messages.length === 0 ? <div className="empty"><span>✦</span><p>Your conversation is clear.</p><small>Your tasks and any open change preview are still here.</small></div> : messages.map((message) => <div key={message.id} className={`message ${message.role === 'You' ? 'user' : 'agent'}`}><b>{message.role}</b><p>{message.text}</p></div>)}</div>
            <form onSubmit={submit} className="composer"><label htmlFor="agent-input">Ask about the sample work</label><textarea id="agent-input" value={input} onChange={(event) => setInput(event.target.value)} placeholder="For example: mark the onboarding checklist done" rows={3} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit() } }} /><button type="submit">Send</button></form>
            <p className="fine-print">Simulated assistant. Uses only the tasks shown here — no account, API, or external AI service.</p>
          </aside>
        </div>
      </>}
      {page === 'briefing' && <Briefing tasks={tasks} onRun={runQuery} />}
      {page === 'case-study' && <CaseStudy />}
    </main>
    <footer><span>Northstar, its people, and its tasks are fictional. Changes stay in this browser.</span><a href="#case-study">How this sample works</a></footer>
    {pending && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPending(null) }}><div className="dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title" ref={dialogRef}><p className="eyebrow">ONE LAST LOOK</p><h2 id="confirm-title">Review this change</h2><p>{pending.label}</p><div className="preview-list">{previewRows.map((row) => <div className="preview-row" key={row.title}><strong>{row.title}</strong><span><s>{row.before}</s><b>{row.after}</b></span></div>)}</div><p className="dialog-note">This only changes the fictional tasks saved in this browser. You can undo after confirming.</p><div className="dialog-actions"><button className="quiet-button" onClick={() => setMessages([])}>Clear chat</button><button className="secondary" onClick={() => setPending(null)}>Cancel</button><button className="primary" onClick={confirmMutation}>Confirm change</button></div></div></div>}
  </div>
}

function TaskCard({ task, onChange }: { task: Task; onChange: (task: Task, field: 'status' | 'assignee', value: string) => void }) {
  return <article className={`task-card status-${task.status.toLowerCase().replaceAll(' ', '-')}`}><div className="task-main"><div className="task-topline"><span className="task-id">{task.id}</span><span className="project-tag">{task.project}</span></div><h3>{task.title}</h3><p>{task.priority} priority · Due <time dateTime={task.due}>{formatDue(task.due)}</time></p>{task.blocker && task.status === 'Blocked' && <p className="blocker-note"><b>Blocked:</b> {task.blocker}</p>}</div><div className="task-controls"><label>Status<select aria-label={`Status for ${task.title}`} value={task.status} onChange={(event) => onChange(task, 'status', event.target.value)}>{statuses.map((status) => <option value={status} key={status}>{status}</option>)}</select></label><label>Owner<select aria-label={`Owner for ${task.title}`} value={task.assignee} onChange={(event) => onChange(task, 'assignee', event.target.value)}>{people.map((person) => <option value={person} key={person}>{person}</option>)}</select></label></div></article>
}

function Briefing({ tasks, onRun }: { tasks: Task[]; onRun: (query: string) => void }) {
  const due = tasks.filter((task) => task.status !== 'Complete' && task.due <= '2026-09-14').sort((a, b) => a.due.localeCompare(b.due))
  const blocked = tasks.filter((task) => task.status === 'Blocked')
  return <section className="briefing-page"><p className="eyebrow">SAMPLE WEEKLY VIEW</p><h1>What needs attention this week</h1><p className="lede">This view reads the same fictional tasks as the workspace. It changes after you confirm a task update.</p><div className="brief-grid"><article><span className="big-number">{due.length}</span><h2>Due by Sep 14</h2><ul>{due.map((task) => <li key={task.id}><b>{task.title}</b><span>Due {formatDue(task.due)}</span></li>)}</ul></article><article className="dark-card"><span className="big-number">{blocked.length}</span><h2>Need help</h2>{blocked.length ? <ul>{blocked.map((task) => <li key={task.id}><b>{task.title}</b><span>{task.blocker}</span></li>)}</ul> : <div className="brief-empty">Nothing is blocked.</div>}</article></div><button className="primary" onClick={() => { onRun('Give me a team briefing'); window.location.hash = 'board' }}>Discuss this briefing</button></section>
}

function CaseStudy() { return <article className="case-study"><p className="eyebrow">INDEPENDENT PRODUCT SAMPLE</p><h1>A safer conversation about work</h1><p className="lede">This prototype explores how a project lead might ask for help in everyday language while keeping the source, scope, and outcome clear.</p><div className="case-columns"><section><h2>The problem</h2><p>Status work becomes slower when people must translate what they mean into a rigid system. The sample keeps the conversation next to the records it can read.</p></section><section><h2>The product choice</h2><p>People can use a task title, a task code, ordinary status words such as “done” and “reopen,” or direct controls. The workspace asks when the target is unclear.</p></section><section><h2>Safety</h2><p>Every status, owner, bulk, reset, and undo change gets a before-and-after preview. Nothing changes until the person confirms it.</p></section><section><h2>Limits</h2><p>Northstar, its people, and all tasks are fictional. This uses no Asana account, API, authentication, external AI, customer data, or production connection.</p></section></div><a className="primary link-button" href="#board">Explore the sample workspace</a></article> }

export default App
