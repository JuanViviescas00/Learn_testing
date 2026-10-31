import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authApi } from '@/services/authApi.js'
import { usersApi } from '@/services/usersApi.js'
import * as http from '@/services/http.js'

describe('services/apiServices.test.js', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    describe('authApi', () => {
        it('login llama a /auth/login con POST y credenciales', async () => {
            const spy = vi.spyOn(http, 'request').mockResolvedValue({ token: 'abc' })
            await authApi.login({ email: 'a@a.com', password: '123' })

            expect(spy).toHaveBeenCalledWith('/auth/login', {
                method: 'POST',
                body: { email: 'a@a.com', password: '123' },
            })
        })

        it('registro llama a /auth/registro con POST y datos', async () => {
            const spy = vi.spyOn(http, 'request').mockResolvedValue({ ok: true })
            await authApi.registro({ nombre: 'Juan' })

            expect(spy).toHaveBeenCalledWith('/auth/registro', {
                method: 'POST',
                body: { nombre: 'Juan' },
            })
        })

        it('perfil llama a /auth/perfil', async () => {
            const spy = vi.spyOn(http, 'request').mockResolvedValue({ uid: '1' })
            await authApi.perfil()
            expect(spy).toHaveBeenCalledWith('/auth/perfil')
        })

        it('actualizarPerfil llama a /auth/perfil con PUT', async () => {
            const spy = vi.spyOn(http, 'request').mockResolvedValue({ ok: true })
            await authApi.actualizarPerfil({ nombre: 'Nuevo' })

            expect(spy).toHaveBeenCalledWith('/auth/perfil', {
                method: 'PUT',
                body: { nombre: 'Nuevo' },
            })
        })

        it('cambiarPassword llama a /auth/password con PUT', async () => {
            const spy = vi.spyOn(http, 'request').mockResolvedValue({ ok: true })
            await authApi.cambiarPassword({ passwordActual: '1', passwordNueva: '2' })

            expect(spy).toHaveBeenCalledWith('/auth/password', {
                method: 'PUT',
                body: { passwordActual: '1', passwordNueva: '2' },
            })
        })
    })

    describe('usersApi', () => {
        it('listar llama a /usuarios con query', async () => {
            const spy = vi.spyOn(http, 'request').mockResolvedValue({ usuarios: [] })
            await usersApi.listar({ buscar: 'ana', rol: 'admin' })

            expect(spy).toHaveBeenCalledWith('/usuarios', {
                query: { buscar: 'ana', rol: 'admin', pagina: undefined, limite: undefined },
            })
        })

        it('obtener llama a /usuarios/:id', async () => {
            const spy = vi.spyOn(http, 'request').mockResolvedValue({ id: '123' })
            await usersApi.obtener('123')
            expect(spy).toHaveBeenCalledWith('/usuarios/123')
        })

        it('crear llama a /usuarios con POST', async () => {
            const spy = vi.spyOn(http, 'request').mockResolvedValue({ id: '123' })
            await usersApi.crear({ nombre: 'Test' })

            expect(spy).toHaveBeenCalledWith('/usuarios', {
                method: 'POST',
                body: { nombre: 'Test' },
            })
        })

        it('actualizar llama a /usuarios/:id con PUT', async () => {
            const spy = vi.spyOn(http, 'request').mockResolvedValue({ id: '123' })
            await usersApi.actualizar('123', { nombre: 'Edit' })

            expect(spy).toHaveBeenCalledWith('/usuarios/123', {
                method: 'PUT',
                body: { nombre: 'Edit' },
            })
        })

        it('eliminar llama a /usuarios/:id con DELETE', async () => {
            const spy = vi.spyOn(http, 'request').mockResolvedValue({ ok: true })
            await usersApi.eliminar('123')
            expect(spy).toHaveBeenCalledWith('/usuarios/123', { method: 'DELETE' })
        })
    })
})
