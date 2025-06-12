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
		DataZoomComponent,
		ToolboxComponent,
		LegendComponent
	} from 'echarts/components';
	import { LineChart, type LineSeriesOption } from 'echarts/charts';
	import { UniversalTransition } from 'echarts/features';
	import { CanvasRenderer } from 'echarts/renderers';
	import { onDestroy, onMount } from 'svelte';
	import { liveQuery } from 'dexie';
	import { db } from '$lib/model/db';
	import { convertUtcToLocalDateString, toMidnight } from '$lib/utils';
	import { BPMColorSchema, type ThemeMode } from '$lib/constants/Color';

	echarts.use([
		TitleComponent,
		TooltipComponent,
		GridComponent,
		VisualMapComponent,
		LineChart,
		CanvasRenderer,
		UniversalTransition,
		DataZoomComponent,
		ToolboxComponent,
		LegendComponent
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
	let { id, mode }: { id: string; mode: ThemeMode } = $props();
	let data: DataType[];

	let records = liveQuery(() =>
		db.speedTesterRecord.where('testerId').equals(id).sortBy('createTime')
	);
	const subscription = records.subscribe({
		next: (result) => {
			let dataObject: Map<string, DataType> = new Map<string, DataType>();
			result.forEach(function (item) {
				const date = convertUtcToLocalDateString(item.createTime);
				const curr = dataObject.get(date);
				dataObject.set(date, {
					date: date,
					minBpm: Math.min(item.bpm, curr?.minBpm ?? item.bpm),
					maxBpm: Math.max(item.bpm, curr?.maxBpm ?? item.bpm),
					averageBpm: curr
						? (curr.averageBpm * curr.count + item.bpm) / (curr.count + 1)
						: item.bpm,
					count: (curr?.count ?? 0) + 1
				} as DataType);
			});

			data = Array.from(dataObject.values());
			type BpmSeriesType = (Date | number)[][];
			const minBpmSeries: BpmSeriesType = [];
			const maxBpmSeries: BpmSeriesType = [];
			const avgBpmSeries: BpmSeriesType = [];
			const countSeries: BpmSeriesType = [];

			data.forEach((item) => {
				// const date = toUtcMidnight(item.date).getTime();

				const date = toMidnight(item.date).getTime();
				// const parts = item.date.split('-').map(Number); // [2025, 6, 7]
				// const date = Date.UTC(parts[0], parts[1] - 1, parts[2]); // Month is 0-based
				minBpmSeries.push([date, item.minBpm]);
				maxBpmSeries.push([date, item.maxBpm]);
				avgBpmSeries.push([date, item.averageBpm]);
				countSeries.push([date, item.count]);
			});
			myChart.setOption({
				series: [
					{
						name: 'Min',
						type: 'line',
						data: minBpmSeries
					},
					{
						name: 'Max',
						type: 'line',
						data: maxBpmSeries
					},
					{
						name: 'Average',
						type: 'line',
						data: avgBpmSeries
					},
					{
						name: 'Play Count',
						type: 'line',
						data: countSeries
					}
				]
			});
			resize();
		},
		error: (error) => console.error(error)
	});
	const visualMapData = {
		top: 70,
		right: 10,
		show: true,
		type: 'continuous',
		dimension: 1,
		min: 40,
		max: 300,
		inRange: {
			color: BPMColorSchema
		},
		outOfRange: {
			color: '#1f1f46'
		}
	};
	onMount(() => {
		myChart = echarts.init(chartDom, mode ?? 'light');
		let option = {
			visualMap: visualMapData,
			backgroundColor: 'transparent',
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
				// selected: {
				// 	Min: false,
				// 	Max: true,
				// 	Average: false,
				// 	'Play Count': false
				// }
			},
			toolbox: {
				// feature: {
				// 	saveAsImage: {}
				// }
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
			series: [
				{
					name: 'Min',
					type: 'line',
					smooth: true
				},
				{
					name: 'Max',
					type: 'line',
					smooth: true
				},
				{
					name: 'Average',
					type: 'line',
					smooth: true
				},
				{
					name: 'Play Count',
					type: 'line',
					smooth: true
				}
			],
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
