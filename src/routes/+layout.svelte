<script lang="ts">
    import "../app.css";
    let { children } = $props();
</script>
<main
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 select-none"
>
{@render children?.()}
</main>