module.exports = {
  ignorePatterns: [],

  overrides: [
    {
      files: '*.json',
      plugins: ['json-format'],

      settings: {
        'json/json-with-comments-files': [],
      },
    },
    {
      files: '*.js',

      extends: [
        'airbnb-base',
      ],

      env: {
        commonjs: true,
      },
    },
    {
      files: '*.ts',

      parserOptions: { project: './tsconfig.json' },

      extends: [
        'airbnb-typescript-prettier',
        'plugin:eslint-comments/recommended',
      ],
      plugins: [
        'eslint-comments',
      ],

      rules: {
        '@typescript-eslint/no-unused-vars': ['error', {
          argsIgnorePattern: '^_|^\\$$',
        }],
        'no-underscore-dangle': 'off',
        'import/prefer-deafult-export': 'off',
        'no-console': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'error',
        '@typescript-eslint/no-floating-promises': 'error',
        'no-void': ['error', { allowAsStatement: true }],
        '@typescript-eslint/no-implicit-any-catch': 'error',
        'global-require': 'off',
        'eslint-comments/no-unused-disable': 'error',
        '@typescript-eslint/no-unnecessary-condition': ['error', {
          allowConstantLoopConditions: true,
        }],
        '@typescript-eslint/no-unsafe-return': 'error',
        'import/prefer-default-export': 'off',
      },
    },
  ],
};
