<script lang="ts">
	import Input from '$lib/components/ui/input/input.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Tester } from './tester.svelte';
	import { fade } from 'svelte/transition';
	import BpmTimeLineChart from './ui/bpm-time-line-chart/BpmTimeLineChart.svelte';
	const tester = new Tester();

	function handleKeydown(event: any) {
		if (event.repeat) return;
		tester.handleKeyDown(event.key);
	}
</script>

<div class="flex flex-row items-center">
	<div class="wrapper flex w-full items-center justify-center">
		{#if !tester.testing}
			<div
				class="flex flex-col gap-4"
				in:fade={{ delay: 200, duration: 200 }}
				out:fade={{ duration: 200 }}
			>
				<div class="w-full text-center text-2xl">
					Bpm {tester.bpm}
				</div>
				<div class="flex flex-col gap-2 text-nowrap">
					<div>
						<Button
							aria-checked={tester.rule.type == 'Times'}
							variant="ghost"
							class="underline-offset-4 aria-checked:underline"
							onclick={() => {
								tester.rule.type = 'Times';
							}}>Times (Seconds)</Button
						>
						/
						<Button
							aria-checked={tester.rule.type == 'Clicks'}
							variant="ghost"
							class="underline-offset-4  aria-checked:underline"
							onclick={() => {
								tester.rule.type = 'Clicks';
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
							bind:value={tester.rule.amount}
						/>
					</div>
				</div>
				<div class="flex flex-col gap-2 text-nowrap">
					Keys
					<div class="flex gap-1">
						{#each tester.keys as key, index}
							<Input
								autocomplete="off"
								autocorrect="off"
								id={'key-' + index}
								type="text"
								class="h-16 w-16 text-center text-4xl md:text-4xl"
								bind:value={tester.keys[index].key}
								oninput={(e) => tester.updateKey(index, e)}
							/>
						{/each}
						<!-- <Button
					class="h-16 w-32 border-2 bg-gradient-to-r from-indigo-500 to-pink-500 hover:border-1"
					onclick={() => tester.startTest()}>Go!</Button
				> -->
					</div>
					<div class="w-full text-center text-gray-500 underline underline-offset-4">
						Press 'Space' to start
					</div>
				</div>
			</div>
		{:else}
			<div
				class="flex flex-col items-center gap-4"
				in:fade={{ delay: 200, duration: 200 }}
				out:fade={{ duration: 200 }}
			>
				<div>
					Bpm: {tester.bpm}
					<br />
					{#if tester.rule.type === 'Clicks'}
						{tester.hitCount} / {tester.rule.amount} clicks
					{/if}
					{#if tester.rule.type === 'Times'}
						{tester.currTime} / {tester.rule.amount} seconds
					{/if}
				</div>
				<div class="flex gap-2">
					{#each tester.keys as key, index (key.key)}
						<div
							class="flex h-18 w-18 flex-col items-center overflow-hidden rounded-2xl border-2 text-center"
						>
							{#key tester.keys[index].count}
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
				<div class="w-full text-center text-gray-500 underline underline-offset-4">
					Press 'Esc' to stop
				</div>
			</div>
		{/if}
	</div>
	<div class="w-[1000px] h-[500px]">
		{#key tester.bpmTimes}
			<BpmTimeLineChart data={[...tester.bpmTimes]} reload={tester.isRunning} />
		{/key}
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
