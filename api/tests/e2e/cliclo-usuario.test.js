// import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import app from '../../app.js'
import { crearAdmin } from '../helpers/fabrica.js'

// Evitamos que app.js abra el puerto 3000 físico durante la prueba
vi.mock('../../database/config.js', () => ({
    dbConnection: vi.fn().mockReturnValue(new Promise(() => {})),
}))

describe('tests/e2e/ciclo-usuario.test.js - Flujo E2E de la API', () => {
    it('Flujo completo: Registro -> Login -> Consultar Perfil -> Cambiar Contraseña -> Borrado por Admin -> Intento de Login', async () => {
        const datosUsuario = {
            nombre: 'Carlos E2E',
            email: `e2e_${Date.now()}@demo.com`,
            passwordOriginal: 'Password123!',
            passwordNueva: 'NuevaPassword456!',
        }

        // PASO 1: Registro del usuario
        const regRes = await request(app)
            .post('/api/auth/registro')
            .send({
                nombre: datosUsuario.nombre,
                email: datosUsuario.email,
                password: datosUsuario.passwordOriginal,
            })

        expect(regRes.status).toBe(201)
        expect(regRes.body.usuario.email).toBe(datosUsuario.email)
        const usuarioId = regRes.body.usuario.uid
// 
        // PASO 2: Login con credenciales recién creadas
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: datosUsuario.email,
                password: datosUsuario.passwordOriginal,
            })

        expect(loginRes.status).toBe(200)
        expect(loginRes.body).toHaveProperty('token')
        const userToken = loginRes.body.token

        // PASO 3: Consultar perfil usando el token obtenido
        const perfilRes = await request(app)
            .get('/api/auth/perfil')
            .set('x-token', userToken)

        expect(perfilRes.status).toBe(200)
        expect(perfilRes.body.nombre).toBe(datosUsuario.nombre)

        // PASO 4: Cambiar contraseña
        const passRes = await request(app)
            .put('/api/auth/password')
            .set('x-token', userToken)
            .send({
                passwordActual: datosUsuario.passwordOriginal,
                passwordNueva: datosUsuario.passwordNueva,
            })

        expect(passRes.status).toBe(200)

        // PASO 5: Iniciar sesión con la contraseña NUEVA
        const reloginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: datosUsuario.email,
                password: datosUsuario.passwordNueva,
            })

        expect(reloginRes.status).toBe(200)

        // PASO 6: Un Admin inicia sesión y elimina al usuario
        const admin = await crearAdmin({ email: `admin_e2e_${Date.now()}@demo.com` })
        const adminLogin = await request(app)
            .post('/api/auth/login')
            .send({
                email: admin.email,
                password: 'Clave123!',
            })

        const adminToken = adminLogin.body.token

        const deleteRes = await request(app)
            .delete(`/api/usuarios/${usuarioId}`)
            .set('x-token', adminToken)

        expect(deleteRes.status).toBe(200)

        // PASO 7: El usuario intenta entrar y la API lo rechaza
        const intentoFallido = await request(app)
            .post('/api/auth/login')
            .send({
                email: datosUsuario.email,
                password: datosUsuario.passwordNueva,
            })

        expect(intentoFallido.status).toBe(401)
        expect(intentoFallido.body.error).toBe('Usuario desactivado')
    })
})