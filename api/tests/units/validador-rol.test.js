import { beforeEach, describe, expect, it, vi } from 'vitest'
import { validarRol } from '../../middlewares/validar-rol.js'

const crearRes = () => {
    const res = () => {}
    res.status = vi.fn().mockReturnValue(res)
    res.json = vi.fn().mockReturnValue(res)
    return res
}

describe('tests/units/validador-rol.test.js', () => {
    let res
    let next

    beforeEach(() => {
        res = crearRes()
        next = vi.fn()
    })

    it('responde 500 si no existe req.usuario (no pasó por validarJWT)', () => {
        const req = {}
        validarRol('admin')(req, res, next)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(next).not.toHaveBeenCalled()
    })

    it('responde 403 si el rol no está permitido', () => {
        const req = {
            usuario: {
                rol: 'usuario',
            },
        }
        validarRol('admin')(req, res, next)

        expect(res.status).toHaveBeenCalledWith(403)
        expect(next).not.toHaveBeenCalled()
    })

    it('llama a next() si el rol está permitido', () => {
        const req = {
            usuario: {
                rol: 'admin',
            },
        }
        validarRol('admin')(req, res, next)

        expect(next).toHaveBeenCalled()
        expect(res.status).not.toHaveBeenCalled()
    })
})
