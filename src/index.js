import * as d3 from "d3";
import * as topojson from "topojson";
import 'whatwg-fetch';
import '@babel/polyfill';

import { radialProgress } from './progressBar.js';

import './style.css';

// import './randomLocation'

const mapUrl = "../dataSets/ukraine.json"; // from https://raw.githubusercontent.com/vsapsai/ukraine_map_data/master/ukraine.json
const stateUrl = "../dataSets/data_new.csv";
const districtUrl = "../dataSets/district.csv";
const regionUrl = '../dataSets/regions.csv';
const televisionUrl = '../media/television.svg';

const wrapper = 'geo-chart-wrapper';



let mapData;
let stateData;
let districtData;

document.addEventListener("DOMContentLoaded", function(){ document.getElementById(wrapper).innerHTML="<text>Завантаження ...<text>" });

Promise.all([
    d3.json(mapUrl),
    d3.csv(stateUrl),
    d3.csv(districtUrl),
]).then(function(files) {
    mapData = files[0];
    stateData = files[1];
    districtData = files[2];
    render(mapData,prepareStateData(stateData,prepareDistrictData(districtData)),wrapper);

}).catch(function(err) {
    console.log("Loading error "+err);
})



const prepareDistrictData = (data) =>{
	// console.log(data);
	const districtData = data.map((v) => { 
				return {
					id:+v.ID,
					region:v.I_REGION,
					name:v.C_NAME,
					latitude:+v.LATITUDE,
					longitude:+v.LONGITUDE
				} 
			}); 
	return districtData;
}
const prepareStateData = (data,districtData) => {
	// console.log(data);
	// console.log(districtData);
	const parseTime = d3.timeParse("%d.%m.%Y");
	const distinctDates = [...new Set(data.map( (v) => v.DATE_UPSZN ))];

	let res = distinctDates.map((v) => {
		return {
			date: parseTime(v),
			values: [],
			countAction: 0,
			countRO:0,
			countRC:0,
			countFaild:0,
			cumulaive: {
				countAction: 0,
				countRO:0,
				countRC:0,
				countFaild:0,
				valuesRC: [],		
			},
			activeDistrict: {
				current: 0,
				percent: 0
			},
			activeRegion: {
				current: 0,
				percent: 0
			},
		}
	});

	const getActiveDistrict = (value) =>{
		const ad = [...new Set(value.map( v => +(v.region+v.aria) ))];
		return ad.length+1;
	}

	const getActiveRegion = (value) =>{
		const ar = [...new Set(value.map( v => +(v.region) ))];
		return ar.length+1;
	}

	for ( const value of data ) {

		// const point = getRandomLocation(50.4345756,30.4058461,300000);
		let ll = districtData.filter( v => v.id == +(value.RR+value.AA) );
		if ( ll.length !== 1 ) {
			console.error(`Нет записи ${+(value.RR+value.AA)} для записи с ID ${value.ID} в справочнике адресов присвоены координаты по умолчанию`);
			ll = [{latitude: 50.434535, longitude: 30.4058593}];
		}

		// const point = getRandomLocation(ll[0].latitude,ll[0].longitude,80000);
		const index = distinctDates.indexOf(value.DATE_UPSZN);
		res[index].values.push({
			region: value.RR,
			aria: value.AA,
			filia: value.FFF,
			state: +value.STATE,
			type: value.C_REQUESTFILE.substring(0,2),
			latitude: ll[0].latitude,
			longitude: ll[0].longitude,

		});
		res[index].countAction++;
		if ( value.C_REQUESTFILE.substring(0,2) === 'RO' && value.STATE === "1") { res[index].countRO++ };
		if ( value.C_REQUESTFILE.substring(0,2) === 'RC' && value.STATE === "1" ) { res[index].countRC++ };
		if ( value.STATE === "-1" ) { res[index].countFaild++ };
	}
	// res.forEach( v => v.countActions = countActions[v.date]);
	res.sort((e1,e2) => {
		if (e1.date > e2.date) return 1;
		if (e1.date < e2.date) return -1;
		return 0;
	});
	res.forEach((d,i) => {
		if ( i > 0 ) {
			d.cumulaive.countAction += res[i-1].cumulaive.countAction+d.countAction;
			d.cumulaive.countRO += res[i-1].cumulaive.countRO+d.countRO;
			d.cumulaive.countRC += res[i-1].cumulaive.countRC+d.countRC;
			d.cumulaive.countFaild += res[i-1].cumulaive.countFaild+d.countFaild;	
		} else if ( i === 0 ) {
			d.cumulaive.countAction = d.countAction;
			d.cumulaive.countRO = d.countRO;
			d.cumulaive.countRC = d.countRC;
			d.cumulaive.countFaild = d.countFaild;
		}
		d.activeDistrict.current = getActiveDistrict(d.values);
		d.activeDistrict.percent = Math.round((d.activeDistrict.current/(districtData.length+1))*100);

		d.activeRegion.current = getActiveRegion(d.values);
		d.activeRegion.percent = Math.round((d.activeRegion.current/27)*100);
		

		// console.log('current = '+d.activeDistrict.current+' % = '+d.activeDistrict.percent);

	});
	// console.log(res);
	return res;
}

const render = (data,states,wrapper) => {
	document.getElementById(wrapper).innerHTML="";
	const chartWrapperWidth = document.getElementById(wrapper).clientWidth;
	const chartWrapperHeight = window.innerHeight
		|| document.documentElement.clientHeight
		|| document.body.clientHeight;
	const legendWrapperWidth = chartWrapperWidth*0.33;
	const timeLineWidth = chartWrapperWidth*0.5;
	const timeLineHeight = 100;
	const mapWrapperWidth = chartWrapperWidth*0.66;
	const mapWrapperHeight = chartWrapperHeight - timeLineHeight;
	const animationDuration = 1000;
	const animationDelay = 100;
	const dayPlayDelay = 3000;

	let legendLineStep = 30;
	const legendMarginLeft = 15;
	const legendMarginTop = 60;
	let valueMargin = 18;
	let firstCulumnOffset = 170;
	let secondCulumnOffset = 260;

	let progressBarWidth = 100;
	let progressBarHeight = 100;

	let fontSize=1;

	const rescale = (k) => {
		legendLineStep = legendLineStep*(k+0.2);
		valueMargin = valueMargin*(k+(1-k*k));
		fontSize = fontSize - (k*k);
		firstCulumnOffset = firstCulumnOffset - 100*k;
		secondCulumnOffset = secondCulumnOffset - 100*(1-k*k);
		progressBarWidth = progressBarWidth*(1-k*k);
		progressBarHeight = progressBarHeight*(1-k*k);
	
	}


	// console.log(chartWrapperWidth+"x"+chartWrapperHeight);
	if (chartWrapperWidth < 1000 || chartWrapperHeight < 600) {
		rescale(0.5);
	}
	if (chartWrapperWidth < 800 || chartWrapperHeight < 600) { 
		document.getElementById(wrapper).innerHTML="<text>Ромір вікна має бути більший ніж 800х600 px  "; 
		exit();
	}

	const formatTime = d3.timeFormat("%d.%m.%Y");
	
	const svg = d3.select('#'+wrapper).append('svg')
	    .attr('width', chartWrapperWidth)
	    .attr('height', chartWrapperHeight);
	const ukraine = topojson.feature(data, data.objects.regions);
	const ukraineRivers = topojson.feature(data, data.objects.rivers);

 	const projection = d3.geoMercator()
		.translate([mapWrapperWidth / 2, mapWrapperHeight / 2]);
 	
 	const 	bounds = d3.geoBounds(ukraine),
          	center = d3.geoCentroid(ukraine);
    // Compute the angular distance between bound corners
  	const 	distance = d3.geoDistance(bounds[0], bounds[1]),
      		scale = chartWrapperHeight / distance / Math.sqrt(2);
  // Update the projection scale and centroid
  
  	projection.scale(scale).center(center);
	const path = d3.geoPath(projection);

	const mapWrapper = svg.append("g");
    mapWrapper.selectAll('.regins')
         .data(ukraine.features)
         .enter().append("path")
         .attr("d", path)
         .attr("fill", 'gray')
         .attr("stroke",'aliceblue')
         .on("click", (d) => console.log(d));

///  title	
	svg.append('text')
		.attr('x', 40)
		.attr('y', 40)
		.text(`Дані системи моніторінго обміну з Ощадбанком для монетизації субсидій в період з ${formatTime(states[0].date)} по ${formatTime(states[states.length-1].date)}`)
		.attr('class','title-label')
		.attr('font-size',fontSize+'em');

const drawStates = (day) => {
	console.log(day);	
	document.getElementById("selected-day").textContent = formatTime(day.date);
	document.getElementById("count-actions").textContent = day.values.length;
	document.getElementById("count-RO").textContent = day.countRO;
	document.getElementById("count-RC").textContent = day.countRC;
	document.getElementById("count-faild").textContent = day.countFaild;

	document.getElementById("cumulative-start-day").textContent = formatTime(states[0].date);
	document.getElementById("cumulative-count-actions").textContent = day.cumulaive.countAction;
	document.getElementById("cumulative-count-RO").textContent = day.cumulaive.countRO;
	document.getElementById("cumulative-count-RC").textContent = day.cumulaive.countRC;
	document.getElementById("cumulative-count-faild").textContent = day.cumulaive.countFaild;

	activeDistritChart.update(day.activeDistrict.percent);
	document.getElementById("active-district-label").textContent = day.activeDistrict.current+' -> ';
	activeRegionChart.update(day.activeRegion.percent);
	document.getElementById("active-region-label").textContent = day.activeRegion.current+' -> ';
	const ROactivities = svg.selectAll('.activities')
	     		.data(day.values.filter( v => (v.type !== 'RC') || (v.type === 'RC' && v.state !== -1) ));
	
	const forRemove = ROactivities.exit()
		.transition()
			.duration(animationDuration)
			.attr('r',1)
			.remove();

     	ROactivities.enter().append("circle")
     		.attr('cx',d => projection([d.longitude,d.latitude])[0] )
     		.attr('cy',d => projection([d.longitude,d.latitude])[1] )
     		.attr('r',1)
     		.attr('fill-opacity', d => (d.state === 1) ? 0.3 : 0.2)
     		.attr('fill', (d) => {return (d.state === 1) ? 'steelblue':'red'})
     		.attr('class','activities')
	    	.transition()
		    	.delay(animationDelay*Math.random())
		    	.duration(animationDuration)
		    	.attr('r',8);
	    ROactivities
			.transition()
				.duration(animationDuration*Math.random())
				.attr("r",1)
			.transition()		
				.attr('cx',d => projection([d.longitude,d.latitude])[0] )
				.attr('cy',d => projection([d.longitude,d.latitude])[1] )
				.attr('r',1)
				.attr('fill-opacity', d => (d.state === 1) ? 0.3 : 0.2)
				.attr('fill', (d) => {return (d.state === 1) ? 'steelblue':'red'})
			.transition()
		    	.attr('r',8)
		    	// .delay(animationDelay*Math.random())
		    	.duration(animationDuration);
		
	    const RCactivities = svg.selectAll('.RC-activities')
		    	 .data(day.values.filter( v => v.type === 'RC' && v.state !== -1));
		
		RCactivities.exit()
			.transition()
				.duration(animationDuration)
				.attr('r',1)
				.remove();
		
		RCactivities.enter().append("circle")
			.attr('cx',d => projection([d.longitude,d.latitude])[0] )
			.attr('cy',d => projection([d.longitude,d.latitude])[1] )
			.attr('r',1)
			.attr('fill-opacity', d => (d.state === 1) ? 0.3 : 0.2)
			.attr('fill', d => (d.state === 1) ? 'green' : 'MediumAquaMarine')
			.attr('class','RC-activities')
			.transition()
				.attr('r',10)
				.delay(animationDelay*Math.random())
				.duration(animationDuration); 
		RCactivities
			.transition()
				.duration(animationDuration*Math.random())
				.attr("r",1)
			.transition()		
				.attr('cx',d => projection([d.longitude,d.latitude])[0] )
				.attr('cy',d => projection([d.longitude,d.latitude])[1] )
				.attr('r',1)
				.attr('fill', d => (d.state === 1) ? 'green' : 'MediumAquaMarine')
				.attr('fill-opacity', d => (d.state === 1) ? 0.3 : 0.2)
			.transition()
		    	.attr('r',10)
		    	// .delay(animationDelay*Math.random())
		    	.duration(animationDuration);
}

////// Legend /////////


const legendWrapper = svg.append("g")
	.attr('class','legend-wrapper')
	.attr("transform", "translate("+(mapWrapperWidth)+","+timeLineHeight+")");

legendWrapper.append('circle')
	.attr('cx',0)
	.attr('cy',legendMarginTop+legendLineStep*2-4)
	.attr('r',8)
	.attr('fill','steelblue')
	.attr('fill-opacity',0.5)
	.attr("font-size",fontSize+"em");
legendWrapper.append('circle')
	.attr('cx',0)
	.attr('cy',legendMarginTop+legendLineStep*3-5)
	.attr('r',10)
	.attr('fill','green')
	.attr('fill-opacity',0.5)
	.attr("font-size",fontSize+"em");
legendWrapper.append('circle')
	.attr('cx',0)
	.attr('cy',legendMarginTop+legendLineStep*4-4)
	.attr('r',8)
	.attr('fill','red')
	.attr('fill-opacity',0.5)
	.attr("font-size",fontSize+"em");

legendWrapper.append("text")
	.text("Подій: ")
	.attr("x", legendMarginLeft)
	.attr("y", legendMarginTop+legendLineStep)
	.attr("font-size",fontSize+"em");
legendWrapper.append("text")
	.text("Реестрів на відкриття: ")
	.attr("x", legendMarginLeft)
	.attr("y", legendMarginTop+legendLineStep*2)
	.attr("font-size",fontSize+"em");
legendWrapper.append("text")
	.text("Реестрів зарахувань: ")
	.attr("x", legendMarginLeft)
	.attr("y", legendMarginTop+legendLineStep*3)
	.attr("font-size",fontSize+"em");
legendWrapper.append("text")
	.text("Відхилених реестрів: ")
	.attr("x", legendMarginLeft)
	.attr("y", legendMarginTop+legendLineStep*4)
	.attr("font-size",fontSize+"em");

legendWrapper.append("text")
	.text("Станом на")
	.attr("x", legendMarginLeft+firstCulumnOffset)
	.attr("y", 20)
	.attr("font-size",fontSize+"em");

legendWrapper.append("text")
	.text("Починаючи з")
	.attr("x", legendMarginLeft+secondCulumnOffset)
	.attr("y", 20)
	.attr("font-size",fontSize+"em");

legendWrapper.append("text")
	.attr("x", legendMarginLeft+firstCulumnOffset)
	.attr("y", 20+legendLineStep)
	.attr("id", "selected-day")
	.attr("font-size",fontSize+"em");

legendWrapper.append("text")
	.attr("x", legendMarginLeft+firstCulumnOffset+valueMargin)
	.attr("y", legendMarginTop+legendLineStep)
	.attr("id", "count-actions")
	.attr("font-size",fontSize+"em");

legendWrapper.append("text")
	.attr("x", legendMarginLeft+firstCulumnOffset+valueMargin)
	.attr("y", legendMarginTop+legendLineStep*2)
	.attr("id", "count-RO")
	.attr("font-size",fontSize+"em");

legendWrapper.append("text")
	.attr("x", legendMarginLeft+firstCulumnOffset+valueMargin)
	.attr("y", legendMarginTop+legendLineStep*3)
	.attr("id", "count-RC")
	.attr("font-size",fontSize+"em");

legendWrapper.append("text")
	.attr("x", legendMarginLeft+firstCulumnOffset+valueMargin)
	.attr("y", legendMarginTop+legendLineStep*4)
	.attr("id", "count-faild")
	.attr("font-size",fontSize+"em");

legendWrapper.append("text")
	.attr("x", legendMarginLeft+secondCulumnOffset)
	.attr("y", 20+legendLineStep)
	.attr("id", "cumulative-start-day")
	.attr("font-size",fontSize+"em");

legendWrapper.append("text")
	.attr("x", legendMarginLeft+secondCulumnOffset+valueMargin)
	.attr("y", legendMarginTop+legendLineStep)
	.attr("id", "cumulative-count-actions")
	.attr("font-size",fontSize+"em");

legendWrapper.append("text")
	.attr("x", legendMarginLeft+secondCulumnOffset+valueMargin)
	.attr("y", legendMarginTop+legendLineStep*2)
	.attr("id", "cumulative-count-RO")
	.attr("font-size",fontSize+"em");

legendWrapper.append("text")
	.attr("x", legendMarginLeft+secondCulumnOffset+valueMargin)
	.attr("y", legendMarginTop+legendLineStep*3)
	.attr("id", "cumulative-count-RC")
	.attr("font-size",fontSize+"em");

legendWrapper.append("text")
	.attr("x", legendMarginLeft+secondCulumnOffset+valueMargin)
	.attr("y", legendMarginTop+legendLineStep*4)
	.attr("id", "cumulative-count-faild")
	.attr("font-size",fontSize+"em");


////// End of Legend /////////


////// Progress Bar ////////

// let progressBarWidth = 100;
// let progressBarHeight = 100;

let activeDistritChart = radialProgress('.legend-wrapper',{size: {width:progressBarWidth,height:progressBarHeight}, position: { x:legendMarginLeft+secondCulumnOffset,y:legendMarginTop+legendLineStep*5} });
legendWrapper.append("text")
	.text("Активні УПСЗН: ")
	.attr("x", legendMarginLeft)
	.attr("y", legendMarginTop+legendLineStep*5+progressBarHeight/2)
	.attr("font-size",fontSize+"em");

legendWrapper.append("text")
	.attr("x", legendMarginLeft+firstCulumnOffset+valueMargin)
	.attr("y", legendMarginTop+legendLineStep*5+progressBarHeight/2)
	.attr("id","active-district-label")
	.attr("font-size",fontSize+"em");

let activeRegionChart = radialProgress('.legend-wrapper',{size: {width:progressBarWidth,height:progressBarHeight}, position: { x:legendMarginLeft+secondCulumnOffset,y:legendMarginTop+legendLineStep*5+progressBarHeight} });
legendWrapper.append("text")
	.text("Активні регіони: ")
	.attr("x", legendMarginLeft)
	.attr("y", legendMarginTop+legendLineStep*5+progressBarHeight/2+progressBarHeight)
	.attr("font-size",fontSize+"em");


legendWrapper.append("text")
	.attr("x", legendMarginLeft+firstCulumnOffset+valueMargin)
	.attr("y", legendMarginTop+legendLineStep*5+progressBarHeight/2+progressBarHeight)
	.attr("id","active-region-label")
	.attr("font-size",fontSize+"em");



// let progress = [0,10,20,30,35,70,90,100,0];
// let state = 0;

// d3.interval(function(){
//   chart.update(progress[state])
//   state = (state + 1) % progress.length
// }, 2000);

////// End of progress Bar /////

//////// TimeLineBar /////////

const x = d3.scaleTime().range([0, timeLineWidth]);
const y = d3.scaleLog().range([timeLineHeight, 0]);

x.domain(d3.extent(states.map(v => v.date) ));
y.domain(d3.extent(states.map(v => v.countAction) ));
// console.log(d3.extent(states.map(v => v.date) ));
const barWidth = timeLineWidth/states.length-10;
const timeLineWrapper = svg
	.append('g')
	.attr('class','tl-wrapper')
	.attr("transform", "translate(50, "+(chartWrapperHeight-timeLineHeight-50)+")");
const dayBar = timeLineWrapper.selectAll(".day-bar")
		.data(states).enter()
		.append("rect")
		.style("fill", "steelblue")
		.attr("x", function(d) { return x(d.date); })
		.attr("width", barWidth )
		.attr("y", timeLineHeight)
		.attr("height", 0)
		.attr("class",(d,i) => `day-bar-${i}`)
		.on("mouseenter", (e,d) => {
			d3.select(e.srcElement)
				.style("fill-opacity","0.5");
			drawStates(d);
		})
		.on("mouseout", (e,d) => {
			d3.select(e.srcElement)
				.style("fill-opacity","1");
		});
	dayBar
		.transition()
		
		.attr("y", function(d) { return y(d.countAction); })
		.attr("height", function(d) { return timeLineHeight - y(d.countAction); })
		.delay(function (d,i) { return i*30 })
		.duration(600)

timeLineWrapper.append("g")
		.attr("transform", "translate(0," + (timeLineHeight) + ")")
		.call(d3.axisBottom(x)
			.tickFormat(d3.timeFormat("%d.%m")));

//////// End of TimeLineBar /////////
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