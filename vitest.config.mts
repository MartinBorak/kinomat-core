import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // One module graph for the run; the code keeps no module-level state, so the files can share it.
    isolate: false,
  },
})
