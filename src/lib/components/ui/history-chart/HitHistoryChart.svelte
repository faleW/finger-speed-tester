<script lang="ts">
	import { Button } from '../button';
	import Separator from '../separator/separator.svelte';
	import DayHitHistoryChart from './DayHitHistoryChart.svelte';
	import TimeHitHistoryChart from './TimeHitHistoryChart.svelte';
	let { id }: { id: number } = $props();
	let chartType: 'day' | 'time' = $state('time');
</script>

<div class="flex h-full min-h-full w-full flex-col p-2">
	<div class="flex flex-row items-center">
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
	<div class="flex-1 h-full">
		{#if chartType == 'day'}
		<DayHitHistoryChart {id}/>
		{:else}
		<TimeHitHistoryChart {id}/>
		{/if}
	</div>
</div>
