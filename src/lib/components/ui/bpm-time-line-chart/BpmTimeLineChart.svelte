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
		type VisualMapComponentOption
	} from 'echarts/components';
	import { LineChart, type LineSeriesOption } from 'echarts/charts';
	import { UniversalTransition } from 'echarts/features';
	import { CanvasRenderer } from 'echarts/renderers';
	import { onMount } from 'svelte';
	import type { BpmTime } from '.';

	let { data, reload }: { data: BpmTime[]; reload: boolean } = $props();

	echarts.use([
		TitleComponent,
		TooltipComponent,
		GridComponent,
		VisualMapComponent,
		LineChart,
		CanvasRenderer,
		UniversalTransition
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
		data.map(function (item) {
			return [Number(item.time.toFixed(3)), Number(item.bpm.toFixed(3))];
		});
	// .slice(5);

	onMount(() => {
		myChart = echarts.init(chartDom, null, { renderer: 'canvas' });

		option = {
			animation: false,
			// Make gradient line here
			visualMap: {
				show: false,
				type: 'continuous',
				seriesIndex: 0,
				dimension: 1,
				min: 40,
				max: 270,
				inRange: {
					color: ['#4395ff', '#66ff92', '#f8e85d', '#ff7f68', '#fe3971', '#6662dd']
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
			},
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