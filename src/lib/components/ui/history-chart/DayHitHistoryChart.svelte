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

	/**
	 * Linear regression: finds the best-fit line y = slope * x + intercept
	 * Returns an array of [x, y] points for the trendline endpoints.
	 */
	function linearRegression(points: number[][]): { slope: number; intercept: number } {
		const n = points.length;
		if (n < 2) return { slope: 0, intercept: 0 };

		let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
		for (const [x, y] of points) {
			sumX += x;
			sumY += y;
			sumXY += x * y;
			sumX2 += x * x;
		}
		const denom = n * sumX2 - sumX * sumX;
		if (denom === 0) return { slope: 0, intercept: sumY / n };

		const slope = (n * sumXY - sumX * sumY) / denom;
		const intercept = (sumY - slope * sumX) / n;
		return { slope, intercept };
	}

	/**
	 * Moving average with a given window size.
	 * For each point, averages the surrounding window of values.
	 */
	function movingAverage(points: number[][], windowSize: number): number[][] {
		const result: number[][] = [];
		const half = Math.floor(windowSize / 2);
		for (let i = 0; i < points.length; i++) {
			const start = Math.max(0, i - half);
			const end = Math.min(points.length - 1, i + half);
			let sum = 0;
			let count = 0;
			for (let j = start; j <= end; j++) {
				sum += points[j][1];
				count++;
			}
			result.push([points[i][0], Math.round((sum / count) * 100) / 100]);
		}
		return result;
	}
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
						? Number(((curr.averageBpm * curr.count + item.bpm) / (curr.count + 1)).toFixed(3))
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
				const date = toMidnight(item.date).getTime();
				minBpmSeries.push([date, item.minBpm]);
				maxBpmSeries.push([date, item.maxBpm]);
				avgBpmSeries.push([date, item.averageBpm]);
				countSeries.push([date, item.count]);
			});

			// Cast to number[][] since all values are timestamps (numbers) from getTime()
			const maxBpmNumeric = maxBpmSeries as number[][];

			// --- Trendline (Linear Regression on Max BPM) ---
			// Normalize x values for numerical stability
			const trendlineSeries: number[][] = [];
			if (maxBpmNumeric.length >= 2) {
				const xMin = maxBpmNumeric[0][0];
				const xMax = maxBpmNumeric[maxBpmNumeric.length - 1][0];
				const normalized = maxBpmNumeric.map(([x, y]) => [(x - xMin) / (xMax - xMin || 1), y]);
				const { slope, intercept } = linearRegression(normalized);

				// Generate trendline points at each data x
				for (const [x] of maxBpmNumeric) {
					const nx = (x - xMin) / (xMax - xMin || 1);
					trendlineSeries.push([x, Math.round((slope * nx + intercept) * 100) / 100]);
				}
			}

			// --- Moving Average on Max BPM (window = ~30% of data or min 3) ---
			const windowSize = Math.max(3, Math.round(maxBpmNumeric.length * 0.3));
			const movingAvgSeries = movingAverage(maxBpmNumeric, windowSize);

			// --- BPM improvement annotation ---
			let improvementText = '';
			if (trendlineSeries.length >= 2) {
				const startBpm = trendlineSeries[0][1];
				const endBpm = trendlineSeries[trendlineSeries.length - 1][1];
				const delta = endBpm - startBpm;
				const sign = delta >= 0 ? '+' : '';
				improvementText = `${sign}${delta.toFixed(1)} BPM`;
			}

			// Calculate label interval based on data size to prevent overlap
			const maxLabels = 10;
			const dataLength = data.length;
			const labelInterval = dataLength > maxLabels ? Math.floor(dataLength / maxLabels) : 0;

			myChart.setOption({
				xAxis: {
					axisLabel: {
						interval: labelInterval
					}
				},
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
					},
					{
						name: 'Trend (Max)',
						type: 'line',
						data: trendlineSeries,
						markLine: trendlineSeries.length >= 2 ? {
							silent: true,
							symbol: 'none',
							lineStyle: { type: 'dashed', color: '#888', width: 1 },
							label: { show: true, position: 'end', formatter: improvementText, fontSize: 12, fontWeight: 'bold' },
							data: [[
								{ coord: [trendlineSeries[0][0], trendlineSeries[0][1]] },
								{ coord: [trendlineSeries[trendlineSeries.length - 1][0], trendlineSeries[trendlineSeries.length - 1][1]] }
							]]
						} : undefined
					},
					{
						name: 'Moving Avg (Max)',
						type: 'line',
						data: movingAvgSeries
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
						result += `${param.marker} ${param.seriesName}: ${Number(param.data[1])}<br/>`;
					});
					return result;
				}
			},
			legend: {
				selected: {
					Min: false,
					Max: true,
					Average: false,
					'Play Count': true,
					'Trend (Max)': true,
					'Moving Avg (Max)': false
				}
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
					},
					interval: 0, // Will be auto-calculated based on available space
					// Show fewer labels when there are many dates
					showMinLabel: true,
					showMaxLabel: true
				},
				minInterval: 24 * 60 * 60 * 1000, // 1 day in ms
				// Automatically adjust label interval based on data density
				axisPointer: {
					label: {
						formatter: (params: any) => {
							return convertUtcToLocalDateString(new Date(params.value));
						}
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
				},
				{
					name: 'Trend (Max)',
					type: 'line',
					smooth: false,
					showSymbol: false,
					lineStyle: {
						type: 'dashed',
						width: 2,
						opacity: 0.7
					},
					itemStyle: {
						opacity: 0
					}
				},
				{
					name: 'Moving Avg (Max)',
					type: 'line',
					smooth: true,
					showSymbol: false,
					lineStyle: {
						width: 3,
						opacity: 0.85
					}
				}
			],
			dataZoom: [
				{
					type: 'slider',
					realtime: true,
					start: 0,
					end: 100,
					labelFormatter: function (value: any, axisValue: string | number | Date) {
						const date = new Date(axisValue);
						return `${date.getFullYear()}-${(date.getMonth() + 1)
							.toString()
							.padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
					}
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
