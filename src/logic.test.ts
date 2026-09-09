import { describe, expect, it } from 'vitest'
import { interpretRequest, isTask, seedTasks, updateTasks } from './logic'

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

  it('asks for clarification when a partial title matches more than one task', () => {
    const similar = [...seedTasks, { ...seedTasks[0], id: 'NTH-999', title: 'Finalize onboarding survey' }]
    const result = interpretRequest('Mark finalize onboarding done', similar)
    expect(result.type).toBe('reply')
    expect(result.text).toContain('more than one')
  })

  it('treats reads and negated changes as safe replies', () => {
    expect(interpretRequest('Show blocked tasks', seedTasks).type).toBe('reply')
    expect(interpretRequest('Do not mark Finalize onboarding checklist done', seedTasks).type).toBe('reply')
    expect(interpretRequest('Change the due date for Finalize onboarding checklist', seedTasks).text).toContain('cannot change a due date')
  })

  it('uses a reviewable bulk request and requests clarity for two fields', () => {
    const bulk = interpretRequest('Complete all tasks in review', seedTasks)
    expect(bulk.type).toBe('change')
    if (bulk.type === 'change') expect(bulk.request.ids).toEqual(['NTH-112'])
    const split = interpretRequest('Assign Finalize onboarding checklist to Jon Bell and mark it done', seedTasks)
    expect(split.type).toBe('reply')
    expect(split.text).toContain('one change at a time')
  })

  it('answers current-state questions from the given tasks', () => {
    const changed = updateTasks(seedTasks, ['NTH-108'], 'status', 'Complete')
    expect(interpretRequest('What is blocked?', seedTasks).text).toContain('2')
    expect(interpretRequest('What is blocked?', changed).text).toContain('Summarize churn interviews')
    expect(interpretRequest('When is NTH-104 due?', seedTasks).text).toContain('Sep 8')
  })

  it('rejects malformed persisted records', () => {
    expect(isTask(seedTasks[0])).toBe(true)
    expect(isTask({ ...seedTasks[0], due: 'soon' })).toBe(false)
    expect(isTask({ ...seedTasks[0], due: '2026-02-30' })).toBe(false)
  })
})
