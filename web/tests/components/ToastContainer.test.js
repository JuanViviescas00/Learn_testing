import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ToastContainer from '@/components/ToastContainer.vue'
import { useToast } from '@/composables/useToast.js'

describe('components/ToastContainer.vue', () => {
    it('renderiza la lista de toasts y permite cerrarlos', async () => {
        const { success } = useToast()
        success('Mensaje 1')

        const wrapper = mount(ToastContainer)

        const toast = wrapper.get('[data-test="toast"]')
        expect(toast.text()).toContain('Mensaje 1')

        const closeBtn = wrapper.get('.toast__close')
        await closeBtn.trigger('click')

        expect(wrapper.find('[data-test="toast"]').exists()).toBe(false)
    })
})
