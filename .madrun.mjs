import {run} from 'madrun';

export default {
    'test': () => 'tape test/*.js',
    'lint': () => 'putout .',
    'fresh:lint': () => run('lint', '--fresh'),
    'lint:fresh': () => run('lint', '--fresh'),
    'fix:lint': () => run('lint', '--fix'),
    'watch:test': () => run('watcher', '"npm test"'),
    'watcher': () => 'nodemon -w lib -w test -x',
    'coverage': () => 'c8 npm test',
    'report': () => 'c8 report --reporter=lcov',
};
