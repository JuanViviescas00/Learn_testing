import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

describe('components/ConfirmDialog.vue', () => {
    let wrapper

    afterEach(() => {
        if (wrapper) wrapper.unmount()
        document.body.innerHTML = ''
    })

    it('no renderiza nada si open es false', () => {
        wrapper = mount(ConfirmDialog, {
            props: { open: false },
            attachTo: document.body,
        })

        expect(document.body.querySelector('[data-test="confirm-dialog"]')).toBeNull()
    })

    it('renderiza el título y mensaje si open es true', () => {
        wrapper = mount(ConfirmDialog, {
            props: {
                open: true,
                title: 'Eliminar usuario',
                message: '¿Estás seguro de eliminar este usuario?',
            },
            attachTo: document.body,
        })

        const title = document.body.querySelector('#dialog-title')
        const message = document.body.querySelector('#dialog-message')

        expect(title.textContent).toBe('Eliminar usuario')
        expect(message.textContent).toBe('¿Estás seguro de eliminar este usuario?')
    })

    it('emite el evento cancel al hacer clic en Cancelar', async () => {
        wrapper = mount(ConfirmDialog, {
            props: { open: true },
            attachTo: document.body,
        })

        const cancelBtn = document.body.querySelector('[data-test="confirm-cancel"]')
        cancelBtn.click()

        expect(wrapper.emitted('cancel')).toBeTruthy()
    })

    it('emite el evento confirm al hacer clic en Confirmar', async () => {
        wrapper = mount(ConfirmDialog, {
            props: { open: true },
            attachTo: document.body,
        })

        const acceptBtn = document.body.querySelector('[data-test="confirm-accept"]')
        acceptBtn.click()

        expect(wrapper.emitted('confirm')).toBeTruthy()
    })

    it('deshabilita los botones si loading es true', () => {
        wrapper = mount(ConfirmDialog, {
            props: { open: true, loading: true },
            attachTo: document.body,
        })

        const cancelBtn = document.body.querySelector('[data-test="confirm-cancel"]')
        const acceptBtn = document.body.querySelector('[data-test="confirm-accept"]')

        expect(cancelBtn.hasAttribute('disabled')).toBe(true)
        expect(acceptBtn.hasAttribute('disabled')).toBe(true)
    })
})
