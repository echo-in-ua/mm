import { Subject } from './Subject.js';

class State extends Subject {
  constructor(d) {
  	super();
    this.data = d;
    this.selectedDay = 0;
    this.selectedRegion = 0;
  }

  changeCurrentDay (day) {
  	const filteredDay = this.data.filter( v => v.date === day )[0]
  	const selectedRegion = this.selectedRegion;
    if ( filteredDay ) {
      filteredDay.cumulative.startDay = this.data[0].date;
      this.currentState = ( this.selectedRegion === 0 ) ? filteredDay : {...filteredDay,values: filteredDay.values.filter( v => +v.region === +selectedRegion ) };
    } 
    return this.currentState;
  }

  getCurrentState () {
    return this.currentState;
  }

 //  changeRegion  (r) {
	// 	const day = ( this.selectedDay === 0 ) ?  this.data : this.changeCurrentDay(this.selectedDay);
	// 	const filteredDay = day.values.filter( v => +v.region == r );
	// 	this.currentState = filteredDay;
	// 	return filteredDay;
	// }
  update (context,message) {
  	switch (message) {
  		case 'DAY':
  			this.selectedDay = context;
  			this.notify(this.changeCurrentDay(this.selectedDay),'DAY');		
  			break;
  		case 'REGION':
  			this.selectedRegion = context;
  			if ( this.selectedDay !== 0 ) {
          this.notify(this.changeCurrentDay(this.selectedDay),'REGION');
        }	
  			// this.notify(this.changeRegion(this.selectedRegion),'REGION');
  	}
  }
 }

export { State };