import { generarJWT } from '../../helpers/generar-jwt.js'
import Usuario from '../../models/usuario.js'

export const PASS_PHARAFA = 'Clave123!'
export const PASSWORD_TEST = 'Admin123!'
let contador = 0

export const crearUsuario = async (datos = {}) => {
    contador += 1
    const usuario = new Usuario({
        nombre: `Test Usuario ${contador}`,
        email: `test_${contador}_${Date.now()}_${Math.random()}@gmail.com`,
        password: PASS_PHARAFA,
        rol: 'usuario',
        ...datos,
    })

    await usuario.save()
    return usuario
}

export const crearUsusario = crearUsuario

export const crearAdmin = async (datos = {}) => {
    return crearUsuario({
        ...datos,
        rol: 'admin',
    })
}

export const crearSesion = async (datos = {}) => {
    const usuario = await crearUsuario(datos)
    return { usuario, token: generarJWT(usuario) }
}

export const tokenUsuario = async (datos = {}) => {
    if (datos._id || datos.id) {
        return generarJWT({ id: datos.id || datos._id, rol: datos.rol || 'usuario' })
    }
    const usuario = await crearUsuario({ rol: 'usuario', ...datos })
    return generarJWT(usuario)
}

export const tokenAdmin = async (datos = {}) => {
    if (datos._id || datos.id) {
        return generarJWT({ id: datos.id || datos._id, rol: 'admin' })
    }
    const admin = await crearAdmin(datos)
    return generarJWT(admin)
}
