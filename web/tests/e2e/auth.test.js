import { expect, test } from '@playwright/test'

test.describe('Flujos E2E de Autenticación y Usuarios', () => {
    test('el admin inicia sesión y ve la lista de usuarios', async ({ page }) => {
        await page.goto('/login')
        await page.getByTestId('login-email').fill('admin@demo.com')
        await page.getByTestId('login-password').fill('Admin123!')
        await page.getByTestId('login-submit').click()

        await expect(page).toHaveURL(/\/usuarios/)
        await expect(page.getByTestId('user-row').first()).toBeVisible()
    })

    test('login con credenciales incorrectas muestra alerta', async ({ page }) => {
        await page.goto('/login')
        await page.getByTestId('login-email').fill('erroneo@demo.com')
        await page.getByTestId('login-password').fill('ClaveIncorrecta1!')
        await page.getByTestId('login-submit').click()

        await expect(page.getByTestId('alert')).toBeVisible()
        await expect(page).toHaveURL(/\/login/)
    })

    test('una ruta inexistente muestra la página de no encontrada', async ({ page }) => {
        await page.goto('/ruta-que-no-existe-xyz')
        await expect(page.locator('text=404')).toBeVisible()
    })
})
