import * as d3 from "d3";

const export drawStates = (day) => {
	
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