module.exports = {
    'extends': ['@commitlint/config-conventional'],
    'defaultIgnores': false,
    'rules': {
        'type-enum': [2, 'always', [
            'feat',
            'fix',
            'add',
            'test',
            'refactor',
            'perf',
            'style',
            'config',
            'merge'
        ]],
        'scope-enum': [2, 'always', [
            'connection',
            'command',
            'client',
            'pipeline',
            'subscriber',
            'lint',
            'docs',
            'deps',
            'branch',
            'global'
        ]],
        'scope-empty': [2, 'never'],
        'subject-case': [2, 'always', 'lowerCase'],
        'subject-min-length': [2, 'always', 5],
        'subject-max-length': [2, 'always', 50],
    }
};
