import * as d3 from "d3";

const prepareRegionMappingData = (data) => {
	const regionMapping = data.map( (v) => {
		return {
			id:v.ID,
			geo_id:v.geo_id 
		}
	} );
	return regionMapping;
}
const prepareDistrictData = (data) =>{
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
			cumulative: {
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
			ll = [{latitude: 50.434535, longitude: 30.4058593,name: 'Не знайдено'}];
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
			name: ll[0].name,

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
			d.cumulative.countAction += res[i-1].cumulative.countAction+d.countAction;
			d.cumulative.countRO += res[i-1].cumulative.countRO+d.countRO;
			d.cumulative.countRC += res[i-1].cumulative.countRC+d.countRC;
			d.cumulative.countFaild += res[i-1].cumulative.countFaild+d.countFaild;	
		} else if ( i === 0 ) {
			d.cumulative.countAction = d.countAction;
			d.cumulative.countRO = d.countRO;
			d.cumulative.countRC = d.countRC;
			d.cumulative.countFaild = d.countFaild;
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

export  { prepareDistrictData,prepareStateData,prepareRegionMappingData };


