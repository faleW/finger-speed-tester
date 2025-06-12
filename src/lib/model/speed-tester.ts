export type HitType = "Times" | "Clicks";

export interface SpeedTester {
    id: string;
    name: string;
    keys: string[];
    type: HitType;
    amount: number;
    createTime: Date;
    updateTime: Date;
    recordUpdateTime: Date;
}
export interface SpeedTesterRecord {
    recordId: number;
    testerId: string;
    createdTime: Date;
    keys: string[];
    type: HitType;
    amount: number;
    // result
    periodTime: number; // miliseconds
    numberOfHits: number;
    bpm: number;
    unstableRate: number;
}