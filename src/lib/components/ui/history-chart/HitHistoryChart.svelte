<script lang="ts">
	import { Button } from '../button';
	import Separator from '../separator/separator.svelte';
	import DayHitHistoryChart from './DayHitHistoryChart.svelte';
	// import TimeHitHistoryChart from './TimeHitHistoryChart.svelte';
	let { id }: { id: string } = $props();
	let chartType: 'day' | 'time' = $state('day');
	import { mode } from 'mode-watcher';
</script>

{#snippet chartTag()}
	<div class="flex flex-row w-fit items-center border rounded-2xl border-gray-400 pl-4 overflow-hidden">
		<span class="text-md">Type</span>
		<Separator class="mx-2" orientation="vertical"/>
		<Button
			aria-checked={chartType == 'day'}
			variant="ghost"
			class="underline-offset-4 aria-checked:underline"
			onclick={() => {
				chartType = 'day';
			}}>Day</Button
		>
		<Button
			aria-checked={chartType == 'time'}
			variant="ghost"
			class="underline-offset-4  aria-checked:underline"
			onclick={() => {
				chartType = 'time';
			}}>Time</Button
		>
	</div>
{/snippet}

<div class="flex flex-1 h-full min-h-full flex-col p-2">
	<!-- {@render chartTag()} -->
	<div class="flex-1 h-full w-full">
		{#key $mode}
		{#if chartType == 'day'}
		<DayHitHistoryChart {id} mode={$mode}/>
		{/if}
		{/key}
	</div>
</div>
