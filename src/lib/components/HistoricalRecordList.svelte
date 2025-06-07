<script lang="ts">
	import { liveQuery } from 'dexie';
	import { db } from '$lib/model/db.js';
	import Separator from './ui/separator/separator.svelte';
	import ScrollArea from './ui/scroll-area/scroll-area.svelte';
	import { onDestroy } from 'svelte';
	import { convertUtcToLocalDateString } from '$lib/utils';
	import type { SpeedTesterRecord } from '$lib/model/speed-tester';
	let { id }: { id: number } = $props();

	let records = liveQuery(() =>
		db.speedTesterRecord.where('testerId').equals(id).reverse().sortBy('createdTime')
	);

	let data: Record<string, SpeedTesterRecord[]> = $state({});

	function toLocalTimeOnly(date: Date) {
		return date.toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		});
	}
	const subscription = records.subscribe({
		next: (result) => {
			let dataObject: Record<string, SpeedTesterRecord[]> = {};
			result.forEach(function (item) {
				const date = convertUtcToLocalDateString(item.createdTime);
				console.log(date);

				const createTimeStr = item.createdTime.toLocaleTimeString([], {
					hour: '2-digit',
					minute: '2-digit',
					hour12: false
				});

				if (dataObject[date]) {
					dataObject[date].push(item);
				} else {
					dataObject[date] = [item];
				}
			});

			data = dataObject;
		},
		error: (error) => console.error(error)
	});

	onDestroy(() => {
		subscription.unsubscribe();
	});
</script>

<div class="m-2 mt-4 h-full w-[180px] overflow-y-hidden">
	<span class="m-2 text-base font-semibold">History</span>
	<Separator />
	<ScrollArea class="h-full overflow-auto pr-2 pb-12">
		<div class="flex-reverse flex flex-col select-text">
			{#each Object.entries(data) as [date, records] (date)}
				<div class="text-sm">{date} Count: {records.length}</div>
				{#each records as record (record.recordId)}
					<div class="text-xs font-mono">{toLocalTimeOnly(record.createdTime)} BPM: {record.bpm}</div>
				{/each}
                <Separator />
			{/each}
		</div>
	</ScrollArea>
</div>
