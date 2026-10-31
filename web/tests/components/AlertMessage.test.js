import { describe, expect, it } from 'vitest'
import AlertMessage from '@/components/AlertMessage.vue'
import { mount } from '@vue/test-utils'

describe('component/AlertMessage', () => {
    it('No pinta nada el mensaje', () => {
        const wrapper = mount(AlertMessage, {
            props: {
                message: '',
            },
        })

        expect(wrapper.find('[data-test="alert"]').exists()).toBe(false)
    })

    it('Muestra el mensaje de error en el alertMessage', () => {
        const wrapper = mount(AlertMessage, {
            props: {
                message: 'Credenciales Invalidas',
            },
        })
        const alerta = wrapper.get('[data-test="alert"]')

        expect(alerta.text()).toBe('Credenciales Invalidas')
        expect(alerta.attributes('role')).toBe('alert')
    })

    it.each(['error', 'success', 'info'])('Aplica la clase del tipo %s', (type) => {
        const wrapper = mount(AlertMessage, {
            props: {
                message: 'x',
                type,
            },
        })

        expect(wrapper.get('[data-test="alert"]').classes()).toContain(`alert--${type}`)
    })
})
