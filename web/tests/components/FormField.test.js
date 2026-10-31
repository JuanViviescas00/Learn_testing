import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import FormField from '@/components/FormField.vue'

describe('components/FormField', () => {
    it('Renderiza el label y asocia el id', () => {
        const wrapper = mount(FormField, {
            props: {
                label: 'Email',
                testId: 'email',
            },
        })

        const label = wrapper.get('label')
        const input = wrapper.get('[data-test="email"]')

        expect(label.text()).toBe('Email')
        expect(label.attributes('for')).toBe(input.attributes('id'))
    })

    it('Emite un update al escribir en el v-model', async () => {
        const wrapper = mount(FormField, {
            props: {
                label: 'Email',
                testId: 'email',
                modelValue: '',
            },
        })

        await wrapper.get('[data-test="email"]').setValue('test@test.com')

        expect(wrapper.emitted('update:modelValue')).toEqual([['test@test.com']])
    })

    it('Muestra la pista si solo hay error', () => {
        const wrapper = mount(FormField, {
            props: {
                label: 'Email',
                testId: 'email',
                error: 'El email es obligatorio',
            },
        })

        expect(wrapper.get('[data-test="email-error"]').text()).toBe('El email es obligatorio')
    })

    it('El botón Mostrar/Ocultar cambia el tipo del input de password a text', async () => {
        const wrapper = mount(FormField, {
            props: {
                label: 'Contraseña',
                type: 'password',
                testId: 'password',
            },
        })

        const input = wrapper.get('[data-test="password"]')
        const toggleBtn = wrapper.get('[data-test="password-toggle"]')

        expect(input.attributes('type')).toBe('password')

        await toggleBtn.trigger('click')
        expect(input.attributes('type')).toBe('text')

        await toggleBtn.trigger('click')
        expect(input.attributes('type')).toBe('password')
    })
})
