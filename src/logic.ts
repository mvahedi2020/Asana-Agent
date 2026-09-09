export type Status = 'Planned' | 'In progress' | 'Blocked' | 'In review' | 'Complete'
export type Person = 'Maya Chen' | 'Jon Bell' | 'Priya Shah' | 'Unassigned'

export interface Task {
  id: string
  title: string
  project: string
  status: Status
  assignee: Person
  due: string
  priority: 'High' | 'Medium' | 'Low'
  blocker?: string
}

export type Field = 'status' | 'assignee'
export type ChangeRequest = { kind: 'change'; ids: string[]; field: Field; value: Status | Person; secondary?: { field: Field; value: Status | Person }; label: string }
export type AssistantResult = { type: 'reply'; text: string; contextTaskId?: string } | { type: 'change'; request: ChangeRequest; text: string; contextTaskId: string }

export const SAMPLE_TODAY = '2026-09-08'
export const people: Person[] = ['Maya Chen', 'Jon Bell', 'Priya Shah', 'Unassigned']
export const statuses: Status[] = ['Planned', 'In progress', 'Blocked', 'In review', 'Complete']

export const seedTasks: Task[] = [
  { id: 'NTH-104', title: 'Finalize onboarding checklist', project: 'Activation', status: 'In progress', assignee: 'Maya Chen', due: '2026-09-08', priority: 'High' },
  { id: 'NTH-108', title: 'Instrument workspace-created event', project: 'Activation', status: 'Blocked', assignee: 'Jon Bell', due: '2026-09-09', priority: 'High', blocker: 'Waiting on event schema approval' },
  { id: 'NTH-112', title: 'Review trial nurture copy', project: 'Lifecycle', status: 'In review', assignee: 'Priya Shah', due: '2026-09-10', priority: 'Medium' },
  { id: 'NTH-115', title: 'Validate admin invite flow', project: 'Activation', status: 'Planned', assignee: 'Maya Chen', due: '2026-09-11', priority: 'Medium' },
  { id: 'NTH-119', title: 'Summarize churn interviews', project: 'Retention', status: 'Blocked', assignee: 'Priya Shah', due: '2026-09-07', priority: 'High', blocker: 'Two interview notes are missing' },
  { id: 'NTH-121', title: 'Ship role template empty state', project: 'Adoption', status: 'Complete', assignee: 'Jon Bell', due: '2026-09-05', priority: 'Low' },
]

const stopWords = new Set(['a', 'an', 'the', 'to', 'for', 'of', 'on', 'in', 'at', 'this', 'that', 'task', 'tasks', 'status', 'please', 'can', 'you', 'me', 'my', 'with', 'and', 'all'])
const date = (value: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`))
const quoted = (input: string) => [...input.matchAll(/["“]([^"”]+)["”]/g)].map((match) => match[1].toLowerCase())
const words = (input: string) => input.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter((word) => word.length > 2 && !stopWords.has(word))

export function findTasks(input: string, tasks: Task[]): Task[] {
  const lower = input.toLowerCase()
  const byId = tasks.filter((task) => new RegExp(`\\b${task.id.toLowerCase()}\\b`, 'i').test(lower))
  if (byId.length) return byId
  const exactTitles = tasks.filter((task) => quoted(input).some((title) => task.title.toLowerCase().includes(title) || title.includes(task.title.toLowerCase())))
  if (exactTitles.length) return exactTitles
  const queryWords = new Set(words(input))
  return tasks.filter((task) => {
    const titleWords = words(task.title)
    const overlap = titleWords.filter((word) => queryWords.has(word)).length
    return overlap >= 2 && overlap / titleWords.length >= 0.5
  })
}

export function readTaskList(tasks: Task[]): string {
  if (!tasks.length) return 'There are no matching tasks in this sample workspace.'
  return tasks.map((task) => `${task.title} — ${task.status}, owned by ${task.assignee}, due ${date(task.due)}.`).join(' ')
}

function statusFrom(input: string): Status | undefined {
  const value = input.toLowerCase()
  if (/\b(done|complete|completed|finish|finished|close|closed)\b/.test(value)) return 'Complete'
  if (/\b(reopen|reopened|resume|resumed)\b/.test(value)) return 'In progress'
  if (/\b(in progress|in-progress|working on|started|start)\b/.test(value)) return 'In progress'
  if (/\b(blocked|block|stuck)\b/.test(value)) return 'Blocked'
  if (/\b(in review|review)\b/.test(value)) return 'In review'
  if (/\b(planned|plan|backlog)\b/.test(value)) return 'Planned'
  return undefined
}

function personFrom(input: string): Person | undefined {
  const value = input.toLowerCase()
  const byFullName = people.find((person) => value.includes(person.toLowerCase()))
  if (byFullName) return byFullName
  if (/\bmaya\b/.test(value)) return 'Maya Chen'
  if (/\bjon\b/.test(value)) return 'Jon Bell'
  if (/\bpriya\b/.test(value)) return 'Priya Shah'
  if (/\bunassigned\b/.test(value)) return 'Unassigned'
  return undefined
}
function changeVerb(input: string) { return /\b(assign|give|make|set|change|move|mark|put|update|reopen|resume|finish|complete|close|start)\b/.test(input.toLowerCase()) }
function names(tasks: Task[]) { return tasks.map((task) => `“${task.title}”`).join(', ') }

export function interpretRequest(input: string, tasks: Task[], contextTaskId?: string): AssistantResult {
  const lower = input.toLowerCase()
  const directMatches = findTasks(input, tasks)
  const usesPronoun = /\b(it|that|this one)\b/.test(lower)
  const matched = directMatches.length ? directMatches : usesPronoun && contextTaskId ? tasks.filter((task) => task.id === contextTaskId) : []
  const assignee = personFrom(input)
  const textOutsideTaskTitles = tasks.reduce((text, task) => text.replace(new RegExp(task.title, 'ig'), ''), input)
  const requestedStatus = statusFrom(textOutsideTaskTitles)
  const asksToChange = changeVerb(input) && Boolean(assignee || requestedStatus)

  if (/\b(do not|don't|dont|not)\b/.test(lower) && asksToChange) return { type: 'reply', text: 'I will not prepare that change. If you want to make an update, tell me the task, the status or owner you want, and I will show it for review first.' }
  if (/\b(all|every)\b.*\b(review|in review)\b.*\b(done|complete|finished)\b|\b(done|complete|finished)\b.*\b(all|every)\b.*\b(review|in review)\b/.test(lower)) {
    const inReview = tasks.filter((task) => task.status === 'In review')
    if (!inReview.length) return { type: 'reply', text: 'There are no tasks in review right now, so there is nothing to complete.' }
    return { type: 'change', request: { kind: 'change', ids: inReview.map((task) => task.id), field: 'status', value: 'Complete', label: `Mark ${inReview.length} task${inReview.length === 1 ? '' : 's'} in review as complete` }, text: `I prepared a change for ${inReview.length} task${inReview.length === 1 ? '' : 's'} in review. Review every affected task before confirming.`, contextTaskId: inReview[0].id }
  }
  if (asksToChange && directMatches.length > 1) return { type: 'reply', text: `I found more than one possible task: ${names(directMatches)}. Please name one task or use its task code so I can prepare the right change.` }
  if (asksToChange && !matched.length) return { type: 'reply', text: 'Which task should I change? Please give its title or task code. I will show the exact change before anything is updated.' }
  if (asksToChange && assignee && requestedStatus) {
    const task = matched[0]
    if (task.status === requestedStatus && task.assignee === assignee) return { type: 'reply', text: `“${task.title}” is already ${requestedStatus.toLowerCase()} and owned by ${assignee}. No change is needed.`, contextTaskId: task.id }
    return { type: 'change', request: { kind: 'change', ids: [task.id], field: 'status', value: requestedStatus, secondary: { field: 'assignee', value: assignee }, label: `Change “${task.title}” from ${task.status} to ${requestedStatus} and change the owner from ${task.assignee} to ${assignee}` }, text: `I’m ready to update the status and owner of “${task.title}.” Review both changes below; nothing has changed yet.`, contextTaskId: task.id }
  }
  if (asksToChange && assignee) {
    const task = matched[0]
    if (task.assignee === assignee) return { type: 'reply', text: `“${task.title}” is already owned by ${assignee}. No change is needed.`, contextTaskId: task.id }
    return { type: 'change', request: { kind: 'change', ids: [task.id], field: 'assignee', value: assignee, label: `Change the owner of “${task.title}” to ${assignee}` }, text: `I’m ready to change the owner of “${task.title}” to ${assignee}. Review the preview below; nothing has changed yet.`, contextTaskId: task.id }
  }
  if (asksToChange && requestedStatus) {
    const task = matched[0]
    if (task.status === requestedStatus) return { type: 'reply', text: `“${task.title}” is already ${requestedStatus.toLowerCase()}. No change is needed.`, contextTaskId: task.id }
    return { type: 'change', request: { kind: 'change', ids: [task.id], field: 'status', value: requestedStatus, label: `Change “${task.title}” from ${task.status} to ${requestedStatus}` }, text: `I’m ready to change “${task.title}” to ${requestedStatus}. Review the preview below; nothing has changed yet.`, contextTaskId: task.id }
  }

  if (changeVerb(input) && /\b(due|deadline)\b/.test(lower)) return { type: 'reply', text: 'I can show due dates in this sample, but I cannot change a due date. You can ask when a task is due or prepare a status or owner change.' }

  if (directMatches.length === 1 && /\b(when|due|details|tell me about|show)\b/.test(lower)) {
    const task = directMatches[0]
    return { type: 'reply', text: `“${task.title}” is ${task.status.toLowerCase()}, owned by ${task.assignee}, and due ${date(task.due)}${task.blocker ? `. It is blocked because ${task.blocker.toLowerCase()}` : ''}.`, contextTaskId: task.id }
  }
  if (directMatches.length > 1 && /\b(when|due|details|show)\b/.test(lower)) return { type: 'reply', text: `I found several tasks: ${names(directMatches)}. Please tell me which one you mean.` }
  if (/\b(blocker|blocked|stuck|risk)\b/.test(lower)) {
    const blocked = tasks.filter((task) => task.status === 'Blocked')
    return { type: 'reply', text: blocked.length ? `${blocked.length} task${blocked.length === 1 ? '' : 's'} need attention: ${blocked.map((task) => `“${task.title}” is blocked — ${task.blocker}.`).join(' ')}` : 'Nothing is blocked right now.' }
  }
  if (/\b(all tasks|list tasks|show tasks|what.?s on the board)\b/.test(lower)) return { type: 'reply', text: readTaskList(tasks) }
  if (assignee && /\b(task|assigned|work|list|show)\b/.test(lower)) return { type: 'reply', text: `${assignee} has: ${readTaskList(tasks.filter((task) => task.assignee === assignee && task.status !== 'Complete'))}` }
  if (/\b(my tasks|assigned to me|maya.?s tasks|maya.?s work)\b/.test(lower)) return { type: 'reply', text: `Maya has: ${readTaskList(tasks.filter((task) => task.assignee === 'Maya Chen' && task.status !== 'Complete'))}` }
  if (/\b(overdue|past due)\b/.test(lower)) return { type: 'reply', text: `Using the sample date Sep 8, overdue work is: ${readTaskList(tasks.filter((task) => task.status !== 'Complete' && task.due < SAMPLE_TODAY))}` }
  if (/\b(today|due today)\b/.test(lower)) return { type: 'reply', text: `Using the sample date Sep 8, due today: ${readTaskList(tasks.filter((task) => task.status !== 'Complete' && task.due === SAMPLE_TODAY))}` }
  if (/\b(this week|week|due)\b/.test(lower)) return { type: 'reply', text: `Due by Sep 14: ${readTaskList(tasks.filter((task) => task.status !== 'Complete' && task.due <= '2026-09-14').sort((a, b) => a.due.localeCompare(b.due)))}` }
  if (/\b(briefing|standup|morning)\b/.test(lower)) {
    const active = tasks.filter((task) => task.status !== 'Complete')
    const blocked = tasks.filter((task) => task.status === 'Blocked')
    return { type: 'reply', text: `This week: ${active.length} tasks are still open, ${blocked.length} are blocked, and ${active.filter((task) => task.due <= SAMPLE_TODAY).length} are due or overdue today. Start with ${active.find((task) => task.due <= SAMPLE_TODAY)?.title ?? 'your highest-priority open task'}.` }
  }
  if (/\b(summary|progress|project)\b/.test(lower)) {
    const complete = tasks.filter((task) => task.status === 'Complete').length
    return { type: 'reply', text: `${complete} of ${tasks.length} tasks are complete. ${tasks.filter((task) => task.status === 'Blocked').length} need help because they are blocked.` }
  }
  return { type: 'reply', text: 'I can help you review this sample board, find due work or blockers, and prepare a status or owner change. Try: “Mark Finalize onboarding checklist as done” or “Assign Review trial nurture copy to Jon Bell.” I will always show the change before applying it.' }
}

export function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false
  const task = value as Partial<Task>
  if (typeof task.due !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(task.due)) return false
  const parsed = new Date(`${task.due}T00:00:00Z`)
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === task.due && typeof task.id === 'string' && typeof task.title === 'string' && typeof task.project === 'string' && statuses.includes(task.status as Status) && people.includes(task.assignee as Person) && ['High', 'Medium', 'Low'].includes(task.priority ?? '') && (task.blocker === undefined || typeof task.blocker === 'string')
}

export function updateTasks(tasks: Task[], ids: string[], field: Field, value: Status | Person): Task[] {
  return tasks.map((task) => ids.includes(task.id) ? { ...task, [field]: value } : task)
}
