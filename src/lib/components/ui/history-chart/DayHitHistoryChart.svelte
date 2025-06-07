<script lang="ts">
	import * as echarts from 'echarts/core';
	import {
		TitleComponent,
		type TitleComponentOption,
		TooltipComponent,
		type TooltipComponentOption,
		GridComponent,
		type GridComponentOption,
		VisualMapComponent,
		type VisualMapComponentOption,
		DataZoomComponent
	} from 'echarts/components';
	import { LineChart, type LineSeriesOption } from 'echarts/charts';
	import { UniversalTransition } from 'echarts/features';
	import { CanvasRenderer } from 'echarts/renderers';
	import { onDestroy, onMount } from 'svelte';
	import { liveQuery } from 'dexie';
	import { db } from '$lib/model/db';
	import { currentMonitor } from '@tauri-apps/api/window';
	import { convertUtcToLocalDateString } from '$lib/utils';

	echarts.use([
		TitleComponent,
		TooltipComponent,
		GridComponent,
		VisualMapComponent,
		LineChart,
		CanvasRenderer,
		UniversalTransition,
		DataZoomComponent
	]);

	type EChartsOption = echarts.ComposeOption<
		| TitleComponentOption
		| TooltipComponentOption
		| GridComponentOption
		| VisualMapComponentOption
		| LineSeriesOption
	>;
	let chartDom: HTMLElement;
	let option: EChartsOption;
	let myChart: echarts.ECharts;
	const resize = () => {
		myChart.resize();
	};

	type DataType = {
		date: string;
		minBpm: number;
		maxBpm: number;
		averageBpm: number;
		count: number;
	};
	let { id }: { id: number } = $props();
	let data: DataType[];

	let records = liveQuery(() =>
		db.speedTesterRecord.where('testerId').equals(id).sortBy('createdTime')
	);
	const subscription = records.subscribe({
		next: (result) => {
			let dataObject: Map<string, DataType> = new Map<string, DataType>();
			result.forEach(function (item) {
				const date = convertUtcToLocalDateString(item.createdTime);
				const curr = dataObject.get(date);
				dataObject.set(date, {
					date: date,
					minBpm: Math.min(item.bpm, curr?.minBpm ?? item.bpm),
					maxBpm: Math.max(item.bpm, curr?.minBpm ?? item.bpm),
					averageBpm: curr
						? (curr.averageBpm * curr.count + item.bpm) / (curr.count + 1)
						: item.bpm,
					count: (curr?.count ?? 0) + 1
				} as DataType);
			});

			data = Array.from(dataObject.values());
			const minBpmSeries = data.map((d) => [new Date(d.date).getTime(), d.minBpm]);
			const maxBpmSeries = data.map((d) => [new Date(d.date).getTime(), d.maxBpm]);
			const avgBpmSeries = data.map((d) => [new Date(d.date).getTime(), d.averageBpm]);
			myChart.setOption({
				visualMap: [
					visualMapData,
					// { ...visualMapData, seriesIndex: 1 },
					// { ...visualMapData, seriesIndex: 2 }
				],
				series: [
					{
						name: 'Min BPM',
						type: 'line',
						data: minBpmSeries
					},
					{
						name: 'Max BPM',
						type: 'line',
						data: maxBpmSeries
					},
					{
						name: 'Average BPM',
						type: 'line',
						data: avgBpmSeries
					}
				]
			});
		},
		error: (error) => console.error(error)
	});
	const visualMapData = {
		show: false,
		type: 'continuous',
		dimension: 1,
		min: 40,
		max: 270,
		inRange: {
			color: ['#4395ff', '#66ff92', '#f8e85d', '#ff7f68', '#fe3971', '#6662dd']
		},
		outOfRange: {
			color: '#1f1f46'
		}
	};
	onMount(() => {
		myChart = echarts.init(chartDom, null, { renderer: 'canvas' });
		let option = {
			// Make gradient line here
			visualMap: [],
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'shadow'
				},
				formatter: function (params: any[]) {
					const date = new Date(params[0].axisValue);
					const year = date.getFullYear();
					const month = String(date.getMonth() + 1).padStart(2, '0');
					const day = String(date.getDate()).padStart(2, '0');
					const dateOnly = `${year}-${month}-${day}`;

					let result = `${dateOnly}<br/>`;
					params.forEach((param) => {
						result += `${param.marker} ${param.seriesName}: ${Number(param.data[1]).toFixed(3)}<br/>`;
					});
					return result;
				}
			},
			legend: {
				data: ['Min BPM', 'Max BPM', 'Average BPM']
			},
			xAxis: {
				type: 'time',
				axisLabel: {
					formatter: (val: string | number | Date) => {
						return convertUtcToLocalDateString(new Date(val));
					}
				}
			},
			yAxis: {
				type: 'value',
				name: 'BPM'
			},
			series: [],
			dataZoom: [
				{
					type: 'inside',
					xAxisIndex: 0,
					filterMode: 'none'
				},
				{
					type: 'slider',
					xAxisIndex: 0,
					filterMode: 'none'
				}
			]
		};
		myChart.setOption(option);
	});

	onDestroy(() => {
		subscription.unsubscribe();
	});
</script>

<div class="h-full min-h-full w-full flex-1" bind:this={chartDom}></div>

<svelte:window onresize={resize} />
