import * as d3 from "d3";
const generalTable = () => {
	const formatTime = d3.timeFormat("%d.%m.%Y");

	const table = d3.select('#extra-content-1').append('table');
	const drawRow = (parrent,text,id) => {
		const r1 = table.append('tr')
    	r1.append('td')
    		.text(text[0])
    		.attr('id',id[0])
    	r1.append('td')
    		.text(text[1])
    		.attr('id',id[1])
    	r1.append('td')
			.text(text[2])
			.attr('id',id[2])	    	
    	r1.append('td')
    		.text(text[3])
    		.attr('id',id[3])	
	}
	drawRow(table,[,,'Станом на','Починаючи з'],[]);
	drawRow(table,[,,,],[,,'selected-day','cumulative-start-day']);
	drawRow(table,[,'Подій:',,],[,,'count-actions','cumulative-count-actions']);
	drawRow(table,[,'Реестрів на відкриття RO:',,],['legent-count-RO',,'count-RO','cumulative-count-RO']);
	drawRow(table,[,'Реестрів зарахуван RC:',,],['legend-count-RC',,'count-RC','cumulative-count-RC']);
	drawRow(table,[,'Відхилених реестрів:',,],['legend-count-faild',,'count-faild','cumulative-count-faild']);

	d3.select('#legent-count-RO').append('svg').attr('width', 20).attr('height', 20)
		.append('circle')
		.attr('cx',10)
		.attr('cy',10)
		.attr('r',8)
		.attr('fill','steelblue')
		.attr('fill-opacity',0.5);
	d3.select('#legend-count-RC').append('svg').attr('width', 20).attr('height', 20)
		.append('circle')
		.attr('cx',10)
		.attr('cy',10)
		.attr('r',10)
		.attr('fill','green')
		.attr('fill-opacity',0.5);
	d3.select('#legend-count-faild').append('svg').attr('width', 20).attr('height', 20)
		.append('circle')
		.attr('cx',10)
		.attr('cy',10)
		.attr('r',8)
		.attr('fill','red')
		.attr('fill-opacity',0.5);

	const update = (day) => {
		
		const activeDistrictPercent = day.activeDistrict.percent;
		const activeRegionPercent = day.activeRegion.percent;
		const selectedDay = formatTime(day.date);
		const cumulativeStartDay = formatTime(day.cumulative.startDay);
		const countAction = day.countAction;
		const cumulativeCountActions = day.cumulative.countAction;
		const countRO = day.countRO;
		const cumulativeCountRO = day.cumulative.countRO
		const countRC = day.countRC;
		const cumulativeCountRC = day.cumulative.countRC;
		const countFaild = day.countFaild;
		const cumulaiveCountFaild = day.cumulative.countFaild;

		document.getElementById("selected-day").textContent = selectedDay;
		document.getElementById("count-actions").textContent = countAction;
		document.getElementById("count-RO").textContent = countRO;
		document.getElementById("count-RC").textContent = countRC;
		document.getElementById("count-faild").textContent = countFaild;

		document.getElementById("cumulative-start-day").textContent = cumulativeStartDay;
		document.getElementById("cumulative-count-actions").textContent = cumulativeCountActions;
		document.getElementById("cumulative-count-RO").textContent = cumulativeCountRO;
		document.getElementById("cumulative-count-RC").textContent = cumulativeCountRC;
		document.getElementById("cumulative-count-faild").textContent = cumulaiveCountFaild;
	}

	return { update: update }
}

export { generalTable };