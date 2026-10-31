import { afterEach, describe, expect, it, vi } from "vitest";
import {emailExiste, esRolValido} from "../../helpers/db-validators.js"
import Usuario from "../../models/usuario.js"

describe("Test Helper db-validators", () => {
    describe("Si el Rol es valido", () => {
        it("acepta el rol admin", () => {
            expect(esRolValido("admin")).toBe(true)
        })

        it("acepta el rol usuario", () => {
            expect(esRolValido("usuario")).toBe(true)
        })

        it.each(["jefe", "ADMIN", "", undefined])("Rechaza el rol %j", (rol) => {
            expect(() => esRolValido(rol)).toThrow("El rol debe ser uno de: admin, usuario")
        })
    })

    describe("Existe email", () => {
        afterEach(() => {
            vi.restoreAllMocks()
        })

        it("No falla si no existe el email o no esta registrado",  async () => {
            vi.spyOn(Usuario, "findOne").mockResolvedValue(null)

            await expect(emailExiste("trtest@gmail.com")).resolves.toBeUndefined()
        })

        it("Creaacion y validacion de busqueda de usuario", async() => {
          const findOne = vi.spyOn(Usuario, "findOne").mockResolvedValue(null)

            await emailExiste("test@Test.Com")

            expect(findOne).toHaveBeenCalledWith({email: "test@test.com"})
        })

        it("Error si existe el email en la base de datos", async () => {
            vi.spyOn(Usuario, "findOne").mockResolvedValue({id: '123'})

            await expect(emailExiste("test@test.com")).rejects.toThrow("Ese email ya está registrado")
        })

        it("No lanza error si el email es del propio usuario", async () => {
            vi.spyOn(Usuario, "findOne").mockResolvedValue({id: '123'})
            await expect(emailExiste("test@test.com", "123")).resolves.toBeUndefined()
        })

    })
})