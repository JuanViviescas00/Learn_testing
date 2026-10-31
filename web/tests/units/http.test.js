import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, request, setUnauthorizedHandler, tokenStorage } from '@/services/http.js'

describe('tests/units/http.js', () => {
    beforeEach(() => {
        tokenStorage.clear()
        vi.restoreAllMocks()
    })

    afterEach(() => {
        tokenStorage.clear()
        vi.restoreAllMocks()
    })

    it('añade el header x-token si hay token guardado en tokenStorage', async () => {
        tokenStorage.set('mi-token-secreto')

        const fetchSpy = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ status: 'ok' }),
        })
        vi.stubGlobal('fetch', fetchSpy)

        await request('/test')

        expect(fetchSpy).toHaveBeenCalledWith(
            expect.any(URL),
            expect.objectContaining({
                headers: expect.objectContaining({
                    'x-token': 'mi-token-secreto',
                }),
            }),
        )
    })

    it('serializa el body a JSON y añade Content-Type', async () => {
        const fetchSpy = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ ok: true }),
        })
        vi.stubGlobal('fetch', fetchSpy)

        await request('/usuarios', { method: 'POST', body: { nombre: 'Carlos' } })

        expect(fetchSpy).toHaveBeenCalledWith(
            expect.any(URL),
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Content-Type': 'application/json',
                }),
                body: JSON.stringify({ nombre: 'Carlos' }),
            }),
        )
    })

    it('convierte errores con formato de express-validator ({ errores: [...] }) en ApiError con details', async () => {
        const fetchSpy = vi.fn().mockResolvedValue({
            ok: false,
            status: 400,
            json: async () => ({
                errores: [
                    { path: 'email', msg: 'Email inválido' },
                    { path: 'password', msg: 'Muy corta' },
                ],
            }),
        })
        vi.stubGlobal('fetch', fetchSpy)

        try {
            await request('/registro', { method: 'POST', body: {} })
        } catch (error) {
            expect(error).toBeInstanceOf(ApiError)
            expect(error.status).toBe(400)
            expect(error.details).toEqual({
                email: 'Email inválido',
                password: 'Muy corta',
            })
        }
    })

    it('convierte error general ({ error: "mensaje" }) en ApiError', async () => {
        const fetchSpy = vi.fn().mockResolvedValue({
            ok: false,
            status: 404,
            json: async () => ({ error: 'Ruta no encontrada' }),
        })
        vi.stubGlobal('fetch', fetchSpy)

        await expect(request('/inexistente')).rejects.toThrow('Ruta no encontrada')
    })

    it('lanza ApiError con status 0 si la llamada fetch falla', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network Error')))

        try {
            await request('/fallo')
        } catch (error) {
            expect(error).toBeInstanceOf(ApiError)
            expect(error.status).toBe(0)
            expect(error.message).toContain('No se pudo conectar')
        }
    })

    it('si responde 401 y hay token guardado, llama a setUnauthorizedHandler', async () => {
        tokenStorage.set('token-expirado')
        const onUnauthorized = vi.fn()
        setUnauthorizedHandler(onUnauthorized)

        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                status: 401,
                json: async () => ({ error: 'Token no válido' }),
            }),
        )

        await expect(request('/perfil')).rejects.toThrow()
        expect(onUnauthorized).toHaveBeenCalled()
    })
})
