<script lang="ts">
	import { PageHeader } from '$lib/commands.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import '../app.css';
	let { children } = $props();
	import { ModeWatcher } from 'mode-watcher';
</script>

<div  style="font-family: 'Roboto', sans-serif;" class="flex h-screen min-h-screen w-full flex-row overflow-hidden select-none font-normal">
	<Sidebar />
	<ModeWatcher />
	<Separator orientation="vertical" class="h" />
	<main
		class="flex h-screen min-h-screen w-full flex-col items-center justify-center overflow-hidden"
	>
		<!-- <TestProfileMenu /> -->
		{@render children?.()}
	</main>
</div>

<svelte:head>
	<title>Finger Speed Tester - {PageHeader.title}</title>
</svelte:head>