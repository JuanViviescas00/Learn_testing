import { describe, expect, it } from 'vitest'
import Usuario from '../../models/usuario.js'

describe('tests/units/modelo.test.js - Modelo Usuario', () => {
    it('toJSON no devuelve password ni _id ni __v, y devuelve uid', () => {
        const usuario = new Usuario({
            nombre: 'Juan Perez',
            email: 'juan@demo.com',
            password: 'Password123!',
            rol: 'usuario',
        })

        const json = usuario.toJSON()

        expect(json).toHaveProperty('uid')
        expect(json).not.toHaveProperty('password')
        expect(json).not.toHaveProperty('_id')
        expect(json).not.toHaveProperty('__v')
    })

    it('hashea la contraseña antes de guardar con bcrypt (pre save)', async () => {
        const usuario = new Usuario({
            nombre: 'Carlos Test',
            email: `carlos_${Date.now()}@demo.com`,
            password: 'Password123!',
            rol: 'usuario',
        })

        await usuario.save()

        expect(usuario.password).not.toBe('Password123!')
        expect(usuario.password).toMatch(/^\$2[aby]\$/) // Formato bcrypt
    })

    it('validarPassword compara contraseñas correctamente', async () => {
        const usuario = new Usuario({
            nombre: 'Ana Test',
            email: `ana_${Date.now()}@demo.com`,
            password: 'MiPasswordSegura1!',
            rol: 'usuario',
        })

        await usuario.save()

        const coincide = await usuario.validarPassword('MiPasswordSegura1!')
        const noCoincide = await usuario.validarPassword('ClaveErronea1!')

        expect(coincide).toBe(true)
        expect(noCoincide).toBe(false)
    })
})
