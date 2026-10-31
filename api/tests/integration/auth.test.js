import request from 'supertest'
import { afterEach, describe, expect, it, vi } from 'vitest'
import app from '../../app.js'
import { crearUsuario, PASS_PHARAFA, tokenUsuario } from '../helpers/fabrica.js'

// Evitamos que app.js conecte a la BD real o abra el puerto 3000 durante los tests
vi.mock('../../database/config.js', () => ({
    dbConnection: vi.fn().mockReturnValue(new Promise(() => {})),
}))

describe('tests/integration/auth.test.js - Autenticación (/api/auth)', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('POST /api/auth/registro', () => {
        it('con datos válidos responde 201, token, rol "usuario" y no incluye password', async () => {
            const res = await request(app)
                .post('/api/auth/registro')
                .send({
                    nombre: 'Nuevo Usuario',
                    email: `registro_${Date.now()}@demo.com`,
                    password: 'Password123!',
                    rol: 'admin', // La API debe ignorar admin y asignar usuario
                })

            expect(res.status).toBe(201)
            expect(res.body).toHaveProperty('token')
            expect(res.body.usuario.rol).toBe('usuario')
            expect(res.body.usuario).not.toHaveProperty('password')
        })

        it('con email ya registrado responde 400', async () => {
            const email = `repetido_${Date.now()}@demo.com`
            await crearUsuario({ email })

            const res = await request(app)
                .post('/api/auth/registro')
                .send({
                    nombre: 'Otro Usuario',
                    email,
                    password: 'Password123!',
                })

            expect(res.status).toBe(400)
            expect(res.body.errores[0].path).toBe('email')
        })

        it('con contraseña inválida (sin mayúscula o < 8 caracteres) responde 400', async () => {
            const res = await request(app)
                .post('/api/auth/registro')
                .send({
                    nombre: 'Usuario Invalido',
                    email: `invalido_${Date.now()}@demo.com`,
                    password: 'debil',
                })

            expect(res.status).toBe(400)
        })
    })

    describe('POST /api/auth/login', () => {
        it('con credenciales correctas responde 200 con token y uid', async () => {
            const email = `login_${Date.now()}@demo.com`
            const usuario = await crearUsuario({ email, password: PASS_PHARAFA })

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email, password: PASS_PHARAFA })

            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty('token')
            expect(res.body.usuario.uid).toBe(usuario.id)
        })

        it('con credenciales incorrectas responde 401 "Credenciales inválidas"', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'inexistente@demo.com', password: 'Password123!' })

            expect(res.status).toBe(401)
            expect(res.body.error).toBe('Credenciales inválidas')
        })

        it('con usuario desactivado (estado: false) responde 401', async () => {
            const email = `desactivado_${Date.now()}@demo.com`
            await crearUsuario({ email, password: PASS_PHARAFA, estado: false })

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email, password: PASS_PHARAFA })

            expect(res.status).toBe(401)
            expect(res.body.error).toBe('Usuario desactivado')
        })
    })

    describe('GET /api/auth/perfil', () => {
        it('sin token responde 401', async () => {
            const res = await request(app).get('/api/auth/perfil')
            expect(res.status).toBe(401)
        })

        it('con token inválido responde 401', async () => {
            const res = await request(app).get('/api/auth/perfil').set('x-token', 'token-invalido-123')
            expect(res.status).toBe(401)
        })

        it('con token válido responde 200 con los datos del perfil', async () => {
            const email = `perfil_${Date.now()}@demo.com`
            const usuario = await crearUsuario({ email })
            const token = await tokenUsuario({ _id: usuario._id, email })

            const res = await request(app).get('/api/auth/perfil').set('x-token', token)

            expect(res.status).toBe(200)
            expect(res.body.email).toBe(email)
        })
    })

    describe('PUT /api/auth/password', () => {
        it('con contraseña actual incorrecta responde 400', async () => {
            const usuario = await crearUsuario({ password: PASS_PHARAFA })
            const token = await tokenUsuario({ _id: usuario._id })

            const res = await request(app)
                .put('/api/auth/password')
                .set('x-token', token)
                .send({ passwordActual: 'Incorrecta1!', passwordNueva: 'NuevaPassword123!' })

            expect(res.status).toBe(400)
        })

        it('con contraseña nueva igual a la actual responde 400', async () => {
            const usuario = await crearUsuario({ password: PASS_PHARAFA })
            const token = await tokenUsuario({ _id: usuario._id })

            const res = await request(app)
                .put('/api/auth/password')
                .set('x-token', token)
                .send({ passwordActual: PASS_PHARAFA, passwordNueva: PASS_PHARAFA })

            expect(res.status).toBe(400)
        })

        it('cambio correcto responde 200 y permite el login posterior con la nueva contraseña', async () => {
            const email = `cambiopass_${Date.now()}@demo.com`
            const usuario = await crearUsuario({ email, password: PASS_PHARAFA })
            const token = await tokenUsuario({ _id: usuario._id })

            const res = await request(app)
                .put('/api/auth/password')
                .set('x-token', token)
                .send({ passwordActual: PASS_PHARAFA, passwordNueva: 'NuevaPassSegura1!' })

            expect(res.status).toBe(200)

            // Comprobamos que el login funciona con la nueva
            const login = await request(app)
                .post('/api/auth/login')
                .send({ email, password: 'NuevaPassSegura1!' })

            expect(login.status).toBe(200)
        })
    })

    describe('Rutas generales y errores', () => {
        it('GET /api/health responde 200 con { status: "ok" }', async () => {
            const res = await request(app).get('/api/health')
            expect(res.status).toBe(200)
            expect(res.body).toEqual({ status: 'ok' })
        })

        it('ruta inexistente responde 404 en formato JSON', async () => {
            const res = await request(app).get('/api/no-existe')
            expect(res.status).toBe(404)
            expect(res.body).toEqual({ error: 'Ruta no encontrada' })
        })

        it('body con JSON mal formado responde 400', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .set('Content-Type', 'application/json')
                .send('{"email": "invalido",}')

            expect(res.status).toBe(400)
            expect(res.body.error).toContain('JSON válido')
        })
    })
})
