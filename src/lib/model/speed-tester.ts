export type HitType = "Times" | "Clicks";

export interface SpeedTester {
    id: number;
    name: string;
    keys: string[];
    type: HitType;
    amount: number;
}
export interface SpeedTesterRecord {
    recordId: number;
    testerId: number;
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