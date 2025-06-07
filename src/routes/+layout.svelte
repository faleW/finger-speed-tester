<script lang="ts">
	import { page } from '$app/state';
	import TestProfileMenu from '$lib/components/TestProfileMenu.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import '../app.css';
	let { children } = $props();
</script>
{#snippet SideBar()}
    <div class="w-96 m-4">
        Default
        <Separator />
        +Add
    </div>
{/snippet}
<div class="flex h-screen min-h-screen w-full flex-row overflow-hidden">
    {@render SideBar()}
    <Separator orientation="vertical" class="h" />
	<main
		class="flex h-screen min-h-screen w-full flex-col items-center justify-center p-4 select-none overflow-hidden"
	>
		<!-- <TestProfileMenu /> -->
		{@render children?.()}
	</main>
</div>
