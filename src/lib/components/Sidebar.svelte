<script lang="ts">
	import { page } from '$app/state';
	import DarkModeToggle from '$lib/components/DarkModeToggle.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import { db } from '$lib/model/db';
	import { cn } from '$lib/utils';
	import { liveQuery } from 'dexie';
	import Button from './ui/button/button.svelte';
	import ScrollArea from './ui/scroll-area/scroll-area.svelte';
	import { goto } from '$app/navigation';
	import { Delete } from '@lucide/svelte';

	function isActiveProfile(id: number) {
		const pathId: number = Number(page.url.pathname.replace('/', ''));
		return pathId === id;
	}

	let testers = liveQuery(() => db.speedTester.where('id').notEqual(0).sortBy('createdTime'));

	const addProfile = async () => {
		try {
			const id = await db.speedTester.add({
				name: 'New Tester',
				keys: ['Z', 'X'],
				type: 'Times',
				amount: 10
			});

			goto(`/${id}#sidebar-profile-${id}`);
		} catch (error) {
			console.log(error);
		}
	};

	const deleteProfile = async (id: number) => {
		try {
			await db.speedTesterRecord.where("testerId").equals(id).delete();
			await db.speedTester.delete(id);
			goto("/");
		} catch (error) {
			console.log(error);
		}
	};
</script>

{#snippet Profile(id: number, name: string)}
	{@const isActive = isActiveProfile(id)}
	<a
		data-sveltekit-preload-code="off"
		id={'sidebar-profile-' + id}
		href={'/' + (id == 0 ? '' : id)}
		class={cn(
			'hover:bg-secondary hover:text-secondary-foreground flex w-full items-center justify-between rounded-md p-2 hover:**:data-delete:flex',
			isActive ? 'bg-secondary text-secondary-foreground' : ''
		)}
	>
		{name}
		{#if id !== 0}
		<Button
			data-delete
			class="hidden h-6 w-6 items-center justify-center text-red-500 
				hover:text-red-700 "
			size="icon"
			variant="ghost"
			onclick={() => deleteProfile(id)}
		>
			<Delete />
		</Button>
		{/if}
	</a>
{/snippet}
<div class="m-0 flex h-full w-64 flex-col justify-between overflow-hidden">
	<header class="flex flex-row gap-x-1 p-1">
		<div class="w-full flex-1 self-center text-center">Finger Speed Tester</div>
		<Separator orientation="vertical" />
		<DarkModeToggle />
	</header>
	<Separator />
	<main class="justtify-none flex flex-1 flex-col overflow-hidden p-4">
		<div class="mb-4 flex flex-col overflow-hidden">
			<div class="flex flex-row items-center justify-between px-2 text-gray-500">
				Profile
				<!-- <div class="text-center self-center overflow-hidden rounded-2xl h-6 w-6 hover:text-secondary-foreground hover:bg-secondary ">
					+
				</div> -->
			</div>
			<ScrollArea class="flex flex-col overflow-auto pr-4">
				{@render Profile(0, 'Default')}
				{#each $testers as tester (tester.id)}
					{@render Profile(tester.id, tester.name)}
				{/each}
			</ScrollArea>
		</div>
		<Button variant="outline" onclick={() => addProfile()}>Add Profile</Button>
	</main>
	<Separator />
	<footer>Download Desktop Version</footer>
</div>
