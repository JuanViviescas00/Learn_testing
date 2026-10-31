import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import app from '../../app.js'
import Usuario from '../../models/usuario.js'
import { crearAdmin, crearUsuario, PASS_PHARAFA, tokenAdmin, tokenUsuario } from '../helpers/fabrica.js'

// Evitamos que app.js conecte a la BD real o abra el puerto 3000 durante los tests
vi.mock('../../database/config.js', () => ({
    dbConnection: vi.fn().mockReturnValue(new Promise(() => {})),
}))

describe('tests/integration/usuarios.test.js - CRUD de Usuarios (/api/usuarios)', () => {
    describe('GET /api/usuarios', () => {
        it('sin token responde 401', async () => {
            const res = await request(app).get('/api/usuarios')
            expect(res.status).toBe(401)
        })

        it('con token de rol usuario responde 403', async () => {
            const token = await tokenUsuario()
            const res = await request(app).get('/api/usuarios').set('x-token', token)

            expect(res.status).toBe(403)
            expect(res.body.error).toBe('No tiene permisos para esto')
        })

        it('con token de admin responde 200 con total, pagina, limite, totalPaginas y lista de activos', async () => {
            const token = await tokenAdmin()
            await crearUsuario({ nombre: 'Usuario Uno', estado: true })

            const res = await request(app).get('/api/usuarios').set('x-token', token)

            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty('total')
            expect(res.body).toHaveProperty('pagina')
            expect(res.body).toHaveProperty('limite')
            expect(res.body).toHaveProperty('totalPaginas')
            expect(Array.isArray(res.body.usuarios)).toBe(true)
        })

        it('con límite fuera de rango (ej. 51) responde 400', async () => {
            const token = await tokenAdmin()
            const res = await request(app).get('/api/usuarios?limite=51').set('x-token', token)

            expect(res.status).toBe(400)
        })

        it('búsqueda por nombre o email combinada con filtro de rol responde 200', async () => {
            const token = await tokenAdmin()
            await crearUsuario({ nombre: 'Ana Gomez', email: 'ana_gomez@demo.com', rol: 'usuario' })

            const res = await request(app)
                .get('/api/usuarios?buscar=ana&rol=usuario')
                .set('x-token', token)

            expect(res.status).toBe(200)
            expect(res.body.usuarios.some((u) => u.nombre.toLowerCase().includes('ana'))).toBe(true)
        })
    })

    describe('GET /api/usuarios/:id', () => {
        it('con id mal formado responde 400', async () => {
            const token = await tokenAdmin()
            const res = await request(app).get('/api/usuarios/id-invalido-123').set('x-token', token)

            expect(res.status).toBe(400)
        })

        it('con id válido pero inexistente responde 404', async () => {
            const token = await tokenAdmin()
            const res = await request(app)
                .get('/api/usuarios/507f1f77bcf86cd799439011')
                .set('x-token', token)

            expect(res.status).toBe(404)
        })
    })

    describe('POST /api/usuarios', () => {
        it('admin crea usuario: la contraseña queda hasheada en la base de datos', async () => {
            const token = await tokenAdmin()
            const email = `creado_admin_${Date.now()}@demo.com`

            const res = await request(app)
                .post('/api/usuarios')
                .set('x-token', token)
                .send({
                    nombre: 'Usuario Creado',
                    email,
                    password: 'Password123!',
                    rol: 'usuario',
                })

            expect(res.status).toBe(201)
            expect(res.body).not.toHaveProperty('password')

            // Verificamos directamente en la BD que la contraseña esté hasheada
            const usuarioBD = await Usuario.findOne({ email })
            expect(usuarioBD.password).not.toBe('Password123!')
            expect(usuarioBD.password).toMatch(/^\$2[aby]\$/)
        })
    })

    describe('PUT /api/usuarios/:id', () => {
        it('admin intenta cambiar su propio rol responde 400', async () => {
            const admin = await crearAdmin()
            const token = await tokenAdmin({ _id: admin._id })

            const res = await request(app)
                .put(`/api/usuarios/${admin.id}`)
                .set('x-token', token)
                .send({ rol: 'usuario' })

            expect(res.status).toBe(400)
            expect(res.body.error).toContain('No puedes cambiar tu propio rol')
        })

        it('password vacía: no se modifica y el login sigue funcionando', async () => {
            const token = await tokenAdmin()
            const email = `passvacia_${Date.now()}@demo.com`
            const usuario = await crearUsuario({ email, password: PASS_PHARAFA })

            const res = await request(app)
                .put(`/api/usuarios/${usuario.id}`)
                .set('x-token', token)
                .send({ nombre: 'Nombre Editado', password: '' })

            expect(res.status).toBe(200)

            // Comprobamos que el login sigue funcionando con su contraseña original
            const login = await request(app)
                .post('/api/auth/login')
                .send({ email, password: PASS_PHARAFA })

            expect(login.status).toBe(200)
        })
    })

    describe('DELETE /api/usuarios/:id', () => {
        it('admin intenta eliminarse a sí mismo responde 400', async () => {
            const admin = await crearAdmin()
            const token = await tokenAdmin({ _id: admin._id })

            const res = await request(app)
                .delete(`/api/usuarios/${admin.id}`)
                .set('x-token', token)

            expect(res.status).toBe(400)
            expect(res.body.error).toContain('No puedes eliminar tu propia cuenta')
        })

        it('borrado lógico: responde 200, deja de aparecer en listado y no puede iniciar sesión', async () => {
            const token = await tokenAdmin()
            const email = `borrado_${Date.now()}@demo.com`
            const usuario = await crearUsuario({ email, password: PASS_PHARAFA })

            const res = await request(app)
                .delete(`/api/usuarios/${usuario.id}`)
                .set('x-token', token)

            expect(res.status).toBe(200)

            // Ya no debe aparecer en el listado de activos
            const listado = await request(app).get('/api/usuarios').set('x-token', token)
            expect(listado.body.usuarios.some((u) => u.uid === usuario.id)).toBe(false)

            // Ya no puede iniciar sesión
            const login = await request(app)
                .post('/api/auth/login')
                .send({ email, password: PASS_PHARAFA })

            expect(login.status).toBe(401)
        })
    })
})
