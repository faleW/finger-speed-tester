<script lang="ts">
	import Input from '$lib/components/ui/input/input.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Tester } from './tester.svelte';
	import { fade } from 'svelte/transition';
	import BpmTimeLineChart from './ui/bpm-time-line-chart/BpmTimeLineChart.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import type { SpeedTester } from '$lib/model/speed-tester';

	let { tester } : {tester : SpeedTester | undefined} = $props();

	const testerState = new Tester(tester);

	function handleKeydown(event: any) {
		if (event.repeat) return;
		testerState.handleKeyDown(event.key);
	}
</script>

<div class="flex flex-row items-center gap-4 p-2 min-w-[500px] max-w-[1000px] w-full h-full">
	<div class="wrapper flex w-full h-[450px] items-center justify-center">
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
							id="key1"
							type="number"
							size={1}
							bind:value={testerState.rule.amount}
						/>
					</div>
				</div>
				<div class="flex flex-col gap-2 text-nowrap items-center">
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
						class="w-full text-center text-gray-500 underline underline-offset-4"
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
								<div class="flash-once m-0 flex w-full flex-1 items-center justify-center text-3xl">
									{key.key}
								</div>
							{/key}
							<div class="m-0 h-6 w-full border-t-2 p-0">{key.count}</div>
						</div>
					{/each}
					<style>
						@keyframes flash {
							0% {
								background-color: #d7d6d6;
							}
							100% {
								background-color: transparent;
							}
						}

						.flash-once {
							animation: flash 0.3s ease;
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
					class="w-full text-center text-gray-500 underline underline-offset-4"
					onclick={() => testerState.breakTest()}
				>
					Press 'Esc' to stop
				</Button>
			</div>
		{/if}
	</div>
	<!-- <Separator variant="vertical" /> -->
	<div class="flex flex-col w-full overflow-hidden h-full">
		<div class="w-full text-center text-xl flex flex-row justify-around">
			<div>
				Average Bpm {testerState.bpm}
			</div>
			<div>
				{testerState.hitCount} taps in {testerState.currTime} seconds
			</div>
		</div>
		<div class="flex-1 w-full">
			{#key testerState.bpmTimes}
			<BpmTimeLineChart data={[...testerState.bpmTimes]} reload={testerState.isRunning} />
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
