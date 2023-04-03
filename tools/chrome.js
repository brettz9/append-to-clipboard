import {readFile, writeFile} from 'fs/promises';

const manifestPath = './manifest.json';

const file = await readFile(manifestPath);

const manifest = JSON.parse(file);

manifest.background.service_worker = manifest.background.scripts[0];
delete manifest.background.scripts;

const manifestString = JSON.stringify(manifest, null, 2) + '\n';

await writeFile(manifestPath, manifestString);
