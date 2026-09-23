import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { canSetBlockerReason, canSetStatus, ChangeRequest, isTaskList, interpretRequest, MAX_BLOCKER_LENGTH, MAX_REQUEST_LENGTH, people, replacementPreviewRows, seedTasks, Status, statuses, Task, tasksDueThisSampleWeek, updateTasks } from './logic'

const STORAGE_KEY = 'northstar.asana-agent.v1'
const MAX_TRANSCRIPT_MESSAGES = 40
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
    if (parsed.version !== 1 || !isTaskList(parsed.tasks)) return { tasks: seedTasks, warning: true, preserve: true }
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
  const [reasonDrafts, setReasonDrafts] = useState<Record<string, string>>(() => Object.fromEntries(stored.tasks.map((task) => [task.id, task.blocker ?? ''])))
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
    ? replacementPreviewRows(tasks, pending.tasks)
    : tasks.filter((task) => pending.ids.includes(task.id)).map((task) => {
      const changes = [{ field: pending.field, value: pending.value }, ...(pending.secondary ? [pending.secondary] : [])]
      const label = (field: typeof pending.field) => field === 'status' ? 'Status' : field === 'assignee' ? 'Owner' : 'Blocker reason'
      const before = (field: typeof pending.field) => field === 'status' ? task.status : field === 'assignee' ? task.assignee : task.blocker || 'None'
      return { id: task.id, title: task.title, before: changes.map((change) => `${label(change.field)}: ${before(change.field)}`).join(' · '), after: changes.map((change) => `${label(change.field)}: ${change.value || 'None'}`).join(' · ') }
    }) : []

  function requestMutation(mutation: Pending) {
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setPending(mutation)
  }

  function addMessages(...entries: Omit<Message, 'id'>[]) {
    setMessages((current) => [...current, ...entries.map((entry) => ({ ...entry, id: Date.now() + Math.random() }))].slice(-MAX_TRANSCRIPT_MESSAGES))
  }

  function clearConversation() {
    setMessages([])
    setContextTaskId(undefined)
  }

  function confirmMutation() {
    if (!pending) return
    if (pending.kind === 'replace') {
      const hasVisibleChanges = previewRows.length > 0
      setPersistEnabled(true); setStorageWarning(false); setUndo(hasVisibleChanges ? { tasks, label: pending.label } : null); setTasks(pending.tasks); setContextTaskId(undefined)
      setReasonDrafts(Object.fromEntries(pending.tasks.map((task) => [task.id, task.blocker ?? ''])))
      addMessages({ role: 'Workspace guide', text: hasVisibleChanges ? `Done. ${pending.label}. You can use “Undo last change” if you need to recover it.` : `Done. ${pending.label}. No visible task values changed, so there is no new undo step.` })
    } else {
      setUndo({ tasks, label: pending.label }); setTasks((current) => {
        const primary = updateTasks(current, pending.ids, pending.field, pending.value)
        return pending.secondary ? updateTasks(primary, pending.ids, pending.secondary.field, pending.secondary.value) : primary
      })
      if (pending.field === 'blocker') setReasonDrafts((current) => Object.fromEntries(Object.entries(current).map(([id, draft]) => [id, pending.ids.includes(id) ? pending.value.trim() : draft])))
      addMessages({ role: 'Workspace guide', text: `Done. ${pending.label}. You can use “Undo last change” if you need to recover it.` })
    }
    setPending(null)
  }

  function runQuery(text: string) {
    const result = interpretRequest(text, tasks, contextTaskId)
    addMessages({ role: 'You', text }, { role: 'Workspace guide', text: result.text })
    setContextTaskId(result.contextTaskId)
    if (result.type === 'change') requestMutation(result.request)
  }

  function submit(event: FormEvent) { event.preventDefault(); const value = input.trim(); if (!value) return; setInput(''); runQuery(value) }
  function directChange(task: Task, field: 'status' | 'assignee', value: string) {
    if ((field === 'status' && task.status === value) || (field === 'assignee' && task.assignee === value)) return
    if (field === 'status' && !canSetStatus(task, value as Status)) return
    setContextTaskId(task.id)
    const isStatus = field === 'status'
    requestMutation({ kind: 'change', ids: [task.id], field, value: value as Status, label: isStatus ? `Change “${task.title}” from ${task.status} to ${value}` : `Change the owner of “${task.title}” from ${task.assignee} to ${value}` })
  }

  function proposeBlockerChange(task: Task, reason: string) {
    if (!canSetBlockerReason(task, reason) || task.blocker?.trim() === reason.trim() || (!task.blocker && !reason.trim())) return
    setContextTaskId(task.id)
    requestMutation({ kind: 'change', ids: [task.id], field: 'blocker', value: reason.trim(), label: `Change the blocker reason for “${task.title}”` })
    previousFocusRef.current = document.getElementById(`blocker-${task.id}`)
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
            <div className="task-list">{tasks.map((task) => <TaskCard key={task.id} task={task} reasonDraft={reasonDrafts[task.id] ?? task.blocker ?? ''} onReasonDraft={(value) => setReasonDrafts((current) => ({ ...current, [task.id]: value }))} onChange={directChange} onBlockerChange={proposeBlockerChange} />)}</div>
            <div className="bulk-row"><div><span>Ready to wrap up?</span><p>Review every affected task before confirming a group change.</p></div><button onClick={() => runQuery('Complete all tasks in review')} disabled={!tasks.some((task) => task.status === 'In review')}>Complete tasks in review</button></div>
          </section>
          <aside className="agent-panel" aria-labelledby="agent-title">
            <div className="agent-heading"><span className="agent-orb" aria-hidden="true">✦</span><div><p className="eyebrow">WORKSPACE GUIDE</p><h2 id="agent-title">Talk it through</h2></div><button className="clear-button" onClick={clearConversation}>Clear chat</button></div>
            <div className="capability-note"><strong>What I can do here</strong><span>Find work, explain blockers and due dates, or prepare a status or owner change in this sample board.</span></div>
            <div className="suggestions" aria-label="Try one of these examples">{['What is blocked?', 'When is Validate admin invite flow due?', 'Mark Finalize onboarding checklist as done', 'Assign Review trial nurture copy to Jon Bell', 'Complete all tasks in review'].map((question) => <button key={question} onClick={() => runQuery(question)}>{question}</button>)}</div>
            <div className="conversation" aria-live="polite">{messages.length === 0 ? <div className="empty"><span>✦</span><p>Your conversation is clear.</p><small>Your tasks and any open change preview are still here.</small></div> : messages.map((message) => <div key={message.id} className={`message ${message.role === 'You' ? 'user' : 'agent'}`}><b>{message.role}</b><p>{message.text}</p></div>)}</div>
            <form onSubmit={submit} className="composer"><label htmlFor="agent-input">Ask about the sample work</label><textarea id="agent-input" value={input} maxLength={MAX_REQUEST_LENGTH} aria-describedby="request-limit" onChange={(event) => setInput(event.target.value)} placeholder="For example: mark the onboarding checklist done" rows={3} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit() } }} /><small id="request-limit">Up to {MAX_REQUEST_LENGTH} characters. One clear task change per request.</small><button type="submit">Send</button></form>
            <p className="fine-print">Simulated assistant. Uses only the tasks shown here — no account, API, or external AI service. The most recent {MAX_TRANSCRIPT_MESSAGES} messages stay in this tab.</p>
          </aside>
        </div>
      </>}
      {page === 'briefing' && <Briefing tasks={tasks} onRun={runQuery} />}
      {page === 'case-study' && <CaseStudy />}
    </main>
    <footer><span>Northstar, its people, and its tasks are fictional. Changes stay in this browser.</span><a href="#case-study">How this sample works</a></footer>
    {pending && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPending(null) }}><div className="dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description confirm-scope dialog-boundary" ref={dialogRef}><p className="eyebrow">ONE LAST LOOK</p><h2 id="confirm-title">Review this change</h2><p id="confirm-description">{pending.label}</p><p className="dialog-note" id="confirm-scope">{previewRows.length ? `${previewRows.length} affected task${previewRows.length === 1 ? '' : 's'} with visible differences.` : 'No visible task values will change.'}</p><div className="preview-list">{previewRows.length ? previewRows.map((row) => <div className="preview-row" key={row.id}><strong>{row.id} · {row.title}</strong><dl className="preview-values"><div><dt>Before</dt><dd><s>{row.before}</s></dd></div><div><dt>After</dt><dd><b>{row.after}</b></dd></div></dl></div>) : <p className="dialog-note">Confirming still replaces incompatible saved browser data when a recovery warning is shown.</p>}</div><p className="dialog-note" id="dialog-boundary">This only changes the fictional tasks saved in this browser. {previewRows.length ? 'You can undo after confirming.' : 'An unchanged replacement does not create an Undo step.'} Clearing chat leaves this proposal open.</p><div className="dialog-actions"><button className="quiet-button" onClick={clearConversation}>Clear chat</button><button className="secondary" onClick={() => setPending(null)}>Cancel</button><button className="primary" onClick={confirmMutation}>Confirm change</button></div></div></div>}
  </div>
}

function TaskCard({ task, reasonDraft, onReasonDraft, onChange, onBlockerChange }: { task: Task; reasonDraft: string; onReasonDraft: (value: string) => void; onChange: (task: Task, field: 'status' | 'assignee', value: string) => void; onBlockerChange: (task: Task, reason: string) => void }) {
  const reasonChanged = reasonDraft.trim() !== (task.blocker?.trim() ?? '')
  return <article className={`task-card status-${task.status.toLowerCase().replaceAll(' ', '-')}`}><div className="task-main"><div className="task-topline"><span className="task-id">{task.id}</span><span className="project-tag">{task.project}</span></div><h3>{task.title}</h3><p>{task.priority} priority · Due <time dateTime={task.due}>{formatDue(task.due)}</time></p>{task.blocker && <p className="blocker-note"><b>{task.status === 'Blocked' ? 'Blocked' : 'Recorded blocker reason'}:</b> {task.blocker}</p>}</div><div className="task-controls"><label>Status<select aria-label={`Status for ${task.title}`} value={task.status} onChange={(event) => onChange(task, 'status', event.target.value)}>{statuses.map((status) => <option value={status} key={status} disabled={!canSetStatus(task, status)}>{!canSetStatus(task, status) ? 'Blocked — reason required' : status}</option>)}</select></label><label>Owner<select aria-label={`Owner for ${task.title}`} value={task.assignee} onChange={(event) => onChange(task, 'assignee', event.target.value)}>{people.map((person) => <option value={person} key={person}>{person}</option>)}</select></label><div className="blocker-editor"><label htmlFor={`blocker-${task.id}`}>Blocker reason</label><input id={`blocker-${task.id}`} aria-label={`Blocker reason for ${task.title}`} value={reasonDraft} maxLength={MAX_BLOCKER_LENGTH} onChange={(event) => onReasonDraft(event.target.value)} placeholder="Add a reason before Blocked"/><button type="button" disabled={!reasonChanged || !canSetBlockerReason(task, reasonDraft)} onClick={() => onBlockerChange(task, reasonDraft)} aria-label={`Review blocker reason for ${task.title}`}>Review reason</button></div></div></article>
}

function Briefing({ tasks, onRun }: { tasks: Task[]; onRun: (query: string) => void }) {
  const due = tasksDueThisSampleWeek(tasks)
  const blocked = tasks.filter((task) => task.status === 'Blocked')
  return <section className="briefing-page"><p className="eyebrow">SAMPLE WEEKLY VIEW</p><h1>What needs attention this week</h1><p className="lede">This view reads the same fictional tasks as the workspace. It changes after you confirm a task update.</p><div className="brief-grid"><article><span className="big-number">{due.length}</span><h2>Due by Sep 14</h2><ul>{due.map((task) => <li key={task.id}><b>{task.title}</b><span>Due {formatDue(task.due)}</span></li>)}</ul></article><article className="dark-card"><span className="big-number">{blocked.length}</span><h2>Need help</h2>{blocked.length ? <ul>{blocked.map((task) => <li key={task.id}><b>{task.title}</b><span>{task.blocker}</span></li>)}</ul> : <div className="brief-empty">Nothing is blocked.</div>}</article></div><button className="primary" onClick={() => { onRun('Give me a team briefing'); window.location.hash = 'board' }}>Discuss this briefing</button></section>
}

function CaseStudy() { return <article className="case-study"><p className="eyebrow">INDEPENDENT PRODUCT SAMPLE</p><h1>A safer conversation about work</h1><p className="lede">This prototype explores how a project lead might ask for help in everyday language while keeping the source, scope, and outcome clear.</p><div className="case-columns"><section><h2>The problem</h2><p>Status work becomes slower when people must translate what they mean into a rigid system. The sample keeps the conversation next to the records it can read.</p></section><section><h2>The product choice</h2><p>People can use a task title, a task code, ordinary status words such as “done” and “reopen,” or direct controls. The workspace asks when the target is unclear.</p></section><section><h2>Safety</h2><p>Status, owner, blocker-reason, bulk, reset, and undo changes get before-and-after previews. A blocker reason must be confirmed before a task can enter Blocked. Nothing changes until the person confirms it.</p></section><section><h2>My role as Product Manager</h2><p>I defined the user problem, prioritization, requirements, sample data, safety rules, and evaluation plan. AI tools assisted with implementation and verification.</p></section><section><h2>Limits</h2><p>Northstar, its people, and all tasks are fictional. This uses no Asana account, API, authentication, external AI, customer data, or production connection.</p></section><section><h2>Review the product work</h2><p><a href="https://github.com/mvahedi2020/Asana-Agent/blob/main/docs/product/PRD.md">Read the PRD ↗</a><br/><a href="https://github.com/mvahedi2020/Asana-Agent/blob/main/docs/product/AI_Evaluation.md">Read the AI evaluation approach ↗</a></p></section></div><a className="primary link-button" href="#board">Explore the sample workspace</a></article> }

export default App
