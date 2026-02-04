import { Previous, watch } from "runed";
import { linear } from "svelte/easing";
import type { BpmTime } from "./ui/bpm-time-line-chart";
import type { HitType, SpeedTester } from "$lib/model/speed-tester";
import { db } from "$lib/model/db";
import { Sound } from "svelte-sound";
import { base } from '$app/paths';
import { GlobalSetting } from "$lib/commands.svelte";
export class ClickableKeyInput {
    key: string = $state("");
    count: number = $state(0)
    previous = new Previous(() => this.key);
    constructor(key: string) {
        this.key = key;
    }
}

export class TestRule {
    type: HitType = $state("Times");
    amount: number = $state(10);

    constructor(type: HitType, amount: number) {
        this.type = type;
        this.amount = amount;
    }
}

export type HitRecord = {
    key: string;
    time: number; // milliseconds since start
    bpm: number;
};

type ReactiveSaveType = "Rule" | "Keys";

export class Tester {
    id: string;
    name: string;
    testing: boolean = $state(false);
    isRunning = $state(false);
    hitCount: number = $state(0);
    keys: ClickableKeyInput[] = $state([]);
    records: HitRecord[] = $state([]);
    rule: TestRule;
    bpm: string = $state("0");
    currTime: string = $state("0.00");
    unstableRate: string = $state("0.00");
    bpmTimes: BpmTime[] = $state([]);
    timeDiffs: number[] = $state([]);
    clickTimes: number[] = $state([]);
    hitSound: Sound | null = null;
    private startTime: number = 0;
    private timesTimerId?: number;
    private gameTimerId?: number;
    constructor(speedTester?: SpeedTester) {
        this.id = speedTester?.id ?? "0";
        this.name = speedTester?.name ?? "Default";
        speedTester?.keys.forEach(element => {
            this.keys.push(new ClickableKeyInput(element));
        });
        if (!speedTester) {
            this.keys.push(new ClickableKeyInput("Z"));
            this.keys.push(new ClickableKeyInput("C"));
        }
        this.rule = new TestRule(speedTester?.type ?? "Times", speedTester?.amount ?? 10);

        watch(() => this.rule.type, () => {
            db.speedTester.update(
                this.id,
                {
                    type: this.rule.type
                });
        });

        watch(() => this.rule.amount, () => {
            db.speedTester.update(
                this.id,
                {
                    amount: this.rule.amount
                });
        });

        // Initialize hit sound with error handling for production environments
        // File is in static/ folder, accessible at /finger-speed-tester/osu-hit-sound.mp3
        try {
            // Construct full URL for the sound file
            // Use window.location.origin to get the current origin (works in both dev and production)
            const basePath = base || '';
            const relativePath = `${basePath}/osu-hit-sound.mp3`.replace(/\/+/g, '/'); // Remove double slashes
            const soundUrl = typeof window !== 'undefined' 
                ? `${window.location.origin}${relativePath}`
                : relativePath; // Fallback for SSR
            console.log('Initializing sound at:', soundUrl, '(base:', base, ')');
            this.hitSound = new Sound(soundUrl);
        } catch (error) {
            console.warn('Failed to initialize hit sound:', error);
            this.hitSound = null;
        }
    }

    initTest() {
        this.keys.forEach(input => input.count = 0)
        this.testing = true;
        this.hitCount = 0;
        this.currTime = "0.00";
        this.records = [];
    }

    startTest() {
        this.records = [];
        this.bpmTimes = [];
        this.isRunning = true;
        this.startTime = Date.now();
        if (this.rule.type === "Times")
            this.timesTimerId = window.setTimeout(() => this.finishTest(), this.rule.amount * 1000);
        this.clickTimes = [];
        this.timeDiffs = [];
        this.unstableRate = "0.00";

        this.startGameInterval();
    }

    startGameInterval() {
        if (this.gameTimerId) window.clearInterval(this.gameTimerId);
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
        this.unstableRate = this.calculateUR().toFixed(2);
    }

    /**
     * Calculate Unstable Rate (UR) - measures consistency of tapping rhythm
     * 
     * Algorithm:
     * 1. Use linear regression to find the "best fit" line through hit times
     *    This represents the ideal consistent tapping pattern
     * 2. Calculate the deviation (error) of each actual hit from this line
     * 3. UR = Standard Deviation of errors × 10
     * 
     * Lower UR = more consistent timing
     */
    calculateUR(): number {
        if (this.timeDiffs.length < 2) return 0;
        // Calculate errors (deviation from best fit line)
        // For least squares regression, mean error is always 0
        // So variance = mean of squared errors
        let sum = this.timeDiffs.reduce(function(a, b){return a + b});
        let avg = sum / this.timeDiffs.length;
        let variance = this.timeDiffs.reduce(function(a, b){return a + Math.pow(b - avg, 2)});
        const stdDev = Math.sqrt(variance / this.timeDiffs.length);
        // UR = standard deviation × 10
        return stdDev * 10;
    }

    finishTest() {
        if (!this.isRunning) return;
        if (this.rule.type === "Times"){
            clearTimeout(this.timesTimerId);
            this.updateGameState();
        }
        window.clearInterval(this.gameTimerId);
        // console.log("data", this.bpmTimes)
        this.isRunning = false;
        this.testing = false;
        this.saveRecordToDb();
    }
    saveRecordToDb() {
        let now = new Date();
        // now.setDate(now.getDate() - 3)
        db.speedTesterRecord.put({
            testerId: this.id,
            createTime: now,
            keys: this.keys.map((value) => value.key),
            type: this.rule.type,
            amount: this.rule.amount,
            periodTime: Number(this.currTime),
            numberOfHits: this.hitCount,
            bpm: Number(this.bpm),
            unstableRate: Number(this.unstableRate)
        });
    }

    saveSettingToDb(type: ReactiveSaveType) {
        switch (type) {

        }
    }

    breakTest() {
        this.testing = false;
        if (this.isRunning) {

            if (this.rule.type === "Times")
                clearTimeout(this.timesTimerId);
            window.clearInterval(this.gameTimerId);
            this.isRunning = false;
        }
    }

    updateKey(index: number, event: Event & { currentTarget: EventTarget & HTMLInputElement }): any {
        if (!event) return;
        // @ts-ignore
        if (!event.data) return;
        // @ts-ignore
        const newKey: string = (event.data as string).toUpperCase();
        if (newKey === " " || this.keys.some(input => input.key === newKey))
            this.keys[index].key = this.keys[index].previous.current ?? "";
        else
            this.keys[index].key = newKey;

        db.speedTester.update(
            this.id,
            {
                keys: this.keys.map((value) => value.key)
            });
    }

    handleKeyDown(key: string) {
        if(document.activeElement?.tagName === "INPUT") return;
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
            // Play hit sound with error handling to prevent breaking other functions
            if(GlobalSetting.enableHitSound && this.hitSound) {
                try {
                    this.hitSound.play();
                } catch (error) {
                    // Silently fail - don't break the game if sound fails
                    console.warn('Failed to play hit sound:', error);
                }
            }
            const now = Date.now();
            const elapsedSeconds = (now - this.startTime) / 1000;
            this.clickTimes.push(now);
            this.records.push({
                key: key,
                time: elapsedSeconds,
                bpm: (elapsedSeconds == 0) ? 0 : this.hitCount / elapsedSeconds * 60 / 4
            });
            if (this.records.length > 1)
                this.timeDiffs.push(this.clickTimes[this.clickTimes.length - 1] - this.clickTimes[this.clickTimes.length - 2]);
            else
                this.timeDiffs.push(0);
            this.updateGameState();
            if (this.rule.type === "Clicks" && this.hitCount === this.rule.amount) this.finishTest();
        }
    }
}
