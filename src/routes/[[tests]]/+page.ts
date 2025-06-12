import type { PageLoad } from "./$types";

import { liveQuery } from "dexie";
import { db } from "$lib/model/db";
import type { SpeedTester } from "$lib/model/speed-tester";
export const load: PageLoad = async ({ params }) => {

    let id: string = params.tests ?? "";

    // console.log("Page load, id",id)

    // add default setting
    if (id === "") {
        const tester = await db.speedTester
            .where('id')
            .equals("0")
            .first();
        if (!tester) {
            console.log("Default not exists. Create a new one.");
            const defaultTester : SpeedTester = {
                id: "0",
                name: "Default",
                keys: ["Z", "X"],
                type: "Times",
                amount: 10,
                createTime: new Date(),
                updateTime: new Date(),
                recordUpdateTime: new Date()
            };
            id = await db.speedTester.add(defaultTester);
            return {
                tester: defaultTester
            };
        } else
            return {
                tester: tester
            };
    }

    return {
        tester: await db.speedTester
            .where('id')
            .equals(id)
            .first()
    }
};