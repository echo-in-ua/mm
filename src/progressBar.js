import * as d3 from "d3";

const radialProgress = (parrent,options) => {

  const size = options.size
  const wrapper = d3.select(parrent).append('g')
    .attr('transform',`translate(${options.position.x},${options.position.y})`)
  const outerRadius = Math.min(size.width, size.height) * 0.45;
  const thickness = 10;
  let value = 0;
  const mainArc = d3.arc()
    .startAngle(0)
    .endAngle(Math.PI * 2)
    .innerRadius(outerRadius-thickness)
    .outerRadius(outerRadius)

  wrapper.append("path")
    .attr('class', 'progress-bar-bg')
    .attr('transform', `translate(${size.width/2},${size.height/2})`)
    .attr('d', mainArc())
  
  const mainArcPath = wrapper.append("path")
    .attr('class', 'progress-bar')
    .attr('transform', `translate(${size.width/2},${size.height/2})`)
  
  wrapper.append("circle")
    .attr('class', 'progress-bar')
    .attr('transform', `translate(${size.width/2},${size.height/2-outerRadius+thickness/2})`)
    .attr('width', thickness)
    .attr('height', thickness)
    .attr('r', thickness/2)

  const end = wrapper.append("circle")
    .attr('class', 'progress-bar')
    .attr('transform', `translate(${size.width/2},${size.height/2-outerRadius+thickness/2})`)
    .attr('width', thickness)
    .attr('height', thickness)
    .attr('r', thickness/2)
  
  let percentLabel = wrapper.append("text")
    .attr('class', 'progress-label')
    .attr('transform', `translate(${size.width/2},${size.height/2})`)
    .text('0')

  return {
    update: function(progressPercent) {
      const startValue = value
      const startAngle = Math.PI * startValue / 50
      const angleDiff = Math.PI * progressPercent / 50 - startAngle;
      const startAngleDeg = startAngle / Math.PI * 180
      const angleDiffDeg = angleDiff / Math.PI * 180
      const transitionDuration = 1500

      mainArcPath.transition().duration(transitionDuration).attrTween('d', function(){
        return function(t) {
          mainArc.endAngle(startAngle + angleDiff * t)
          return mainArc();
        }
      })
      end.transition().duration(transitionDuration).attrTween('transform', function(){
        return function(t) {
          return `translate(${size.width/2},${size.height/2})`+
            `rotate(${(startAngleDeg + angleDiffDeg * t)})`+
            `translate(0,-${outerRadius-thickness/2})`
        }
      })
      percentLabel.transition().duration(transitionDuration).tween('bla', function() {
        return function(t) {
          percentLabel.text(Math.round(startValue + (progressPercent - startValue) * t)+'%');
        }
      })
      value = progressPercent
    }
  }
}

export { radialProgress };