<script lang="ts">
	import TestProfileMenu from "$lib/components/TestProfileMenu.svelte";
    import "../app.css";
    let { children } = $props();
</script>
<main
	class="flex min-h-screen items-center justify-center bg-gradient-to-br p-4 select-none"
>

<!-- <TestProfileMenu /> -->
{@render children?.()}
</main>