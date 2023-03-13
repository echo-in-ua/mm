import * as d3 from "d3";
import * as topojson from "topojson";
import { Subject } from './Subject.js';
import { prepareRegionMappingData} from './prepareData.js';

const regionUrl = '../dataSets/regions.csv';

let regionMapping;

d3.csv(regionUrl)
	.then(function(data) { 
		regionMapping = prepareRegionMappingData(data);
	 });

const map = ( mapWidth, mapHeight) => {
	
	const changeRegionSubject = new Subject();
	
	const regionByGeoRegion = ( r ) => {
    	return regionMapping.find (v => v.geo_id === r).id;
    }

	const svg = d3.select('#main-content-1').append('svg')
	    .attr('width', mapWidth)
	    .attr('height', mapHeight)
	    .attr('id','map-svg');
	const mapWrapper = svg.append("g");

	let projection;
	let fullMapData;

	const getProjection = () => {return projection;}
	const setBackward = (regionName) =>{
		d3.select('#main-content-header-1')
			.append('button')
				.attr('type','button')
				.attr('class','btn btn-sm btn-outline-secondary')
				.text('Назад')
				.on('click',(d) => {
					update(fullMapData);
				});
		d3.select('#main-content-header-2')
			.append('div')
			.attr('class','d-flex justify-content-center')
				.append('text')
				.text(regionName);
	}
	const removeBackwards = () => {
		d3.select('#main-content-header-1 button').remove();
		d3.select('#main-content-header-2 text').remove();
	}
	const update = (data) => {
		projection = d3.geoMercator()
			.translate([mapWidth / 2, mapHeight / 2]);
	 	const 	bounds = d3.geoBounds(data),
	          	center = d3.geoCentroid(data);
	    // Compute the angular distance between bound corners
	  	const 	distance = d3.geoDistance(bounds[0], bounds[1]),
	  			// mapDomain = ( mapWidth > mapHeight) ? mapWidth : mapHeight,
	     //  		scale = ( data.features.length ==! 1 ) ? mapDomain / distance : mapDomain / distance / Math.sqrt(2);
	     		scale = mapHeight / distance / Math.sqrt(2);
	  // Update the projection scale and centroid
	  
	  	projection.scale(scale).center(center);
		const path = d3.geoPath(projection);
	   	mapWrapper.selectAll('.regions').remove();
	    const mapChart = mapWrapper.selectAll('.regions')
	         .data(data.features);
	    // mapChart.exit().remove();
	    mapChart
	         .enter().append("path")
	         .attr("d", path)
	         .attr("fill", 'gray')
	         .attr("stroke",'aliceblue')
	         .attr("class","regions")
	         .on("click", (d) => {
		         	// mapDraw(mapWrapper,{type:'FeatureCollection',features:[d]});
		         	if ( data.features.length !== 1 ) {
		         		update({ type:'FeatureCollection',features:[d] });
		         		setBackward(d.properties.localized_name.ua);
		         		changeRegionSubject.notify(regionByGeoRegion(d.id),'REGION');
		         	}
	         	});
	    if ( data.features.length !== 1 ) {
			fullMapData = data;
			changeRegionSubject.notify(0,'REGION');
			removeBackwards();
		}
	}

	return { update: update , changeRegionSubject: changeRegionSubject, getProjection: getProjection};

} 

export { map };  