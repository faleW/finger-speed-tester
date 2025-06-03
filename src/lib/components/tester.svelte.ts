import { Previous } from "runed";
import { linear } from "svelte/easing";
import type { BpmTime } from "./ui/bpm-time-line-chart";

export class ClickableKeyInput {
    key: string = $state("");
    count: number = $state(0)
    previous = new Previous(() => this.key);
    constructor(key: string) {
        this.key = key;
    }
}

export class TestRule {
    type: "Times" | "Clicks" = $state("Times");
    amount: number = $state(10);
}

export type HitRecord = {
    key: string;
    time: number; // milliseconds since start
    bpm: number;
};

export class Tester {
    testing: boolean = $state(false);
    isRunning = $state(false);
    hitCount: number = $state(0);
    keys: ClickableKeyInput[] = $state([]);
    records: HitRecord[] = $state([]);
    rule: TestRule;
    bpm: string = $state("0");
    currTime: string = $state("0");
    bpmTimes: BpmTime[] = $state([]);
    private startTime: number = 0;
    private timesTimerId?: number;
    private gameTimerId?: number;

    constructor() {
        this.keys.push(new ClickableKeyInput("Z"));
        this.keys.push(new ClickableKeyInput("C"));
        this.rule = new TestRule();
    }

    initTest() {
        this.keys.forEach(input => input.count = 0)
        this.testing = true;
        this.hitCount = 0;
        this.currTime = "0";
        this.records = [];
    }

    startTest() {
        this.records = [];
        this.bpmTimes = [];
        this.isRunning = true;
        this.startTime = Date.now();
        if (this.rule.type === "Times") 
            this.timesTimerId = window.setTimeout(() => this.finishTest(), this.rule.amount * 1000);

        this.gameTimerId = window.setInterval(() => this.updateGameState(), 200)
    }

    updateGameState() {
        //Bpm
        const elapsedSeconds = (Date.now() - this.startTime) / 1000;
        if (elapsedSeconds === 0) return;
        const bpm = ((this.hitCount / elapsedSeconds) * 60 / 4);

        this.bpmTimes.push({
            bpm: bpm,
            time: elapsedSeconds
        })

        this.bpm = bpm.toFixed(0);
        this.currTime = elapsedSeconds.toFixed(2);
    }

    finishTest() {
        if (!this.isRunning) return;
        if (this.rule.type === "Times")
            clearTimeout(this.timesTimerId);
        clearInterval(this.gameTimerId);
        console.log("data", this.bpmTimes)
        this.isRunning = false;
        this.testing = false;
        this.updateGameState();
    }

    breakTest() {
        this.testing = false;
        if(this.isRunning){

            if (this.rule.type === "Times")
                clearTimeout(this.timesTimerId);
            clearInterval(this.gameTimerId);
            this.isRunning = false;
        }
    }

    updateKey(index: number, event: Event & { currentTarget: EventTarget & HTMLInputElement }): any {
        if (!event) return;
        // @ts-ignore
        if (!event.data) return;
        // @ts-ignore
        const newKey: string = (event.data as string).toUpperCase();
        if (this.keys.some(input => input.key === newKey))
            this.keys[index].key = this.keys[index].previous.current ?? "";
        else
            this.keys[index].key = newKey;
    }

    handleKeyDown(key: string) {
        key = key.toUpperCase();
        if (!this.testing) {

            if (key === ' ') {
                this.initTest();
            }
            return;
        }
        if (key === 'ESCAPE') this.breakTest();

        this.updateKeyCount(key);

    }
    async updateKeyCount(key: string) {
        const keyToUpdate = this.keys.find((input) => input.key === key);

        if (keyToUpdate) {
            if (!this.isRunning) this.startTest();
            keyToUpdate.count++;
            this.hitCount++;
            const elapsedSeconds = (Date.now() - this.startTime) / 1000;
            this.records.push({
                key: key,
                time: elapsedSeconds,
                bpm: (elapsedSeconds == 0) ? 0 : this.hitCount / elapsedSeconds * 60 / 4
            });
            if (this.rule.type === "Clicks" && this.hitCount === this.rule.amount) this.finishTest();
            this.updateGameState()
        }
    }
}