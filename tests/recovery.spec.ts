import { expect, test } from '@playwright/test'
import { seedTasks } from '../src/logic'

test('preserves incompatible saved state until an explicit confirmed reset', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('northstar.asana-agent.v1', JSON.stringify({ version: 2, tasks: [] })))
  await page.goto('./')
  await expect(page.getByRole('status')).toContainText('original saved data is untouched')
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('northstar.asana-agent.v1')!).version)).toBe(2)
  await page.getByRole('button', { name: 'Reset sample' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('northstar.asana-agent.v1')!).version)).toBe(2)
  await page.getByRole('button', { name: 'Reset sample' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Confirm change' }).click()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('northstar.asana-agent.v1')!).version)).toBe(1)
})

test('invalid stored dates recover to the sample without a render crash', async ({ page }) => {
  await page.addInitScript((tasks) => localStorage.setItem('northstar.asana-agent.v1', JSON.stringify({ version: 1, tasks })), [{ ...seedTasks[0], due: '2026-99-99' }])
  await page.goto('./')
  await expect(page.getByRole('heading', { name: 'A calmer way to move work forward.' })).toBeVisible()
  await expect(page.getByRole('status')).toContainText('could not be read')
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('northstar.asana-agent.v1')!).tasks[0].due)).toBe('2026-99-99')
})

test('reset preview identifies tasks added to and removed from the board', async ({ page }) => {
  const extra = { ...seedTasks[0], id: 'NTH-999', title: 'Temporary saved task' }
  await page.addInitScript((tasks) => localStorage.setItem('northstar.asana-agent.v1', JSON.stringify({ version: 1, tasks })), [...seedTasks.slice(0, -1), extra])
  await page.goto('./')
  await page.getByRole('button', { name: 'Reset sample' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('NTH-999 · Temporary saved task')
  await expect(dialog).toContainText('Record removed by this replacement')
  await expect(dialog).toContainText('NTH-121 · Ship role template empty state')
  await expect(dialog).toContainText('Record added by this replacement')
})

test('preserves an oversized saved board for explicit recovery', async ({ page }) => {
  const tasks = Array.from({ length: 51 }, (_, index) => ({ ...seedTasks[0], id: `NTH-${index}` }))
  await page.addInitScript((saved) => localStorage.setItem('northstar.asana-agent.v1', JSON.stringify({ version: 1, tasks: saved })), tasks)
  await page.goto('./')
  await expect(page.getByRole('status')).toContainText('original saved data is untouched')
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('northstar.asana-agent.v1')!).tasks.length)).toBe(51)
})
