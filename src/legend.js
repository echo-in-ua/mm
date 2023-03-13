////// Legend /////////

const legendLineStep = 30;
const legendMarginLeft = 30;
const legendMarginTop = 60;
const valueMargin = 18;
const legendWrapper = svg.append("g")
	.attr('class','legend-wrapper')
	.attr("transform", "translate("+(mapWrapperWidth)+","+timeLineHeight+")");

legendWrapper.append('circle')
	.attr('cx',10)
	.attr('cy',legendMarginTop+legendLineStep*2-4)
	.attr('r',8)
	.attr('fill','steelblue')
	.attr('fill-opacity',0.5);
legendWrapper.append('circle')
	.attr('cx',10)
	.attr('cy',legendMarginTop+legendLineStep*3-5)
	.attr('r',10)
	.attr('fill','green')
	.attr('fill-opacity',0.5);
legendWrapper.append('circle')
	.attr('cx',10)
	.attr('cy',legendMarginTop+legendLineStep*4-4)
	.attr('r',8)
	.attr('fill','red')
	.attr('fill-opacity',0.5);

legendWrapper.append("text")
	.text("Подій: ")
	.attr("x", legendMarginLeft)
	.attr("y", legendMarginTop+legendLineStep);
legendWrapper.append("text")
	.text("Реестрів на відкриття: ")
	.attr("x", legendMarginLeft)
	.attr("y", legendMarginTop+legendLineStep*2);
legendWrapper.append("text")
	.text("Реестрів зарахувань: ")
	.attr("x", legendMarginLeft)
	.attr("y", legendMarginTop+legendLineStep*3);
legendWrapper.append("text")
	.text("Відхилених реестрів: ")
	.attr("x", legendMarginLeft)
	.attr("y", legendMarginTop+legendLineStep*4);

legendWrapper.append("text")
	.text("Станом на")
	.attr("x", legendMarginLeft+170)
	.attr("y", 20);

legendWrapper.append("text")
	.text("Починаючи з")
	.attr("x", legendMarginLeft+260)
	.attr("y", 20);

legendWrapper.append("text")
	.attr("x", legendMarginLeft+170)
	.attr("y", 20+legendLineStep)
	.attr("id", "selected-day");

legendWrapper.append("text")
	.attr("x", legendMarginLeft+170+valueMargin)
	.attr("y", legendMarginTop+legendLineStep)
	.attr("id", "count-actions");

legendWrapper.append("text")
	.attr("x", legendMarginLeft+170+valueMargin)
	.attr("y", legendMarginTop+legendLineStep*2)
	.attr("id", "count-RO");

legendWrapper.append("text")
	.attr("x", legendMarginLeft+170+valueMargin)
	.attr("y", legendMarginTop+legendLineStep*3)
	.attr("id", "count-RC");

legendWrapper.append("text")
	.attr("x", legendMarginLeft+170+valueMargin)
	.attr("y", legendMarginTop+legendLineStep*4)
	.attr("id", "count-faild");

legendWrapper.append("text")
	.attr("x", legendMarginLeft+260)
	.attr("y", 20+legendLineStep)
	.attr("id", "cumulative-start-day");

legendWrapper.append("text")
	.attr("x", legendMarginLeft+260+valueMargin)
	.attr("y", legendMarginTop+legendLineStep)
	.attr("id", "cumulative-count-actions");

legendWrapper.append("text")
	.attr("x", legendMarginLeft+260+valueMargin)
	.attr("y", legendMarginTop+legendLineStep*2)
	.attr("id", "cumulative-count-RO");

legendWrapper.append("text")
	.attr("x", legendMarginLeft+260+valueMargin)
	.attr("y", legendMarginTop+legendLineStep*3)
	.attr("id", "cumulative-count-RC");

legendWrapper.append("text")
	.attr("x", legendMarginLeft+260+valueMargin)
	.attr("y", legendMarginTop+legendLineStep*4)
	.attr("id", "cumulative-count-faild");

////// End of Legend /////////