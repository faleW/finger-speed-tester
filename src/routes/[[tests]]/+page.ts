import type { PageLoad } from "./$types";

import { liveQuery } from "dexie";
import { db } from "$lib/model/db";
export const load: PageLoad = async ({ params }) => {
    
    let id: number = Number(params.tests);
    if(isNaN(id)) id = 0;

    // console.log("Page load, id",id)
    
    // add default setting
    if (id === 0) {
        const tester = await db.speedTester
            .where('id')
            .equals(0)
            .first();
        if (!tester) {
            await db.speedTester.add({
                id: 0,
                name: "Default",
                keys: ["Z", "X"],
                type: "Times",
                amount: 10
            })
        }
    }
    
    return {
        tester: await db.speedTester
            .where('id')
            .equals(id)
            .first()
    }
};