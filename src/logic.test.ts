import { describe, expect, it } from 'vitest'
import { isTask, queryKind, seedTasks, taskAnswer, updateTasks } from './logic'

describe('agent task logic', () => {
  it('routes supported language deterministically', () => {
    expect(queryKind('What is blocked?')).toBe('blockers')
    expect(queryKind('Give me a morning briefing')).toBe('briefing')
    expect(queryKind('Show Maya’s tasks')).toBe('mine')
    expect(queryKind('What is overdue?')).toBe('overdue')
    expect(queryKind('List all tasks')).toBe('all')
    expect(queryKind('Book a flight')).toBe('unsupported')
  })

  it('distinguishes today, overdue, and weekly scopes', () => {
    expect(taskAnswer('today', seedTasks)).toContain('1 active task due today')
    expect(taskAnswer('overdue', seedTasks)).toContain('NTH-119')
    expect(taskAnswer('week', seedTasks)).toContain('due by Sep 14')
  })

  it('answers from current task data', () => {
    const changed = updateTasks(seedTasks, ['NTH-108'], 'status', 'Complete')
    expect(taskAnswer('blockers', seedTasks)).toContain('2 blockers')
    expect(taskAnswer('blockers', changed)).toContain('1 blockers')
  })

  it('updates only targeted tasks', () => {
    const changed = updateTasks(seedTasks, ['NTH-104'], 'assignee', 'Jon Bell')
    expect(changed.find((task) => task.id === 'NTH-104')?.assignee).toBe('Jon Bell')
    expect(changed.find((task) => task.id === 'NTH-108')).toEqual(seedTasks[1])
  })

  it('rejects malformed persisted records', () => {
    expect(isTask(seedTasks[0])).toBe(true)
    expect(isTask({ ...seedTasks[0], due: 'soon' })).toBe(false)
    expect(isTask({ title: 'missing fields' })).toBe(false)
  })
})
