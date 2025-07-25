<script lang="ts">
    import { base } from '$app/paths';
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
	import { onMount, tick } from 'svelte';
	import { isTauri } from '@tauri-apps/api/core';
	import OsuLogo from './OsuLogo.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { v4 as uuidv4 } from 'uuid';

	let renameId: string | undefined = $state();
	let updateLock: Promise<void> | null = null;

	function isActiveProfile(id: string) {
		const pathId = page.url.pathname.replace('/', '');
		return (pathId === '' && id === '0') || pathId === id;
	}

	let testers = liveQuery(() => db.speedTester.where('id').notEqual('0').sortBy('createTime'));

	const addProfile = async () => {
		try {
			const id = await db.speedTester.add({
				id: uuidv4(),
				name: 'New Tester',
				keys: ['Z', 'X'],
				type: 'Times',
				amount: 10,
				createTime: new Date(),
				updateTime: new Date(),
				recordUpdateTime: new Date()
			});

			await goto(`${base}/${id}`);
			await tick(); // Wait for DOM update
			setTimeout(() => {
				// console.log('scroll sidebar');
				document.getElementById(`sidebar-profile-${id}`)?.scrollIntoView({ behavior: 'smooth' });
			}, 100);
		} catch (error) {
			console.log(error);
		}
	};

	const deleteProfile = async (id: string) => {
		try {
			await db.speedTesterRecord.where('testerId').equals(id).delete();
			await db.speedTester.delete(id);
			goto(base);
		} catch (error) {
			console.log(error);
		}
	};
	const tryUpdate = (id: string, event: any) => {
		// If there's an update already happening, do nothing
		if (updateLock) return;

		// Set lock to a promise and clear it after update finishes
		updateLock = (async () => {
			await updateName(id, event);
			updateLock = null;
		})();
	};

	const updateName = (id: string, event: any) => {
		try {
			const newName: string | undefined = event.target.value;
			if (newName && newName !== '') {
				// console.log('newName', newName);
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

{#snippet Profile(id: string, name: string)}
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
			href={ base + "/" + (id == '0' ? '' : id)}
			class={cn(
				`hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group relative flex w-full 
			items-center justify-between rounded-md p-2`,
				isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
			)}
		>
			{name}
			{#if id !== '0'}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger
						data-menu
						class={cn(
							buttonVariants({ variant: 'ghost' }),
							`h-6 w-6 cursor-pointer items-center justify-center 
						opacity-0 duration-200 group-hover:opacity-100 group-focus:opacity-100`
						)}
					>
						<Ellipsis />
					</DropdownMenu.Trigger>
					<DropdownMenu.Content
						class="w-32 group-hover:block group-focus:block"
						onCloseAutoFocus={(event) => event.preventDefault()}
					>
						<DropdownMenu.Item class="cursor-pointer" onclick={() => (renameId = id)}>
							<Pencil />
							Rename
						</DropdownMenu.Item>
						<Separator />
						<DropdownMenu.Item
							class="cursor-pointer"
							variant="destructive"
							onclick={() => deleteProfile(id)}
						>
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
	<main class="justtify-none flex flex-1 flex-col overflow-hidden px-4 py-2">
		<div class="mb-4 flex flex-col overflow-hidden">
			{@render Profile('0', 'Default')}
			<Separator class="my-2" />
			<div class="flex flex-row items-center justify-between px-2 text-gray-500">
				Profile
				<!-- <div class="text-center self-center overflow-hidden rounded-2xl h-6 w-6 hover:text-secondary-foreground hover:bg-secondary ">
					+
				</div> -->
			</div>
			<ScrollArea class="flex flex-col overflow-auto bg-transparent">
				{#each $testers as tester (tester.id)}
					{@render Profile(tester.id, tester.name)}
				{/each}
			</ScrollArea>
		</div>
		<Button class="cursor-pointer" variant="outline" onclick={() => addProfile()}
			>Add Profile</Button
		>
	</main>
	<Separator />
	<footer class="flex flex-col p-2">
		<div class="pl-2">About me</div>
		<div class="m-1 flex flex-row justify-center gap-4">
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
			href="https://github.com/faleW/finger-speed-tester"
			target="_blank"
			class="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground m-1 flex flex-row gap-2 rounded-2xl border border-transparent p-2"
		>
			<Info />About Application
		</a>
		{#if !isTauri()}
			<div
				class="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground m-1 flex flex-nowrap items-center rounded-2xl border-transparent"
			>
				<Tooltip.Provider>
					<Tooltip.Root>
						<Tooltip.Trigger>
							<a
								href="https://github.com/faleW/finger-speed-tester/releases"
								target="_blank"
								class="group flex flex-nowrap gap-2 p-2"
							>
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
