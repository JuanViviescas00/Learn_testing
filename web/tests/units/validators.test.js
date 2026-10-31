import { describe, expect, it } from 'vitest'
import {
    isValid,
    validateEmail,
    validateName,
    validatePassword,
    validatePasswordConfirmation,
} from '@/utils/validators.js'

describe('tests/units/validators.js', () => {
    describe('validateName', () => {
        it('falla si está vacío', () => {
            expect(validateName('')).toBe('El nombre es obligatorio')
            expect(validateName('   ')).toBe('El nombre es obligatorio')
        })

        it('falla si tiene menos de 2 o más de 60 caracteres', () => {
            expect(validateName('A')).toBe('El nombre debe tener entre 2 y 60 caracteres')
            expect(validateName('A'.repeat(61))).toBe('El nombre debe tener entre 2 y 60 caracteres')
        })

        it('pasa con un nombre válido', () => {
            expect(validateName('Juan Perez')).toBe('')
        })
    })

    describe('validateEmail', () => {
        it('falla si está vacío', () => {
            expect(validateEmail('')).toBe('El email es obligatorio')
            expect(validateEmail('   ')).toBe('El email es obligatorio')
        })

        it('falla con un formato de email inválido', () => {
            expect(validateEmail('invalido')).toBe('El email no tiene un formato válido')
            expect(validateEmail('sin_arroba.com')).toBe('El email no tiene un formato válido')
            expect(validateEmail('correo@')).toBe('El email no tiene un formato válido')
        })

        it('pasa con un email válido', () => {
            expect(validateEmail('test@demo.com')).toBe('')
        })
    })

    describe('validatePassword', () => {
        it('falla si está vacía', () => {
            expect(validatePassword('')).toBe('La contraseña es obligatoria')
        })

        it('falla si tiene menos de 8 o más de 64 caracteres', () => {
            expect(validatePassword('Abc1')).toBe('La contraseña debe tener entre 8 y 64 caracteres')
        })

        it('falla si no tiene mayúscula', () => {
            expect(validatePassword('password123')).toBe('La contraseña debe incluir al menos una mayúscula')
        })

        it('falla si no tiene minúscula', () => {
            expect(validatePassword('PASSWORD123')).toBe('La contraseña debe incluir al menos una minúscula')
        })

        it('falla si no tiene número', () => {
            expect(validatePassword('PasswordSinNumero')).toBe('La contraseña debe incluir al menos un número')
        })

        it('pasa con una contraseña que cumple todas las reglas', () => {
            expect(validatePassword('Password123!')).toBe('')
        })
    })

    describe('validatePasswordConfirmation', () => {
        it('falla si la confirmación está vacía', () => {
            expect(validatePasswordConfirmation('Password123!', '')).toBe('Repite la contraseña')
        })

        it('falla si no coincide', () => {
            expect(validatePasswordConfirmation('Password123!', 'OtraPassword')).toBe('Las contraseñas no coinciden')
        })

        it('pasa si coinciden', () => {
            expect(validatePasswordConfirmation('Password123!', 'Password123!')).toBe('')
        })
    })

    describe('isValid', () => {
        it('devuelve true si todos los errores están vacíos', () => {
            expect(isValid({ name: '', email: '', password: '' })).toBe(true)
        })

        it('devuelve false si algún campo tiene error', () => {
            expect(isValid({ name: '', email: 'Email inválido', password: '' })).toBe(false)
        })
    })
})
