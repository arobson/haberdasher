import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['test/**/*.spec.ts'],
		exclude: ['spec/**/*', 'src/**/*.js', 'node_modules/**/*'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'lcov', 'html'],
			include: ['src/**/*.ts'],
			exclude: ['src/types.ts']
		},
		testTimeout: 10000
	}
});
