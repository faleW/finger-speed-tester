// db.ts
import Dexie, { type EntityTable } from 'dexie';
import type { SpeedTester, SpeedTesterRecord } from './speed-tester';

const db = new Dexie('SpeedTesterDatabase') as Dexie & {
    speedTester: EntityTable<
        SpeedTester,
        'id'
    >,
    speedTesterRecord: EntityTable<
        SpeedTesterRecord,
        'recordId'
    >
    ;
};

// Schema declaration:
db.version(1).stores({
    speedTester: '++id, name, keys, type, amount', // primary key "id" (for the runtime!),
    speedTesterRecord: '++recordId, testerId, createdTime, keys, type, amount, periodTime, numberOfHits, bpm, unstableRate'
});

export { db };