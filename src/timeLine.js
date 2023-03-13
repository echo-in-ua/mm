import * as d3 from "d3";
import { Subject } from './Subject.js';
import '@babel/polyfill';


const timeLine = (data,timeLineWidth,timeLineHeight) => {
	const changeDaySubject = new Subject();
	const timeLineInnerWidth = timeLineWidth - 30;
	const timeLineInnerHeight = timeLineHeight-50;
	const x = d3.scaleTime().range([0, timeLineInnerWidth]);
	const y = d3.scaleLog().range([timeLineInnerHeight, 0]);

	x.domain(d3.extent(data.map(v => v.date) ));
	y.domain(d3.extent(data.map(v => v.countAction) ));
	// console.log(d3.extent(states.map(v => v.date) ));
	const barWidth = timeLineWidth/data.length-10;
	const timeLineWrapperSvg = d3.select('#main-content-2-2')
		.append('svg')
			.attr('width', timeLineWidth)
	   		.attr('height', timeLineHeight);
   	const timeLineWrapper = timeLineWrapperSvg
			.append('g')
			.attr('class','tl-wrapper')
			.attr("transform", "translate(0,0)");
	const dayBar = timeLineWrapper.selectAll(".day-bar")
			.data(data).enter()
			.append("rect")
			.style("fill", "steelblue")
			.attr("x", function(d) { return x(d.date); })
			.attr("width", barWidth )
			.attr("y", timeLineInnerHeight)
			.attr("height", 0)
			.attr("class",(d,i) => `day-bar-${i}`)
			.on("mouseenter", (e,d) => {
				console.log(d3.timeFormat("%d-%m-%Y")(d.date));
				player.stop();
				const playButton = document.getElementById('play-by-day-button');
				playButton.setAttribute('aria-pressed','false');
				playButton.setAttribute('class','btn btn-sm btn-outline-secondary');
				changeSelectedBar(e.srcElement);
				// selectedDay = d.date;
				// // console.log(selectedRegion);
				// reRander(d);
				changeDaySubject.notify(d.date,'DAY');
									
			});
		dayBar
			.transition()
			
			.attr("y", function(d) { return y(d.countAction); })
			.attr("height", function(d) { return timeLineInnerHeight - y(d.countAction); })
			.delay(function (d,i) { return i*30 })
			.duration(600)

	timeLineWrapper.append("g")
			.attr("transform", "translate(0," + (timeLineInnerHeight) + ")")
			.call(d3.axisBottom(x)
				.tickFormat(d3.timeFormat("%d.%m")));
	const changeSelectedBar = (dayBarElement) => {
		d3.selectAll(".tl-wrapper rect")
			.style("fill-opacity","1");
		d3.select(dayBarElement)
			.style("fill-opacity","0.5");
	}

	const playByDay = () => {
		const dayPlayDelay = 3000;
		let stopFlag = false;
		function timer(ms) {
			return new Promise(res => setTimeout(res, ms));
		}
		async function play() {
			stopFlag = false;
			for (let day of data) {
				if ( stopFlag ) { break; }
				changeDaySubject.notify(day.date,'DAY');
				changeSelectedBar(data.findIndex(d => d.date === day.date));
				await timer(dayPlayDelay);
				
			}
		}
		function stop () {
			stopFlag = true;
			// d3.select('#play-by-day-button')
			// 	.attr('aria-pressed','false')
			// 	.attr('class','btn btn-sm btn-outline-secondary');
			// const playButton = document.getElementById('play-by-day-button');
			// playButton.setAttribute('aria-pressed','false');
			// playButton.setAttribute('class','btn btn-sm btn-outline-secondary');
		}
		return {
			play: play,
			stop: stop
		}
	}
	const player = playByDay();
	const controlButtons = () => {
		d3.select('#main-content-2-1')
			.append('div')
				.attr('class','h-100 d-flex justify-content-center align-items-center')
				.append('button')
					.attr('id','play-by-day-button')
					.attr('type','button')
					.attr('data-toggle','button')
					.attr('aria-pressed','false')
					.attr('class','btn btn-sm btn-outline-secondary')
					.text('По днях')
					.on('click',() => {
						if ( d3.select('#play-by-day-button').attr('aria-pressed') === 'false' ) {
							player.play();
						} else {
							player.stop();
						}
					})
					.append('span')
						.attr('class','glyphicon glyphicon-play')
						.attr('aria-hidden','true');

	}

	controlButtons();
	return changeDaySubject;
}

export { timeLine};