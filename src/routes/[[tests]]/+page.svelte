<script>
	import HelloWorld from '$lib/components/HelloWorld.svelte';
	import HistoricalRecordList from '$lib/components/HistoricalRecordList.svelte';
	import SpeedTester from '$lib/components/SpeedTesterUI.svelte';
	import HitHistoryChart from '$lib/components/ui/history-chart/HitHistoryChart.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	let { data } = $props();

	console.log(data.tester)
</script>

{#key data.tester}
	<div class="flex h-[400px] w-full items-center justify-center">
		{#await data.tester}
			Loading
		{:then tester}
			{#if tester}
			<SpeedTester {tester}></SpeedTester>
			{:else}
			Error
			{/if}
		{/await}
	</div>
	<Separator />
	<div class="flex h-full w-full flex-1 flex-row items-center justify-center overflow-hidden">
		{#await data.tester}
			Loading
		{:then tester}
			{#if tester}
			<HitHistoryChart id={tester?.id ?? 0} />
			<Separator orientation="vertical" class="mx-4" />
			<HistoricalRecordList id={tester?.id ?? 0} />
			{:else}
			Error
			{/if}
		{/await}
	</div>
{/key}
