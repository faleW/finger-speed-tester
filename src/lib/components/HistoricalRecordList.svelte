<script lang="ts">
	import { liveQuery } from 'dexie';
	import { db } from '$lib/model/db.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { onDestroy } from 'svelte';
	import { convertUtcToLocalDateString } from '$lib/utils';
	import type { SpeedTesterRecord } from '$lib/model/speed-tester';
	import Button from './ui/button/button.svelte';
	import { Delete, Key } from '@lucide/svelte';
	let { id }: { id: string } = $props();
	import VirtualScroll from 'svelte-virtual-scroll-list';
	import Separator from './ui/separator/separator.svelte';

	let records = liveQuery(() =>
		db.speedTesterRecord.where('testerId').equals(id).reverse().sortBy('createTime')
	);
	type DataType = {
		index: number;
		date: string;
		isHeader: boolean;
		record: SpeedTesterRecord;
	};
	let items: DataType[] = $state([]);

	function toLocalTimeOnly(date: Date) {
		return date.toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		});
	}
	const subscription = records.subscribe({
		next: (result) => {
			let prevDate = '';
			let dataObject: DataType[] = [];
			let index = 0;
			result.forEach(function (item) {
				const date = convertUtcToLocalDateString(item.createTime);
				if (prevDate !== date) {
					dataObject.push({
						date: date,
						isHeader: true,
						index: index++,
						record: item
					});
					prevDate = date;
				}
				dataObject.push({
					date: date,
					isHeader: false,
					record: item,
					index: index++
				});
			});
			items = dataObject;
			console.log(items.length);
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

	let list;
</script>

{#snippet TesterInfo(record: SpeedTesterRecord)}
	<p>BPM: {record.bpm}</p>
	<p>Hit: {record.numberOfHits} per {record.periodTime} seconds</p>
	<p>Rule: {record.amount} {record.type === 'Times' ? 'seconds' : 'clicks'}</p>
	<p>Keys: {record.keys.join(', ')}</p>
	<p>Created at: {record.createTime.toLocaleString()}</p>
{/snippet}

{#snippet Record(record: SpeedTesterRecord)}
	<Tooltip.Provider>
		<Tooltip.Root>
			<Tooltip.Trigger
				class="mb-1 flex h-6 w-full flex-row items-center justify-between rounded-2xl 
				p-1 font-mono text-xs
                hover:bg-secondary hover:**:data-delete:block"
			>
				{toLocalTimeOnly(record.createTime)} BPM: {record.bpm}
				<Button
					data-delete
					size="icon"
					variant="ghost"
					class="hidden h-5 w-5 cursor-pointer p-0 text-red-500 hover:text-red-600"
					onclick={() => {
						openDelete = true;
						recordForDelete = record;
					}}
				>
					<Delete />
				</Button>
			</Tooltip.Trigger>
			<Tooltip.Content>
				{@render TesterInfo(record)}
			</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Provider>
{/snippet}
<div class="m-2 mt-4 h-full w-[180px] overflow-y-auto">
	<VirtualScroll bind:this={list} keeps={20} estimateSize={24} data={items} key="index" let:data>
		{#if data.isHeader}
			{data.date}
		{:else}
			{@render Record(data.record)}
		{/if}
	</VirtualScroll>
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
		<Button variant="destructive" onclick={() => deleteRecord()} class="cursor-pointer select-none"
			>Delete</Button
		>
	</Dialog.Content>
</Dialog.Root>
