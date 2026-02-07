import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ['**/*.js'],
		...tseslint.configs.disableTypeChecked
	},
	{
		ignores: [
			'dist/',
			'coverage/',
			'.vitest/',
			'node_modules/',
			'spec/',
			'src/**/*.js'
		]
	}
);
