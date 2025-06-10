<script lang="ts">
	import Input from '$lib/components/ui/input/input.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Tester } from './tester.svelte';
	import { fade, scale } from 'svelte/transition';
	import BpmTimeLineChart from './ui/bpm-time-line-chart/BpmTimeLineChart.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import type { SpeedTester } from '$lib/model/speed-tester';
	import { mode } from 'mode-watcher';
	import { liveQuery } from 'dexie';
	import { db } from '$lib/model/db';

	let { tester }: { tester: SpeedTester } = $props();

	const testerState = new Tester(tester);
	let renameOpen = $state(false);
	let updateLock: Promise<void> | null = null;

	function handleKeydown(event: any) {
		if (event.repeat) return;
		testerState.handleKeyDown(event.key);
	}

	let dbTester = liveQuery(() =>
		db.speedTester
			.where('id')
			.equals(tester?.id ?? 0)
			.first()
	);

	const tryUpdate = (event: any) => {
		// If there's an update already happening, do nothing
		if (updateLock) return;

		// Set lock to a promise and clear it after update finishes
		updateLock = (async () => {
			await updateName(event);
			updateLock = null;
		})();
	};
	const updateName = (event: any) => {
		const id: number = tester?.id ?? 0;
		if (id === 0) return;

		// console.log('update name');
		try {
			const newName: string | undefined = event.target.value;
			if (newName && newName !== '' && newName !== $dbTester?.name) {
				// console.log('newName', newName);
				db.speedTester.update(id, {
					name: newName.trim()
				});
			}
		} catch (error) {
			console.log(error);
		}
		renameOpen = false;
	};
</script>

<div class="flex h-full w-full max-w-[1000px] min-w-[500px] flex-row items-center gap-4 p-2">
	<div class="flex h-full w-full flex-col items-center justify-between">
		{#if renameOpen && tester && tester.id !== 0}
			<Input
				type="text"
				autofocus
				onchange={(event) => tryUpdate(event)}
				onblur={(event) => tryUpdate(event)}
				onkeydown={(event) => {
					if (event.key.toUpperCase() === 'ENTER') {
						tryUpdate(event);
					}
				}}
				value={$dbTester?.name}
				class="text-center max-w-full w-full duration-150"
				size={32}
				style="font-size: 20px;"
			/>
		{:else}
			<button
				class="w-full shrink-0 cursor-pointer rounded-2xl border border-transparent p-2 text-xl font-semibold duration-150 hover:border-gray-400"
				onclick={() => (renameOpen = true)}
			>
				{$dbTester?.name}
			</button>
		{/if}
		<div class="wrapper flex h-full w-full items-center justify-center">
			{#if !testerState.testing}
				<div
					class="flex flex-col gap-4"
					in:fade={{ delay: 200, duration: 200 }}
					out:fade={{ duration: 200 }}
				>
					<div class="flex flex-col gap-2 text-nowrap">
						<div>
							<Button
								aria-checked={testerState.rule.type == 'Times'}
								variant="ghost"
								class="underline-offset-4 aria-checked:underline"
								onclick={() => {
									testerState.rule.type = 'Times';
								}}>Times (Seconds)</Button
							>
							/
							<Button
								aria-checked={testerState.rule.type == 'Clicks'}
								variant="ghost"
								class="underline-offset-4  aria-checked:underline"
								onclick={() => {
									testerState.rule.type = 'Clicks';
								}}>Clicks</Button
							>
						</div>
						<div class="flex items-center text-nowrap">
							<Input
								autocomplete="off"
								autocorrect="off"
								id="input-amount"
								type="number"
								size={1}
								bind:value={testerState.rule.amount}
							/>
						</div>
					</div>
					<div class="flex flex-col items-center gap-2 text-nowrap">
						Keys
						<div class="flex gap-1">
							{#each testerState.keys as key, index}
								<Input
									autocomplete="off"
									autocorrect="off"
									id={'key-' + index}
									type="text"
									class="h-16 w-16 text-center text-4xl md:text-4xl"
									bind:value={testerState.keys[index].key}
									oninput={(e) => testerState.updateKey(index, e)}
								/>
							{/each}
							<!-- <Button
				class="h-16 w-32 border-2 bg-gradient-to-r from-indigo-500 to-pink-500 hover:border-1"
				onclick={() => tester.startTest()}>Go!</Button
			> -->
						</div>
						<Button
							variant="link"
							class="w-full text-center text-gray-500 underline underline-offset-4 dark:text-gray-300"
							onclick={() => testerState.initTest()}
						>
							Press 'Space' to start
						</Button>
					</div>
				</div>
			{:else}
				<div
					class="flex flex-col items-center gap-4"
					in:fade={{ delay: 200, duration: 200 }}
					out:fade={{ duration: 200 }}
				>
					<div class="flex gap-2">
						{#each testerState.keys as key, index (key.key)}
							<div
								class="flex h-18 w-18 flex-col items-center overflow-hidden rounded-2xl border-2 text-center"
							>
								{#key testerState.keys[index].count}
									<div
										class="flash-once m-0 flex w-full flex-1 items-center justify-center text-3xl"
									>
										<div class="scale-once">{key.key}</div>
									</div>
								{/key}
								<div class="m-0 h-6 w-full border-t-2 p-0">{key.count}</div>
							</div>
						{/each}
						<style>
							@keyframes flash {
								from {
									background-color: #d7d6d6;
								}
								to {
									background-color: transparent;
								}
							}
							@keyframes scale {
								from {
									transform: scale(0.7);
								}
								to {
									transform: scale(1);
								}
							}

							.flash-once {
								animation: flash 0.3s ease;
							}

							.scale-once {
								animation: scale 0.3s ease;
							}
						</style>
					</div>
					<div>
						{#if testerState.rule.type === 'Clicks'}
							{testerState.hitCount} / {testerState.rule.amount} clicks
						{/if}
						{#if testerState.rule.type === 'Times'}
							{testerState.currTime} / {testerState.rule.amount} seconds
						{/if}
					</div>
					<Button
						variant="link"
						class="w-full text-center text-gray-500 underline underline-offset-4 dark:text-gray-300"
						onclick={() => testerState.breakTest()}
					>
						Press 'Esc' to stop
					</Button>
				</div>
			{/if}
		</div>
	</div>
	<!-- <Separator variant="vertical" /> -->
	<div class="flex h-full w-full flex-col overflow-hidden">
		<div class="flex w-full flex-row justify-around text-center text-xl">
			<div>
				Average Bpm {testerState.bpm}
			</div>
			<div>
				{testerState.hitCount} taps in {testerState.currTime} seconds
			</div>
		</div>
		<div class="w-full flex-1">
			{#key $mode}
				{#key testerState.bpmTimes}
					<BpmTimeLineChart
						data={[...testerState.bpmTimes]}
						reload={testerState.isRunning}
						mode={$mode}
					/>
				{/key}
			{/key}
		</div>
	</div>
</div>
<svelte:window onkeydown={handleKeydown} />

<style>
	.wrapper {
		display: grid;
	}

	.wrapper > * {
		grid-area: 1 / 1;
	}
</style>
