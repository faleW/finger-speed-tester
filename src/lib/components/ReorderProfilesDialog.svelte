<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import Button from '$lib/components/ui/button/button.svelte';
	import { db } from '$lib/model/db';
	import type { SpeedTester } from '$lib/model/speed-tester';
	import { GripVertical } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	let { open = $bindable(false), testers } : { open: boolean, testers: SpeedTester[] } = $props();

	// Working copy of testers for drag and drop
	let orderedTesters = $state<SpeedTester[]>([]);
	let draggedIndex = $state<number | null>(null);

	// Initialize ordered testers when dialog opens or testers change
	$effect(() => {
		if (open && testers.length > 0) {
			// Sort by order if exists, otherwise by createTime
			orderedTesters = [...testers].sort((a, b) => {
				const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
				const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
				if (orderA !== orderB) return orderA - orderB;
				return a.createTime.getTime() - b.createTime.getTime();
			});
		}
	});

	function handleDragStart(index: number, event: DragEvent) {
		draggedIndex = index;
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData('text/html', '');
		}
	}

	function handleDragOver(index: number, event: DragEvent) {
		event.preventDefault();
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}
	}

	function handleDrop(targetIndex: number, event: DragEvent) {
		event.preventDefault();
		if (draggedIndex === null || draggedIndex === targetIndex) {
			draggedIndex = null;
			return;
		}

		// Reorder the array
		const newOrder = [...orderedTesters];
		const [removed] = newOrder.splice(draggedIndex, 1);
		newOrder.splice(targetIndex, 0, removed);
		orderedTesters = newOrder;
		draggedIndex = null;
	}

	function handleDragEnd() {
		draggedIndex = null;
	}

	async function handleSave() {
		try {
			// Update order for each tester
			const updates = orderedTesters.map((tester, index) => {
				return db.speedTester.update(tester.id, {
					order: index,
					updateTime: new Date()
				});
			});
			await Promise.all(updates);
			open = false;
		} catch (error) {
			console.error('Error saving profile order:', error);
		}
	}

	function handleCancel() {
		// Reset to original order
		orderedTesters = [...testers].sort((a, b) => {
			const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
			const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
			if (orderA !== orderB) return orderA - orderB;
			return a.createTime.getTime() - b.createTime.getTime();
		});
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>Reorder Profiles</Dialog.Title>
			<Dialog.Description>
				Drag and drop profiles to change their order in the sidebar.
			</Dialog.Description>
		</Dialog.Header>

		<div class="max-h-[400px] overflow-y-auto py-4">
			<div class="space-y-2" role="list">
				{#each orderedTesters as tester, index (tester.id)}
					<div
						role="listitem"
						aria-label={`Profile ${tester.name}, position ${index + 1}`}
						draggable="true"
						ondragstart={(e) => handleDragStart(index, e)}
						ondragover={(e) => handleDragOver(index, e)}
						ondrop={(e) => handleDrop(index, e)}
						ondragend={handleDragEnd}
						class={cn(
							'flex items-center gap-3 rounded-lg border p-3 cursor-move transition-colors',
							draggedIndex === index
								? 'bg-primary/10 border-primary opacity-50'
								: 'bg-background hover:bg-accent'
						)}
					>
						<GripVertical class="h-5 w-5 text-muted-foreground flex-shrink-0" />
						<div class="flex-1 font-medium">{tester.name}</div>
						<div class="text-sm text-muted-foreground">#{index + 1}</div>
					</div>
				{/each}
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={handleCancel} class="cursor-pointer">
				Cancel
			</Button>
			<Button onclick={handleSave} class="cursor-pointer">
				Save
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
