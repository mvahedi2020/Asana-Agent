import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('./#board')
  await page.getByRole('button', { name: 'Reset sample' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Confirm change' }).click()
})

test('answers from task state and safely confirms then undoes a change', async ({ page }) => {
  await page.getByRole('button', { name: 'What is blocked?' }).click()
  await expect(page.getByText(/2 blockers:/)).toBeVisible()

  const row = page.getByRole('row').filter({ hasText: 'NTH-108' })
  await row.getByRole('button', { name: 'Blocked' }).click()
  const dialog = page.getByRole('dialog', { name: 'Confirm before updating' })
  await expect(dialog).toContainText('Complete NTH-108')
  await dialog.getByRole('button', { name: 'Confirm change' }).click()
  await expect(row.getByRole('button', { name: 'Complete' })).toBeVisible()

  await page.getByRole('button', { name: 'Undo last' }).click()
  await expect(row.getByRole('button', { name: 'Blocked' })).toBeVisible()
})

test('keeps a pending mutation after conversation is cleared', async ({ page }) => {
  await page.getByRole('textbox', { name: 'Message', exact: true }).fill('Assign NTH-104 to Jon Bell')
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.getByRole('dialog')).toContainText('Assign NTH-104 to Jon Bell')
  await page.keyboard.press('Escape')

  await page.getByRole('textbox', { name: 'Message', exact: true }).fill('Assign NTH-104 to Jon Bell')
  await page.getByRole('button', { name: 'Send message' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Clear chat' }).click()
  await expect(page.getByText('Conversation cleared.')).toBeVisible()
  await expect(page.getByRole('dialog')).toContainText('Assign NTH-104 to Jon Bell')
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click()
})

test('answers specific task scopes without broadening the request', async ({ page }) => {
  await page.getByRole('button', { name: 'Show Maya’s tasks' }).click()
  await expect(page.getByText(/Maya has 2 active tasks/)).toBeVisible()
  await page.getByRole('button', { name: 'What is overdue?' }).click()
  await expect(page.getByText(/1 overdue task: NTH-119/)).toBeVisible()
  await page.getByRole('button', { name: 'Show all tasks' }).click()
  await expect(page.getByText(/6 tasks: NTH-104/)).toBeVisible()
})
