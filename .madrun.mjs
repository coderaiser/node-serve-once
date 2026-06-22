import {run} from 'madrun';

const env = {
    SUPERC8_RESPONSIVE: 1
};

export default {
    'test': () => 'tape test/*.js',
    'lint': () => 'putout .',
    'fresh:lint': () => run('lint', '--fresh'),
    'lint:fresh': () => run('lint', '--fresh'),
    'fix:lint': () => run('lint', '--fix'),
    'watch:test': () => run('watcher', '"npm test"'),
    'watcher': () => 'nodemon -w lib -w test -x',
    'coverage': () => [env, 'c8 npm test'],
    'report': () => 'c8 report --reporter=lcov',
};
