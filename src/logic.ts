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

export const SAMPLE_TODAY = '2026-09-08'

export const seedTasks: Task[] = [
  { id: 'NTH-104', title: 'Finalize onboarding checklist', project: 'Activation', status: 'In progress', assignee: 'Maya Chen', due: '2026-09-08', priority: 'High' },
  { id: 'NTH-108', title: 'Instrument workspace-created event', project: 'Activation', status: 'Blocked', assignee: 'Jon Bell', due: '2026-09-09', priority: 'High', blocker: 'Waiting on event schema approval' },
  { id: 'NTH-112', title: 'Review trial nurture copy', project: 'Lifecycle', status: 'In review', assignee: 'Priya Shah', due: '2026-09-10', priority: 'Medium' },
  { id: 'NTH-115', title: 'Validate admin invite flow', project: 'Activation', status: 'Planned', assignee: 'Maya Chen', due: '2026-09-11', priority: 'Medium' },
  { id: 'NTH-119', title: 'Summarize churn interviews', project: 'Retention', status: 'Blocked', assignee: 'Priya Shah', due: '2026-09-07', priority: 'High', blocker: 'Two interview notes are missing' },
  { id: 'NTH-121', title: 'Ship role template empty state', project: 'Adoption', status: 'Complete', assignee: 'Jon Bell', due: '2026-09-05', priority: 'Low' },
]

export type QueryKind = 'all' | 'mine' | 'today' | 'overdue' | 'week' | 'blockers' | 'briefing' | 'summary' | 'unsupported'

export function queryKind(input: string): QueryKind {
  const value = input.toLowerCase()
  if (/all task|list (the )?tasks|show (the )?tasks/.test(value)) return 'all'
  if (/block|stuck|risk/.test(value)) return 'blockers'
  if (/brief|standup|morning/.test(value)) return 'briefing'
  if (/summary|project|progress/.test(value)) return 'summary'
  if (/overdue|past due/.test(value)) return 'overdue'
  if (/today/.test(value)) return 'today'
  if (/this week|week|due/.test(value)) return 'week'
  if (/my task|assigned to me|mine|maya.?s task/.test(value)) return 'mine'
  return 'unsupported'
}

export function taskAnswer(kind: QueryKind, tasks: Task[]): string {
  const active = tasks.filter((task) => task.status !== 'Complete')
  if (kind === 'all') return tasks.length ? `${tasks.length} tasks: ${tasks.map((task) => `${task.id} ${task.title} (${task.status})`).join('; ')}.` : 'There are no tasks in this sample workspace.'
  if (kind === 'mine') {
    const mine = active.filter((task) => task.assignee === 'Maya Chen')
    return mine.length ? `Maya has ${mine.length} active tasks: ${mine.map((task) => `${task.id} ${task.title} (${task.status}, due ${task.due})`).join('; ')}.` : 'Maya has no active tasks.'
  }
  if (kind === 'today') {
    const due = active.filter((task) => task.due === SAMPLE_TODAY)
    return due.length ? `${due.length} active task${due.length === 1 ? '' : 's'} due today: ${due.map((task) => `${task.id} ${task.title}`).join('; ')}.` : 'No active tasks are due today.'
  }
  if (kind === 'overdue') {
    const due = active.filter((task) => task.due < SAMPLE_TODAY).sort((a, b) => a.due.localeCompare(b.due))
    return due.length ? `${due.length} overdue task${due.length === 1 ? '' : 's'}: ${due.map((task) => `${task.id} ${task.title} (due ${task.due})`).join('; ')}.` : 'No active tasks are overdue.'
  }
  if (kind === 'week') {
    const due = active.filter((task) => task.due <= '2026-09-14').sort((a, b) => a.due.localeCompare(b.due))
    return due.length ? `${due.length} active tasks are due by Sep 14: ${due.map((task) => `${task.id} on ${task.due}${task.due < SAMPLE_TODAY ? ' (overdue)' : ''}`).join('; ')}.` : 'No active tasks are due by Sep 14.'
  }
  if (kind === 'blockers') {
    const blocked = active.filter((task) => task.status === 'Blocked')
    return blocked.length ? `${blocked.length} blockers: ${blocked.map((task) => `${task.id} — ${task.blocker ?? 'No blocker note'}`).join('; ')}.` : 'No tasks are currently blocked.'
  }
  if (kind === 'briefing') {
    const today = active.filter((task) => task.due <= SAMPLE_TODAY)
    const blocked = active.filter((task) => task.status === 'Blocked')
    return `Team briefing: ${active.length} active tasks, ${today.length} due or overdue, and ${blocked.length} blocked. Today’s focus is ${today[0]?.title ?? 'the highest-priority active work'}.`
  }
  if (kind === 'summary') {
    const complete = tasks.filter((task) => task.status === 'Complete').length
    const blocked = tasks.filter((task) => task.status === 'Blocked').length
    return `Northstar portfolio: ${complete} of ${tasks.length} tasks complete (${Math.round((complete / tasks.length) * 100)}%); ${blocked} blocked; ${tasks.length - complete - blocked} moving or planned.`
  }
  return 'I can help with assigned work, due dates, blockers, a team briefing, or a project summary. I only use the sample tasks shown here, so I cannot search other workspaces or perform unsupported actions.'
}

export function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false
  const task = value as Partial<Task>
  if(typeof task.due!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(task.due))return false
  const date=new Date(task.due+'T00:00:00Z')
  if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==task.due)return false
  return typeof task.id === 'string' && typeof task.title === 'string' && typeof task.project === 'string' && statusesForValidation.includes(task.status as Status) && peopleForValidation.includes(task.assignee as Person) && /^\d{4}-\d{2}-\d{2}$/.test(task.due ?? '') && ['High', 'Medium', 'Low'].includes(task.priority ?? '') && (task.blocker === undefined || typeof task.blocker === 'string')
}

const statusesForValidation: Status[] = ['Planned', 'In progress', 'Blocked', 'In review', 'Complete']
const peopleForValidation: Person[] = ['Maya Chen', 'Jon Bell', 'Priya Shah', 'Unassigned']

export function updateTasks(tasks: Task[], ids: string[], field: 'status' | 'assignee', value: Status | Person): Task[] {
  return tasks.map((task) => ids.includes(task.id) ? { ...task, [field]: value } : task)
}
