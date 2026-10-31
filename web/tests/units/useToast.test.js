import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useToast } from '@/composables/useToast.js'

describe('tests/units/useToast.js', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('agrega un toast de éxito y lo elimina al pasar el tiempo', () => {
        const { toasts, success, dismiss } = useToast()

        const id = success('Operación exitosa')
        expect(toasts.some((t) => t.id === id && t.type === 'success')).toBe(true)

        // Avanzamos el temporizador 3500ms
        vi.advanceTimersByTime(3500)
        expect(toasts.some((t) => t.id === id)).toBe(false)
    })

    it('agrega un toast de error con duración mayor (5000ms)', () => {
        const { toasts, error } = useToast()

        const id = error('Ha ocurrido un error')
        expect(toasts.some((t) => t.id === id && t.type === 'error')).toBe(true)

        // A los 3500ms aún debe existir
        vi.advanceTimersByTime(3500)
        expect(toasts.some((t) => t.id === id)).toBe(true)

        // A los 5000ms se debe eliminar
        vi.advanceTimersByTime(1500)
        expect(toasts.some((t) => t.id === id)).toBe(false)
    })

    it('dismiss elimina el toast manualmente antes del tiempo', () => {
        const { toasts, success, dismiss } = useToast()

        const id = success('Toast temporal')
        expect(toasts.some((t) => t.id === id)).toBe(true)

        dismiss(id)
        expect(toasts.some((t) => t.id === id)).toBe(false)
    })
})
