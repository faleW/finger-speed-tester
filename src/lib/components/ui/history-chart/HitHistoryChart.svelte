<script lang="ts">
	import { Button } from '../button';
	import DayHitHistoryChart from './DayHitHistoryChart.svelte';
	import TimeHitHistoryChart from './TimeHitHistoryChart.svelte';
	let { id }: { id: number } = $props();
	let chartType: 'day' | 'time' = $state('time');
</script>

<div class="flex h-full min-h-full w-full flex-row">
	<div class="flex flex-col">
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
	{#if chartType == 'day'}
		<DayHitHistoryChart {id}/>
	{:else}
		<TimeHitHistoryChart {id}/>
	{/if}
</div>
