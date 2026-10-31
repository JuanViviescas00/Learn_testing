import {afterEach, vi} from "vitest"

afterEach(() =>{
    localStorage.clear()
    vi.resetAllMocks()
    vi.unstubAllGlobals()
})