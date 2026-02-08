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
    order?: number; // Optional order field for custom sorting
}
export interface SpeedTesterRecord {
    recordId: number;
    testerId: string;
    createTime: Date;
    keys: string[];
    type: HitType;
    amount: number;
    // result
    periodTime: number; // miliseconds
    numberOfHits: number;
    bpm: number;
    unstableRate: number;
}