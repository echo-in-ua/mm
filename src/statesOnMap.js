import * as d3 from "d3";

const statesOnMap = () => {

	const animationDuration = 1000;
	const animationDelay = 100;
	const dayPlayDelay = 3000;
	const update =(day,projection) => {

		const ROactivities = d3.select('#map-svg').selectAll('.activities')
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
			
		    const RCactivities = d3.select('#map-svg').selectAll('.RC-activities')
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
	return { update: update}
}

export { statesOnMap }
