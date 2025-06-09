<script lang="ts">
	import { liveQuery } from 'dexie';
	import { db } from '$lib/model/db.js';
	import Separator from './ui/separator/separator.svelte';
	import ScrollArea from './ui/scroll-area/scroll-area.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { onDestroy } from 'svelte';
	import { convertUtcToLocalDateString } from '$lib/utils';
	import type { SpeedTesterRecord } from '$lib/model/speed-tester';
	import Button from './ui/button/button.svelte';
	import { Delete } from '@lucide/svelte';
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

	let openDelete = $state(false);
	let recordForDelete: SpeedTesterRecord | undefined = $state();
	const deleteRecord = async () => {
		try {
			if (recordForDelete) await db.speedTesterRecord.delete(recordForDelete.recordId);
		} catch (error) {
			console.log(error);
		}
		openDelete = false;
	};
</script>

{#snippet TesterInfo(record: SpeedTesterRecord)}
	<p>BPM: {record.bpm}</p>
	<p>Hit: {record.numberOfHits} per {record.periodTime} seconds</p>
	<p>Rule: {record.amount} {record.type === 'Times' ? 'seconds' : 'clicks'}</p>
	<p>Keys: {record.keys.join(', ')}</p>
	<p>Test at: {record.createdTime.toLocaleString()}</p>
{/snippet}
<div class="m-2 mt-4 h-full w-[180px] overflow-y-hidden">
	<span class=" text-base font-semibold">History</span>
	<Separator />
	<ScrollArea class="h-full overflow-auto pr-2 pb-4">
		<div class="flex-reverse flex flex-col ">
			{#each Object.entries(data) as [date, records] (date)}
				<div class="m-0 text-sm">{date} Count: {records.length}</div>
				{#each records as record (record.recordId)}
					<Tooltip.Provider>
						<Tooltip.Root>
							<Tooltip.Trigger>
								<div
									class="mb-1 flex flex-row items-center justify-between rounded-2xl border border-transparent p-1 font-mono text-xs hover:border-gray-300"
								>
									{toLocalTimeOnly(record.createdTime)} BPM: {record.bpm}
									<Button
										size="icon"
										variant="ghost"
										class="h-5 w-5 p-0 text-red-500 hover:text-red-600"
										onclick={() => {
											openDelete = true;
											recordForDelete = record;
										}}
									>
										<Delete />
									</Button>
								</div>
							</Tooltip.Trigger>
							<Tooltip.Content>
								{@render TesterInfo(record)}
							</Tooltip.Content>
						</Tooltip.Root>
					</Tooltip.Provider>
				{/each}
				<Separator class="my-1" />
			{/each}
		</div>
	</ScrollArea>
</div>

<Dialog.Root bind:open={openDelete}>
	<!-- <Dialog.Trigger>Open</Dialog.Trigger> -->
	<Dialog.Content>
		<Dialog.Header class="select-none">
			<Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
			<Dialog.Description>
				This action cannot be undone. This will permanently delete your data.
			</Dialog.Description>
		</Dialog.Header>
		{#if recordForDelete}
			<div class="rounded-xl border p-2">
				{@render TesterInfo(recordForDelete)}
			</div>
		{/if}
		<Button variant="destructive" onclick={() => deleteRecord()} class="select-none">Delete</Button>
	</Dialog.Content>
</Dialog.Root>
