import { describe, expect, it } from 'vitest'
import { canSetBlockerReason, canSetStatus, interpretRequest, isTask, MAX_BLOCKER_LENGTH, MAX_REQUEST_LENGTH, replacementPreviewRows, seedTasks, tasksDueThisSampleWeek, updateTasks } from './logic'

describe('plain-language workspace guide', () => {
  it('prepares a status change from a task title and an everyday status word', () => {
    const result = interpretRequest('Mark Finalize onboarding checklist as done', seedTasks)
    expect(result.type).toBe('change')
    if (result.type === 'change') { expect(result.request.value).toBe('Complete'); expect(result.request.ids).toEqual(['NTH-104']) }
  })

  it('does not confuse a title containing review with the requested done status', () => {
    const result = interpretRequest('Mark Review trial nurture copy done', seedTasks)
    expect(result.type).toBe('change')
    if (result.type === 'change') expect(result.request.value).toBe('Complete')
  })

  it('keeps a partial review-title match from creating a second status', () => {
    const result = interpretRequest('Mark review nurture copy done', seedTasks)
    expect(result.type).toBe('change')
    if (result.type === 'change') expect(result.request.value).toBe('Complete')
  })

  it('prepares assignment from a task title and a person name', () => {
    const result = interpretRequest('Assign Review trial nurture copy to Jon Bell', seedTasks)
    expect(result.type).toBe('change')
    if (result.type === 'change') { expect(result.request.field).toBe('assignee'); expect(result.request.value).toBe('Jon Bell') }
  })

  it('uses a previously clear task for a safe conversational follow-up', () => {
    const first = interpretRequest('When is Validate admin invite flow due?', seedTasks)
    expect(first.contextTaskId).toBe('NTH-115')
    const followUp = interpretRequest('Mark that done', seedTasks, first.contextTaskId)
    expect(followUp.type).toBe('change')
    if (followUp.type === 'change') expect(followUp.request.ids).toEqual(['NTH-115'])
  })

  it('requires a visible blocker reason before proposing blocked status', () => {
    const missingReason = interpretRequest('Mark Finalize onboarding checklist blocked', seedTasks)
    expect(missingReason.type).toBe('reply')
    expect(missingReason.text).toContain('no blocker reason')
    const unblocked = updateTasks(seedTasks, ['NTH-108'], 'status', 'In progress')
    expect(interpretRequest('Mark Instrument workspace-created event blocked', unblocked).type).toBe('change')
  })

  it('uses one status policy for tasks with and without blocker context', () => {
    expect(canSetStatus(seedTasks[0], 'Blocked')).toBe(false)
    expect(canSetStatus(seedTasks[1], 'Blocked')).toBe(true)
    expect(canSetStatus(seedTasks[0], 'In review')).toBe(true)
  })

  it('normalizes a blocker reason and protects blocked work from a blank reason', () => {
    const added = updateTasks(seedTasks, ['NTH-104'], 'blocker', '  Waiting on legal approval  ')
    expect(added[0].blocker).toBe('Waiting on legal approval')
    expect(isTask(added[0])).toBe(true)
    expect(canSetStatus(added[0], 'Blocked')).toBe(true)
    const rejected = updateTasks(seedTasks, ['NTH-108'], 'blocker', '   ')
    expect(rejected[1].blocker).toBe(seedTasks[1].blocker)
    const cleared = updateTasks(added, ['NTH-104'], 'blocker', '')
    expect(cleared[0].blocker).toBeUndefined()
    expect(canSetBlockerReason(seedTasks[0], 'x'.repeat(MAX_BLOCKER_LENGTH + 1))).toBe(false)
  })

  it('routes reason-edit requests to the explicit reviewed control', () => {
    for (const request of ['Set blocker reason for NTH-104 to legal approval', 'Mark NTH-104 blocked because legal approval is pending']) {
      const result = interpretRequest(request, seedTasks)
      expect(result.type).toBe('reply')
      expect(result.text).toContain('Blocker reason control')
      expect(result.text).toContain('no change has been prepared')
    }
  })

  it('accepts a first name in an owner follow-up', () => {
    const first = interpretRequest('When is Review trial nurture copy due?', seedTasks)
    const followUp = interpretRequest('Assign it to Maya', seedTasks, first.contextTaskId)
    expect(followUp.type).toBe('change')
    if (followUp.type === 'change') expect(followUp.request.value).toBe('Maya Chen')
  })

  it('asks for a task instead of guessing when a change has no target', () => {
    const result = interpretRequest('Mark it done', seedTasks)
    expect(result.type).toBe('reply')
    expect(result.text).toContain('Which task')
  })

  it('declines oversized requests before interpreting a task change', () => {
    const result = interpretRequest(`Mark NTH-104 done ${'x'.repeat(MAX_REQUEST_LENGTH)}`, seedTasks)
    expect(result.type).toBe('reply')
    expect(result.text).toContain(`${MAX_REQUEST_LENGTH} characters or fewer`)
  })

  it('does not silently choose between conflicting requested values', () => {
    expect(interpretRequest('Mark Finalize onboarding checklist done and in review', seedTasks).text).toContain('more than one requested status')
    expect(interpretRequest('Assign Finalize onboarding checklist to Maya or Jon', seedTasks).text).toContain('more than one possible owner')
  })

  it('asks for clarification when a partial title matches more than one task', () => {
    const similar = [...seedTasks, { ...seedTasks[0], id: 'NTH-999', title: 'Finalize onboarding survey' }]
    const result = interpretRequest('Mark finalize onboarding done', similar)
    expect(result.type).toBe('reply')
    expect(result.text).toContain('more than one')
  })

  it('keeps matching safe when a saved task contains regular-expression characters', () => {
    const savedTask = { ...seedTasks[0], id: 'NTH.104', title: 'Review [migration] checklist' }
    const result = interpretRequest('Mark "Review [migration] checklist" done', [savedTask])
    expect(result.type).toBe('change')
    if (result.type === 'change') expect(result.request.ids).toEqual(['NTH.104'])
  })

  it('treats reads and negated changes as safe replies', () => {
    expect(interpretRequest('Show blocked tasks', seedTasks).type).toBe('reply')
    expect(interpretRequest('Do not mark Finalize onboarding checklist done', seedTasks).type).toBe('reply')
    expect(interpretRequest('Change the due date for Finalize onboarding checklist', seedTasks).text).toContain('cannot change a due date')
  })

  it('uses a reviewable bulk request and keeps two requested fields together', () => {
    const bulk = interpretRequest('Complete all tasks in review', seedTasks)
    expect(bulk.type).toBe('change')
    if (bulk.type === 'change') expect(bulk.request.ids).toEqual(['NTH-112'])
    const combined = interpretRequest('Assign Finalize onboarding checklist to Jon Bell and mark it done', seedTasks)
    expect(combined.type).toBe('change')
    if (combined.type === 'change') {
      expect(combined.request.value).toBe('Complete')
      expect(combined.request.secondary).toEqual({ field: 'assignee', value: 'Jon Bell' })
    }
  })

  it('answers current-state questions from the given tasks', () => {
    const changed = updateTasks(seedTasks, ['NTH-108'], 'status', 'Complete')
    expect(interpretRequest('What is blocked?', seedTasks).text).toContain('2')
    expect(interpretRequest('What is blocked?', changed).text).toContain('Summarize churn interviews')
    expect(interpretRequest('When is NTH-104 due?', seedTasks).text).toContain('Sep 8')
  })

  it('distinguishes a retained blocker reason from a current Blocked status', () => {
    const unblocked = updateTasks(seedTasks, ['NTH-108'], 'status', 'In progress')
    const response = interpretRequest('When is NTH-108 due?', unblocked).text
    expect(response).toContain('is in progress')
    expect(response).toContain('A blocker reason remains recorded')
    expect(response).not.toContain('It is blocked because')
  })

  it('uses one fixed weekly horizon for the workspace and assistant', () => {
    expect(tasksDueThisSampleWeek(seedTasks).map((task) => task.id)).toEqual(['NTH-119', 'NTH-104', 'NTH-108', 'NTH-112', 'NTH-115'])
    expect(interpretRequest('What is due this week?', seedTasks).text).toContain('Due by Sep 14')
  })

  it('rejects malformed persisted records', () => {
    expect(isTask(seedTasks[0])).toBe(true)
    expect(isTask({ ...seedTasks[0], due: 'soon' })).toBe(false)
    expect(isTask({ ...seedTasks[0], due: '2026-02-30' })).toBe(false)
  })

  it('keeps the walkthrough tasks grounded in the Northstar fixture', () => {
    const byId = (id: string) => seedTasks.find((task) => task.id === id)!
    expect(byId('NTH-104')).toMatchObject({ title: 'Finalize onboarding checklist', status: 'In progress', assignee: 'Maya Chen' })
    expect(byId('NTH-112')).toMatchObject({ title: 'Review trial nurture copy', status: 'In review', assignee: 'Priya Shah' })
    expect(byId('NTH-115')).toMatchObject({ title: 'Validate admin invite flow', status: 'Planned', due: '2026-09-11' })
  })

  it('shows every visible field changed by a board replacement', () => {
    const saved = [{ ...seedTasks[0], title: 'Saved onboarding title', due: '2026-09-30', priority: 'Low' as const }]
    const rows = replacementPreviewRows(saved, [seedTasks[0]])
    expect(rows).toHaveLength(1)
    expect(rows[0].before).toContain('Title: Saved onboarding title')
    expect(rows[0].before).toContain('Due: 2026-09-30')
    expect(rows[0].after).toContain('Priority: High')
  })

  it('shows added, removed, and normalized task identities in a replacement', () => {
    const extra = { ...seedTasks[0], id: 'NTH-999', title: 'Temporary saved task' }
    const current = [{ ...seedTasks[0], id: ' nth-104 ' }, extra]
    const rows = replacementPreviewRows(current, [seedTasks[0], seedTasks[1]])
    expect(rows.find((row) => row.id === 'NTH-104')?.before).toContain('Task code:  nth-104 ')
    expect(rows.find((row) => row.id === 'NTH-999')?.after).toContain('removed')
    expect(rows.find((row) => row.id === 'NTH-108')?.after).toContain('added')
  })
})
