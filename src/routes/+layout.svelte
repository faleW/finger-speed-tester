<script lang="ts">
	import { page } from '$app/state';
	import DarkModeToggle from '$lib/components/DarkModeToggle.svelte';
	import TestProfileMenu from '$lib/components/TestProfileMenu.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import '../app.css';
	let { children } = $props();
	import { ModeWatcher } from 'mode-watcher';
</script>

{#snippet SideBar()}
	<div class="m-4 w-64">
		
		Welcome
		<Separator />
		Default
		<Separator />
		+Add

		<Separator />
		<DarkModeToggle />
	</div>
{/snippet}
<div class="flex h-screen min-h-screen w-full flex-row overflow-hidden">
	<ModeWatcher />
	{@render SideBar()}
	<Separator orientation="vertical" class="h" />
	<main
		class="flex h-screen min-h-screen w-full flex-col items-center justify-center overflow-hidden p-4 select-none"
	>
		<!-- <TestProfileMenu /> -->
		{@render children?.()}
	</main>
</div>
