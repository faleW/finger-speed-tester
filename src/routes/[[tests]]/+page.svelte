<script>
	import HelloWorld from '$lib/components/HelloWorld.svelte';
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
<div class="flex-1 h-full w-full items-center flex justify-center">
	{#await data.tester}
		Loading
	{:then tester}
		<HitHistoryChart id={tester?.id ?? 0} />
	{/await}
</div>
