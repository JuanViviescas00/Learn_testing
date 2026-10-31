import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from '@/composables/useAuth.js'
import { authApi } from '@/services/authApi.js'
import { tokenStorage } from '@/services/http.js'

describe('composables/useAuth.js', () => {
    beforeEach(() => {
        tokenStorage.clear()
        const { clearSession } = useAuth()
        clearSession()
        vi.restoreAllMocks()
    })

    it('inicia sesión con login() y actualiza state e isAuthenticated', async () => {
        vi.spyOn(authApi, 'login').mockResolvedValue({
            token: 'token-jwt-123',
            usuario: { id: 'u1', nombre: 'Carlos', rol: 'usuario' },
        })

        const { login, isAuthenticated, isAdmin, state } = useAuth()

        expect(isAuthenticated.value).toBe(false)
        await login({ email: 'carlos@demo.com', password: '123' })

        expect(isAuthenticated.value).toBe(true)
        expect(isAdmin.value).toBe(false)
        expect(state.user.nombre).toBe('Carlos')
        expect(tokenStorage.get()).toBe('token-jwt-123')
    })

    it('registra una cuenta nueva con register() y guarda la sesión', async () => {
        vi.spyOn(authApi, 'registro').mockResolvedValue({
            token: 'token-reg-123',
            usuario: { id: 'u3', nombre: 'Nuevo', rol: 'usuario' },
        })

        const { register, isAuthenticated, state } = useAuth()
        await register({ nombre: 'Nuevo', email: 'n@demo.com', password: '123' })

        expect(isAuthenticated.value).toBe(true)
        expect(state.user.nombre).toBe('Nuevo')
    })

    it('identifica correctamente si el usuario es admin', async () => {
        vi.spyOn(authApi, 'login').mockResolvedValue({
            token: 'token-admin-123',
            usuario: { id: 'u2', nombre: 'Admin', rol: 'admin' },
        })

        const { login, isAdmin } = useAuth()
        await login({ email: 'admin@demo.com', password: '123' })

        expect(isAdmin.value).toBe(true)
    })

    it('logout() limpia la sesión y el tokenStorage', async () => {
        const { setUser, logout, isAuthenticated, state } = useAuth()
        setUser({ id: 'u1', nombre: 'Juan' })
        tokenStorage.set('token-test')

        logout()

        expect(isAuthenticated.value).toBe(false)
        expect(state.user).toBeNull()
        expect(tokenStorage.get()).toBeNull()
    })
})
