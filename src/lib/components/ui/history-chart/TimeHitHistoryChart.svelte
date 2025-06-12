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
	import type { ThemeMode } from '$lib/constants/Color';

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

	let { id, mode }: { id: string; mode: ThemeMode } = $props();
	let data: (Date | number)[][] = [];

	let records = liveQuery(() =>
		db.speedTesterRecord.where('testerId').equals(id).sortBy('createdTime')
	);
	const subscription = records.subscribe({
		next: (result) => {
			data = result.map(function (item) {
				return [item.createdTime, Number(item.bpm.toFixed(3))];
			});
			myChart.setOption({
				series: {
					data: data
				}
			});
			resize();
		},
		error: (error) => console.error(error)
	});

	onMount(() => {
		myChart = echarts.init(chartDom, mode, { renderer: 'canvas' });
		let option = {
			backgroundColor: 'transparent',
			// Make gradient line here
			visualMap: {
				top: 70,
				right: 10,
				show: true,
				type: 'continuous',
				seriesIndex: 0,
				dimension: 1,
				min: 40,
				max: 300,
				inRange: {
					color: ['#4395ff', '#66ff92', '#f8e85d', '#ff7f68', '#fe3971', '#6662dd']
				},
				outOfRange: {
					color: '#1f1f46'
				}
			},
			title: {
				left: 'center'
			},
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'cross'
				}
			},
			xAxis: [
				{
					type: 'time',
					position: 'bottom',
					axisLabel: {
						formatter: (value: string | number | Date) => {
							const date = new Date(value);
							return date.toLocaleDateString([], {
								hour: '2-digit',
								minute: '2-digit'
							}); // Bottom: Date
						}
					}
				},
				{
					type: 'time',
					position: 'top',
					interval: 1,
					axisLine: {
						show: false
					},
					axisLabel: {
						formatter: (value: string | number | Date) => {
							const date = new Date(value);
							return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Bottom: Date
						}
					}
				}
			],
			yAxis: [
				{
					type: 'value',
					name: 'Avg. BPM'
				}
			],
			series: [
				{
					type: 'line',
					showSymbol: true,
					smooth: true,
					encode: {
						x: 0,
						y: 1
					}
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
		myChart.resize();
	});

	onDestroy(() => {
		subscription.unsubscribe();
	});
</script>

<div class="h-full min-h-full w-full flex-1" bind:this={chartDom}></div>

<svelte:window onresize={resize} />
