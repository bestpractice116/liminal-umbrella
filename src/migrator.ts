import './lib/setup.js';

import Database from './lib/database.js';
import {createEmitter} from './lib/typedEvents.js';
import {emitterSpec} from './lib/events.js';

async function main() {
  const events = createEmitter<emitterSpec>();
  const database = new Database(events);
  await database.getdb();
  database.umzug.runAsCLI();
}

main().then(() => console.log("DONE"));
