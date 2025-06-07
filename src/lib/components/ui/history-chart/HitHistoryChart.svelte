<script lang="ts">
	import { Button } from '../button';
	import Separator from '../separator/separator.svelte';
	import DayHitHistoryChart from './DayHitHistoryChart.svelte';
	import TimeHitHistoryChart from './TimeHitHistoryChart.svelte';
	let { id }: { id: number } = $props();
	let chartType: 'day' | 'time' = $state('day');
</script>

<div class="flex flex-1 h-full min-h-full flex-col p-2">
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
	<div class="flex-1 h-full w-full">
		{#if chartType == 'day'}
		<DayHitHistoryChart {id}/>
		{:else}
		<TimeHitHistoryChart {id}/>
		{/if}
	</div>
</div>
