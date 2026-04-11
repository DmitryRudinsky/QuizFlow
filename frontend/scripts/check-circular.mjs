import madge from 'madge';

const result = await madge('src/', {
    fileExtensions: ['ts', 'tsx'],
    tsConfig: 'tsconfig.json',
    includeNpm: false,
    detectiveOptions: {
        ts: { skipTypeImports: true },
        tsx: { skipTypeImports: true },
    },
    dependencyFilter: (dep) => !dep.endsWith('.scss') && !dep.endsWith('.css'),
});

const circular = result.circular();

if (circular.length > 0) {
    console.error('Found circular dependencies:');
    circular.forEach((cycle, i) => {
        console.error(`  ${i + 1}) ${cycle.join(' > ')}`);
    });
    process.exit(1);
}

console.log(`✔ No circular dependency found! (${Object.keys(result.obj()).length} files)`);
