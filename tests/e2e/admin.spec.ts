import { expect, test } from '@playwright/test'

test('admin panel is served in Polish', async ({ page }) => {
  await page.goto('/admin')

  // Without users Payload redirects to /admin/create-first-user, otherwise to /admin/login.
  await expect(page).toHaveURL(/\/admin(\/|$)/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'pl')
})
