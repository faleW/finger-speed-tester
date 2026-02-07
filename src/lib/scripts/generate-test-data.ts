/**
 * Script to generate test data for the last 6 months
 * Run this in the browser console or create a page to execute it
 */

import { db } from '../model/db';
import type { SpeedTesterRecord } from '../model/speed-tester';

const PROFILE_ID = '9891bb74-ff71-401a-a6c9-378cf5e2bce5';

/**
 * Generate random number between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random float between min and max
 */
function randomFloat(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}

/**
 * Generate a random date within a given month
 */
function randomDateInMonth(year: number, month: number): Date {
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const day = randomInt(1, daysInMonth);
	const hour = randomInt(0, 23);
	const minute = randomInt(0, 59);
	const second = randomInt(0, 59);
	return new Date(year, month, day, hour, minute, second);
}

/**
 * Generate test records for the last 6 months
 */
export async function generateTestData(): Promise<void> {
	// Clear existing records for this profile first
	try {
		const deletedCount = await db.speedTesterRecord.where('testerId').equals(PROFILE_ID).delete();
		console.log(`Cleared ${deletedCount} existing records for profile ${PROFILE_ID}`);
	} catch (error) {
		console.error('Error clearing existing data:', error);
		throw error;
	}

	const now = new Date();
	const records: Omit<SpeedTesterRecord, 'recordId'>[] = [];

	// Generate data for the last 6 months
	for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
		const targetDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
		const year = targetDate.getFullYear();
		const month = targetDate.getMonth();

		// Generate 6-10 records for this month
		const recordCount = randomInt(6, 10);

		for (let i = 0; i < recordCount; i++) {
			const createTime = randomDateInMonth(year, month);
			
			// Generate BPM in the range 180-220
			const targetBpm = randomFloat(180, 220);
			
			// Generate realistic test data
			const type = Math.random() > 0.5 ? 'Times' : 'Clicks';
			let amount: number;
			let periodTime: number;
			let numberOfHits: number;
			
			if (type === 'Times') {
				// For Times type: periodTime = amount (seconds)
				periodTime = randomFloat(10, 30);
				amount = Math.round(periodTime);
				// Calculate numberOfHits to achieve target BPM
				// BPM = (numberOfHits / periodTime) * 60 / 4
				// numberOfHits = (targetBpm * periodTime * 4) / 60
				numberOfHits = Math.round((targetBpm * periodTime * 4) / 60);
			} else {
				// For Clicks type: numberOfHits = amount
				numberOfHits = randomInt(100, 300);
				amount = numberOfHits;
				// Calculate periodTime to achieve target BPM
				// BPM = (numberOfHits / periodTime) * 60 / 4
				// periodTime = (numberOfHits * 60) / (targetBpm * 4)
				periodTime = (numberOfHits * 60) / (targetBpm * 4);
			}
			
			// Recalculate BPM to ensure it's in range (should be close to targetBpm)
			const calculatedBpm = (numberOfHits / periodTime) * 60 / 4;
			const finalBpm = Math.max(180, Math.min(220, Math.round(calculatedBpm)));
			
			// Generate realistic UR (50-200 range, with some variation)
			const unstableRate = randomFloat(50, 200);

			records.push({
				testerId: PROFILE_ID,
				createTime: createTime,
				keys: ['Z', 'X'],
				type: type,
				amount: amount,
				periodTime: Math.round(periodTime * 100) / 100, // Round to 2 decimal places
				numberOfHits: numberOfHits,
				bpm: finalBpm,
				unstableRate: Math.round(unstableRate * 100) / 100
			});
		}
	}

	// Insert all records into the database
	try {
		await db.speedTesterRecord.bulkAdd(records);
		console.log(`Successfully generated ${records.length} test records for profile ${PROFILE_ID}`);
		console.log('Records generated for the last 6 months with BPM range 180-220');
	} catch (error) {
		console.error('Error generating test data:', error);
		throw error;
	}
}

// If running in browser console, expose the function
if (typeof window !== 'undefined') {
	(window as any).generateTestData = generateTestData;
}
