<script>
	import HelloWorld from '$lib/components/HelloWorld.svelte';
	import HistoricalRecordList from '$lib/components/HistoricalRecordList.svelte';
	import SpeedTester from '$lib/components/SpeedTesterUI.svelte';
	import HitHistoryChart from '$lib/components/ui/history-chart/HitHistoryChart.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	let { data } = $props();
</script>

<div class="flex h-[400px] w-full items-center justify-center">
	{#await data.tester}
		Loading
	{:then tester}
		<SpeedTester {tester}></SpeedTester>
	{/await}
</div>
<Separator />
<div class="flex flex-row h-full w-full flex-1 items-center justify-center overflow-hidden">
	{#await data.tester}
		Loading
	{:then tester}
	<HitHistoryChart id={tester?.id ?? 0} />
	<Separator orientation="vertical" class="mx-4"/>
	<HistoricalRecordList id={tester?.id ?? 0} />
	{/await}
</div>
