import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        environment: 'node',
        include: ['tests/**/*.test.js'],
        env: {
            NODE_ENV: 'test',
            JWT_SECRET: 'secreto',
            JWT_EXPIRA: '1h',
        },
        setupFiles: ['tests/helpers/setup-db.js'],
        hookTimeout: 60_000,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'json-summary'],
            include: ['controllers/**', 'helpers/**', 'routes/**', 'models/**', 'middlewares/**'],
            thresholds: {
                lines: 80,
                functions: 80,
                statements: 80,
                branches: 70,
            },
        },
    },
})
