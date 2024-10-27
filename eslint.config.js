// eslint.config.js
const LitertEslintRules = require('@litert/eslint-plugin-rules');

module.exports = [
    ...LitertEslintRules.configs.typescript,
    {
        plugins: {
            '@litert/rules': require('@litert/eslint-plugin-rules'),
        },
        files: [
            'src/lib/**/*.ts',
        ],
        languageOptions: {
            parserOptions: {
                project: 'tsconfig.json',
                tsconfigRootDir: __dirname,
            },
        }
    }
];
