import jwt from 'jsonwebtoken'
import { describe, expect, it } from 'vitest'
import { generarJWT } from '../../helpers/generar-jwt.js'

describe('tests/units/generar-jwt.test.js', () => {
    it('genera un token JWT válido que contiene uid y rol en el payload', () => {
        const usuarioFalso = {
            id: '60d0fe4f5311236168a109ca',
            rol: 'admin',
        }

        const token = generarJWT(usuarioFalso)
        expect(typeof token).toBe('string')
        expect(token.length).toBeGreaterThan(10)

        // Decodificamos el token con el secreto del entorno de prueba
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        expect(decoded.uid).toBe(usuarioFalso.id)
        expect(decoded.rol).toBe('admin')
    })
})
