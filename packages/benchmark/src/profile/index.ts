import { Session } from 'node:inspector/promises';
import fs from 'node:fs';

const session = new Session();
session.connect();

const path = process.argv[process.argv.length - 1];
const { run, config = { repeat: 1_000_000 } } = await import(
  process.argv[process.argv.length - 1]
);

async function main() {
  await session.post('Profiler.enable');
  await session.post('Profiler.start');
  for (let i = 0; i < config.repeat; i++) {
    run();
  }

  const { profile } = await session.post('Profiler.stop');

  fs.writeFileSync(
    `./profiles/${path.replaceAll('/', '_').replace('._', '')}.cpuprofile`,
    JSON.stringify(profile),
  );
}

main();
