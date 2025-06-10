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
	import { onMount } from 'svelte';
	import type { BpmTime } from '.';
	import { BPMColorSchema, type ThemeMode } from '$lib/constants/Color';

	let { data, reload, mode }: { data: BpmTime[]; reload: boolean ; mode: ThemeMode } = $props();

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

	const dataList = () =>
		data
			.map(function (item) {
				return [Number(item.time.toFixed(3)), Number(item.bpm.toFixed(3))];
			})
			.slice(5);
	const resize = () => {
		myChart.resize();
	};
	onMount(() => {
		console.log(mode)
		myChart = echarts.init(chartDom, mode, { renderer: 'canvas' });

		option = {
			backgroundColor: 'transparent',
			animation: false,
			// Make gradient line here
			visualMap: {
				top: 50,
				right: 10,
				show: true,
				type: 'continuous',
				seriesIndex: 0,
				dimension: 1,
				min: 40,
				max: 300,
				inRange: {
					color: BPMColorSchema
				},
				outOfRange: {
					color: '#1f1f46'
				}
			},
			title: {
				left: 'center',
				text: ''
			},
			tooltip: {
				trigger: 'axis'
			},
			xAxis: {
				type: 'value',
				name: 'Time',
				axisLabel: {
					formatter: '{value} s'
				},
				splitNumber: 5
			},
			yAxis: {
				type: 'value',
				name: 'Avg. BPM'
			},
			series: {
				type: 'line',
				showSymbol: false,
				data: dataList(),
				animation: false,
				smooth: true
			}
			// dataZoom: [
			// 	{
			// 		type: 'inside',
			// 		xAxisIndex: 0,
			// 		filterMode: 'none'
			// 	},
			// 	{
			// 		type: 'slider',
			// 		xAxisIndex: 0,
			// 		filterMode: 'none'
			// 	}
			// ]
		};
		myChart.setOption(option);
		myChart.resize();
	});

	let reloadId: number | undefined;
	$effect(() => {
		// console.log('Effect', reload, reloadId);
		if (reloadId) {
			clearInterval(reloadId);
		}
		if (reload) {
			let data = dataList();
			reloadId = window.setInterval(() => {
				// $inspect(data.length);
				myChart.setOption({
					series: {
						data: data
					}
				});
			}, 50);
		}
	});
</script>

<div class="min-h-full w-full" bind:this={chartDom}></div>

<svelte:window onresize={resize} />
