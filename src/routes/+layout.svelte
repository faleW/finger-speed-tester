<script lang="ts">
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import '../app.css';
	let { children } = $props();
	import { ModeWatcher } from 'mode-watcher';
</script>

<div class="flex h-screen min-h-screen w-full flex-row overflow-hidden select-none">
	<ModeWatcher />
	<Sidebar />
	<Separator orientation="vertical" class="h" />
	<main
		class="flex h-screen min-h-screen w-full flex-col items-center justify-center overflow-hidden p-4"
	>
		<!-- <TestProfileMenu /> -->
		{@render children?.()}
	</main>
</div>
