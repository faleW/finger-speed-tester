<script lang="ts">
	import { page } from '$app/state';
	import DarkModeToggle from '$lib/components/DarkModeToggle.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import { db } from '$lib/model/db';
	import { cn } from '$lib/utils';
	import { liveQuery } from 'dexie';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import { goto } from '$app/navigation';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Delete, Download, Ellipsis, Info, Pencil } from '@lucide/svelte';
	import { Input } from '$lib/components/ui/input';
	import { onMount } from 'svelte';
	import { isTauri } from '@tauri-apps/api/core';
	import OsuLogo from './OsuLogo.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';

	let renameId: number | undefined = $state();
	let updateLock: Promise<void> | null = null;

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
			await db.speedTesterRecord.where('testerId').equals(id).delete();
			await db.speedTester.delete(id);
			goto('/');
		} catch (error) {
			console.log(error);
		}
	};
	const tryUpdate = (id: number, event: any) => {
		// If there's an update already happening, do nothing
		if (updateLock) return;

		// Set lock to a promise and clear it after update finishes
		updateLock = (async () => {
			await updateName(id, event);
			updateLock = null;
		})();
	};

	const updateName = (id: number, event: any) => {
		try {
			const newName: string | undefined = event.target.value;
			if (newName && newName !== '') {
				console.log('newName', newName);
				db.speedTester.update(id, {
					name: newName.trim()
				});
			}
		} catch (error) {
			console.log(error);
		}
		renameId = undefined;
	};

	let isBrowser = $state(false);
	// onMount(() => {
	// 	isBrowser = !window.isTauri;
	// 	console.log(window.isTauri);
	// });
</script>

{#snippet Profile(id: number, name: string)}
	{#if renameId && renameId === id}
		{console.log('renameId', renameId)}
		<Input
			id="rename-input"
			type="text"
			onchange={(event) => tryUpdate(id, event)}
			onblur={(event) => tryUpdate(id, event)}
			onkeydown={(event) => {
				if (event.key.toUpperCase() === 'ENTER') {
					tryUpdate(id, event);
				}
			}}
			value={name}
			class="m-0 w-full focus-visible:ring-transparent"
			autofocus
		/>
		<!-- {renameInput?.focus()} -->
	{:else}
		{@const isActive = isActiveProfile(id)}
		<a
			data-sveltekit-preload-code="off"
			id={'sidebar-profile-' + id}
			href={'/' + (id == 0 ? '' : id)}
			class={cn(
				`hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group relative flex w-full 
			items-center justify-between rounded-md p-2`,
				isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
			)}
		>
			{name}
			{#if id !== 0}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger
						data-menu
						class={cn(
							buttonVariants({ variant: 'ghost' }),
							`h-6 w-6 items-center justify-center opacity-0 
						duration-200 group-hover:opacity-100 group-focus:opacity-100`
						)}
					>
						<Ellipsis />
					</DropdownMenu.Trigger>
					<DropdownMenu.Content
						class="w-32 group-hover:block group-focus:block"
						onCloseAutoFocus={(event) => event.preventDefault()}
					>
						<DropdownMenu.Item onclick={() => (renameId = id)}>
							<Pencil />
							Rename
						</DropdownMenu.Item>
						<Separator />
						<DropdownMenu.Item variant="destructive" onclick={() => deleteProfile(id)}>
							<Delete />
							Delete
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{/if}
		</a>
	{/if}
{/snippet}
<div
	class="bg-sidebar text-sidebar-foreground m-0 flex h-full w-56 min-w-56 flex-col justify-between overflow-hidden"
>
	<header class="flex flex-row gap-x-1 p-1">
		<div class="w-full flex-1 self-center text-center">Finger Speed Tester</div>
		<Separator orientation="vertical" />
		<DarkModeToggle />
	</header>
	<Separator />
	<main class="justtify-none flex flex-1 flex-col overflow-hidden p-4">
		<div class="mb-4 flex flex-col overflow-hidden">
			{@render Profile(0, 'Default')}
			<Separator class="my-2" />
			<div class="flex flex-row items-center justify-between px-2 text-gray-500">
				Profile
				<!-- <div class="text-center self-center overflow-hidden rounded-2xl h-6 w-6 hover:text-secondary-foreground hover:bg-secondary ">
					+
				</div> -->
			</div>
			<ScrollArea class="flex flex-col overflow-auto bg-transparent pr-4">
				{#each $testers as tester (tester.id)}
					{@render Profile(tester.id, tester.name)}
				{/each}
			</ScrollArea>
		</div>
		<Button class="cursor-pointer" variant="outline" onclick={() => addProfile()}>Add Profile</Button>
	</main>
	<Separator />
	<footer class="flex flex-col p-2">
		<div class="pl-2">About me</div>
		<div class="flex flex-row justify-center gap-4 m-1">
			<a
				href="https://osu.ppy.sh/users/6449465"
				target="_blank"
				rel="noreferrer noopener"
				class="w-fit rounded-sm text-gray-600 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-black dark:text-gray-400"
			>
				osu@aRnio
			</a>
			<a
				href="https://github.com/faleW"
				target="_blank"
				rel="noreferrer noopener"
				class="w-fit rounded-sm text-gray-600 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-black dark:text-gray-400"
			>
				github@falew
			</a>
		</div>
		<a
			href="/"
			target="_blank"
			class="hover:bg-secondary m-1 flex flex-row gap-2 rounded-2xl border border-transparent p-2"
		>
			<Info />About Application
		</a>
		{#if !isTauri()}
			<div
				class="hover:bg-secondary m-1 flex flex-nowrap items-center rounded-2xl border-transparent"
			>
				<Tooltip.Provider>
					<Tooltip.Root>
						<Tooltip.Trigger>
							<a href="/" class="group flex flex-nowrap gap-2 p-2">
								<Download class="animate-bounce" />
								Download Desktop
							</a>
							<!-- <Info class="h-4" /> -->
						</Tooltip.Trigger>
						<Tooltip.Content>Desktop version ensures the persistent data.</Tooltip.Content>
					</Tooltip.Root>
				</Tooltip.Provider>
			</div>
		{/if}
	</footer>
</div>
