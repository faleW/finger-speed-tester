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
		data
			.map(function (item) {
				return [Number(item.time.toFixed(3)), Number(item.bpm.toFixed(3))];
			})
			.slice(3);

	onMount(() => {
		myChart = echarts.init(chartDom);

		option = {
			animation: false,
			// Make gradient line here
			visualMap: {
				show: false,
				type: 'continuous',
				seriesIndex: 0,
				min: 0,
				max: 400
			},
			title: {
				left: 'center',
				text: 'Gradient along the y axis'
			},
			tooltip: {
				trigger: 'axis'
			},
			xAxis: {
				type: 'value',
				name: 'Time',
				axisLabel: {
					formatter: '{value}s'
				},
				splitNumber: 5
			},
			yAxis: {
				type: 'value',
				name: 'BPM'
			},
			grid: [
				{
					bottom: '60%'
				}
			],
			series: {
				type: 'line',
				showSymbol: false,
				data: dataList(),
				animation: false
			},
			dataZoom: []
		};
		myChart.setOption(option);
	});

	let reloadId: number | undefined;
	$effect(() => {
		// console.log('Effect', reload, reloadId);
		if (reloadId){
			clearInterval(reloadId);
		}
		if (reload) {
			reloadId = window.setInterval(() => {
				// console.log(data.length);
				myChart.setOption(
					{
						series: {
							data: dataList()
						}
					}
				);
			}, 100);
		}
	});
</script>

<div class="h-full" bind:this={chartDom}></div>
