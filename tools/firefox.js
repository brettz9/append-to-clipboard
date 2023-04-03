import {readFile, writeFile} from 'fs/promises';

const manifestPath = './manifest.json';

const file = await readFile(manifestPath);

const manifest = JSON.parse(file);

manifest.background.scripts = [manifest.background.service_worker];
delete manifest.background.service_worker;

const manifestString = JSON.stringify(manifest, null, 2) + '\n';

await writeFile(manifestPath, manifestString);
