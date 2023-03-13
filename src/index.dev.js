import * as d3 from "d3";
import * as topojson from "topojson";
import 'whatwg-fetch';
import '@babel/polyfill';

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import 'webpack-icons-installer/bootstrap';

import { Subject } from './Subject.js';
import { State } from './State.js';
import { timeLine } from './timeLine.js';
import { map } from './map.js';
import { stateTable } from './stateTable.js';
import { statesOnMap } from './statesOnMap.js';
import { generalTable } from './generalTable.js';
 
import { radialProgress } from './progressBar.js';
import { prepareDistrictData,prepareStateData, prepareRegionMappingData} from './prepareData.js';

import './style.css';
import './scss/app.scss';

// import './randomLocation'

console.log("DEV");
const mapUrl = "../dataSets/ukraine.json"; // from https://raw.githubusercontent.com/vsapsai/ukraine_map_data/master/ukraine.json
const stateUrl = "../dataSets/data_new.csv";
const districtUrl = "../dataSets/district.csv";
const regionUrl = '../dataSets/regions.csv';
const televisionUrl = '../media/television.svg';

const wrapper = 'geo-chart-wrapper';



let mapData;
let stateData;
let districtData;
let regionMappingData;

document.addEventListener("DOMContentLoaded", function(){ document.getElementById(wrapper).innerHTML="<text>Завантаження ...<text>" });

// console.log( d3.csv(regionUrl,{headers: {"Content-Type":"text/csv"}}) );

Promise.all([
    d3.json(mapUrl),
    d3.csv(stateUrl),
    d3.csv(districtUrl),
    d3.csv(regionUrl),
]).then(function(files) {

    mapData = files[0];
    stateData = files[1];
    districtData = files[2];
    regionMappingData = files[3];
    const loadingMessage = document.getElementById(wrapper);
    loadingMessage.parentNode.removeChild(loadingMessage);
    render(mapData,prepareStateData(stateData,prepareDistrictData(districtData)),wrapper,prepareRegionMappingData(regionMappingData));

}).catch(function(err) {
    console.error("Loading error "+err);
})

const render = (data,states,wrapper,regionMapping) =>{
	console.log({states});
	const stateData = new State(states);
	const mapWrapperWidth = document.getElementById('main-content-1').clientWidth;
	const chartWrapperHeight =  window.innerHeight
		|| document.documentElement.clientHeight
		|| document.body.clientHeight ;
	const timeLineHeight = 200;
	const timeLineWidth = document.getElementById('main-content-2-2').clientWidth-30;
	const rowMarginTop = 10;

	// console.log({
	// 	'header-label': document.getElementById('header-label').clientHeight, 
	// 	'main-content-header-1': document.getElementById('main-content-header-1').clientHeight
	// })

	let selectedView = 'map';

	const formatTime = d3.timeFormat("%d.%m.%Y");


	d3.select('#header-label').append('text')
		.text(`Дані системи моніторінго обміну з Ощадбанком для монетизації субсидій в період з ${formatTime(states[0].date)} по ${formatTime(states[states.length-1].date)}`);
	const buttonGroup = d3.select('#main-content-header-3').append('div')
		.attr('class','btn-group btn-group-toggle')
		.attr('data-toggle','buttons');
	buttonGroup.append('label')
		.attr('class','btn btn-sm btn-outline-secondary active')
		.text('Мапа')
		.append('input')
			.attr('type','radio')
			.attr('name','options')
			.attr('id','mapView')
			.attr('autocomplete','off')
			.attr('checked','');
					
	buttonGroup.append('label')
		.attr('class','btn btn-sm btn-outline-secondary')
		.text('Таблиця')
		.append('input')
			.attr('type','radio')
			.attr('name','options')
			.attr('id','tableView')
			.attr('autocomplete','off');

	buttonGroup.append('label')
		.attr('class','btn btn-sm btn-outline-secondary')
		.text('Підсумки')
		.append('input')
			.attr('type','radio')
			.attr('name','options')
			.attr('id','summaryView')
			.attr('autocomplete','off');

	const mapWidth = mapWrapperWidth - 30;
	const mapHeight = chartWrapperHeight-timeLineHeight
		-document.getElementById('header-label').clientHeight
		-document.getElementById('main-content-header-1').clientHeight
		-rowMarginTop*3;
	
	d3.select('#main-content-1')
		.style('height',`${mapHeight}px`)
		.style('overflow','auto');
	

	document.getElementById('tableView').addEventListener('focus',() => {dispatchViewChange('table')},true);
	document.getElementById('mapView').addEventListener('focus',() => {dispatchViewChange('map')},true);
	
	const ukraine = topojson.feature(data, data.objects.regions);

    let m = map( mapWidth, mapHeight);
    m.changeRegionSubject.addObserver(stateData);
    m.update(ukraine);
    let stm = statesOnMap();
    let st;
	const updateStm = { 
		update: (context,message) => {
			stm.update(context,m.getProjection());
		}
	}
	stateData.addObserver(updateStm);
	const dispatchViewChange = (target) => {
		if ( selectedView !== target ) {
			selectedView = target;
			switch (target){
				case 'map':
					d3.select('#main-content-1 .table-responsive').remove();
					m = map( mapWidth, mapHeight);
					stateData.removeObserver(st);
					m.changeRegionSubject.addObserver(stateData,'REGION');
					m.update(ukraine);
					stateData.addObserver(updateStm);
					stm.update(stateData.getCurrentState(),m.getProjection());
					break;
				case 'table':
					d3.select('#map-svg').remove();
					stateData.removeObserver(updateStm);
					st = stateTable();
					st.update(stateData.getCurrentState());
					stateData.addObserver(st);
					break;
			}
		}
	}
    
    const changeDaySubject = timeLine(states,timeLineWidth,timeLineHeight);

    changeDaySubject.addObserver(stateData);

    const genTable = generalTable();
    stateData.addObserver(genTable);

    const activeDistritChartSvg = d3.select('#extra-content-2-2').append('svg')
    	.attr('width',100)
    	.attr('height',100)
    	.attr('id','active-district-chart-svg');
    const activeDistrictChart = radialProgress('#active-district-chart-svg',{size: {width:90,height:90}, position: { x:5,y:5} });

    const activeRegionChartSvg = d3.select('#extra-content-3-2').append('svg')
    	.attr('width',100)
    	.attr('height',100)
    	.attr('id','active-region-chart-svg');
    const activeRegionChart = radialProgress('#active-region-chart-svg',{size: {width:90,height:90}, position: { x:5,y:5} });

    d3.select('#extra-content-2-1')
    	.append('div')
    	.attr('class','h-100 d-flex align-items-center')
	    	.append("text")
			.text("Активні УПСЗН: ");

	d3.select('#extra-content-3-1')
		.append('div')
    	.attr('class','h-100 d-flex align-items-center')
			.append("text")
			.text("Активні регіони: ");

	const updateActiveDistrictChart = { update: (day) => {
		activeDistrictChart.update(day.activeDistrict.percent);
	} };

	stateData.addObserver(updateActiveDistrictChart);

	const updateActiveRegionChart = { update: (day) => {
		activeRegionChart.update(day.activeRegion.percent);
	} };

	stateData.addObserver(updateActiveRegionChart);

}

const render_old = (data,states,wrapper) => {

	function timer(ms) {
		return new Promise(res => setTimeout(res, ms));
	}

	async function load () {
		for (const [i,day] of states.entries()) {
    		d3.select(".day-bar-"+i)
				.style("fill","red");
			drawStates(day);
			await timer(dayPlayDelay);
			d3.select(".day-bar-"+i)
				.style("fill","steelblue");
			// ROactivities.remove();

		};
	}

	// load();


}