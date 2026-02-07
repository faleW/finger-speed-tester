<script lang="ts">
	import { page } from '$app/state';
	import { PageHeader } from '$lib/commands.svelte.js';
	import HelloWorld from '$lib/components/HelloWorld.svelte';
	import HistoricalRecordList from '$lib/components/HistoricalRecordList.svelte';
	import SpeedTester from '$lib/components/SpeedTesterUI.svelte';
	import { HitHistoryChart } from '$lib/components/ui/history-chart';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { db } from '$lib/model/db.js';
	import type { Observable, Subscription } from 'dexie';
	import { liveQuery } from 'dexie';
	import { onDestroy, onMount } from 'svelte';
	let { data } = $props();
	let subscription: Subscription;
	$effect(() => {
		if (subscription) subscription.unsubscribe();
		subscription = liveQuery(() =>
			db.speedTester
				.where('id')
				.equals(data.tester?.id ?? "0")
				.first()
		).subscribe({
			next: (result) => {
				PageHeader.title = result?.name ?? PageHeader.title;
			},
			error: (error) => console.error(error)
		});
		PageHeader.title = data.tester?.name ?? PageHeader.title;
	});

	onMount(()=> {
		const id = data.tester?.id ?? "0";
		setTimeout(() => {
			document.getElementById(`sidebar-profile-${id}`)?.scrollIntoView({ behavior: 'smooth' });
		}, 100);
	})

	onDestroy(() => {
		if (subscription) subscription.unsubscribe();
	})
</script>

{#key data.tester}
	<div class="flex h-[400px] w-full items-center justify-center">
		{#await data.tester}
			<!-- Loading -->
		{:then tester}
			{#if tester}
				<!-- <div>{tester.name}</div> -->
				<SpeedTester {tester}></SpeedTester>
			{:else}
				Error
			{/if}
		{/await}
	</div>
	<Separator />
	<div class="flex h-full w-full flex-1 flex-row items-center justify-center overflow-hidden">
		{#await data.tester}
			<!-- Loading -->
		{:then tester}
			{#if tester}
				<HitHistoryChart id={tester?.id ?? "0"} />
				<Separator orientation="vertical" class="mx-4" />
				<HistoricalRecordList id={tester?.id ?? "0"} />
			{:else}
				Error
			{/if}
		{/await}
	</div>
{/key}
