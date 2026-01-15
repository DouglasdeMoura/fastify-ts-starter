import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Required for @fastify/autoload to work in tests
    server: {
      deps: {
        inline: ['@fastify/autoload'],
      },
    },

    // Coverage configuration
    coverage: {
      // Use v8 for faster coverage collection (native Node.js support)
      provider: 'v8',

      // Generate multiple report formats
      reporter: ['text', 'json', 'html'],

      // Output directory for coverage reports
      reportsDirectory: './coverage',

      // Include source files in coverage
      include: ['src/**/*.ts'],

      // Exclude non-application code from coverage
      exclude: [
        'src/index.ts', // Entry point - minimal testable logic
        'src/config/healthcheck.ts', // Standalone script
        '**/*.d.ts', // Type definitions
        '**/*.test.ts', // Test files themselves
      ],

      // Coverage thresholds - fail CI if below these values
      // Start conservative and increase as coverage improves
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },
  },
})
