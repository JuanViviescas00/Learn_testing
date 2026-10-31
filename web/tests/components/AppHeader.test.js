import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AppHeader from '@/components/AppHeader.vue'
import { useAuth } from '@/composables/useAuth.js'

describe('components/AppHeader.vue', () => {
    beforeEach(() => {
        const { clearSession } = useAuth()
        clearSession()
        vi.restoreAllMocks()
    })

    it('muestra el nombre y las iniciales del usuario', () => {
        const { setUser } = useAuth()
        setUser({ nombre: 'Juan Perez', rol: 'usuario' })

        const wrapper = mount(AppHeader, {
            global: {
                stubs: ['RouterLink'],
            },
        })

        expect(wrapper.get('.avatar').text()).toBe('JP')
        expect(wrapper.get('[data-test="current-user-name"]').text()).toBe('Juan Perez')
        expect(wrapper.find('[data-test="nav-users"]').exists()).toBe(false)
    })

    it('muestra el enlace a Usuarios si el rol es admin', () => {
        const { setUser } = useAuth()
        setUser({ nombre: 'Admin User', rol: 'admin' })

        const wrapper = mount(AppHeader, {
            global: {
                stubs: ['RouterLink'],
            },
        })

        expect(wrapper.find('[data-test="nav-users"]').exists()).toBe(true)
    })
})
