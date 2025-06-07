import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
	ref?: U | null;
};

export function convertUtcToLocalDateString(utcDate: Date): string {
	const localDate = new Date(utcDate.getTime()); // Create a local time clone
	const year = localDate.getFullYear();
	const month = String(localDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
	const day = String(localDate.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}