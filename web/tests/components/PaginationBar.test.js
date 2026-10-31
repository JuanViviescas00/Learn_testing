import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PaginationBar from '@/components/PaginationBar.vue'

describe('components/PaginationBar.vue', () => {
    it('muestra el texto de información de paginación correctamente', () => {
        const wrapper = mount(PaginationBar, {
            props: { page: 1, totalPages: 3, total: 20, limit: 8 },
        })

        const info = wrapper.get('[data-test="pagination-info"]')
        expect(info.text()).toContain('Mostrando 1–8 de 20')
    })

    it('en la página 1 deshabilita Anterior y emite change al dar Siguiente', async () => {
        const wrapper = mount(PaginationBar, {
            props: { page: 1, totalPages: 3, total: 20, limit: 8 },
        })

        const prevBtn = wrapper.get('[data-test="pagination-prev"]')
        const nextBtn = wrapper.get('[data-test="pagination-next"]')

        expect(prevBtn.attributes('disabled')).toBeDefined()
        expect(nextBtn.attributes('disabled')).toBeUndefined()

        await nextBtn.trigger('click')

        expect(wrapper.emitted('change')).toBeTruthy()
        expect(wrapper.emitted('change')[0]).toEqual([2])
    })

    it('en la última página deshabilita Siguiente y emite change al dar Anterior', async () => {
        const wrapper = mount(PaginationBar, {
            props: { page: 3, totalPages: 3, total: 20, limit: 8 },
        })

        const prevBtn = wrapper.get('[data-test="pagination-prev"]')
        const nextBtn = wrapper.get('[data-test="pagination-next"]')

        expect(nextBtn.attributes('disabled')).toBeDefined()
        expect(prevBtn.attributes('disabled')).toBeUndefined()

        await prevBtn.trigger('click')

        expect(wrapper.emitted('change')).toBeTruthy()
        expect(wrapper.emitted('change')[0]).toEqual([2])
    })
})
