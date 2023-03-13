import * as d3 from "d3";
import 'datatables.net';
// import 'datatables.net-dt';
import * as $ from 'jquery';
import 'datatables.net-dt/css/jquery.dataTables.css';


const stateTable = () => {
		const tableWrapper = d3.select('#main-content-1')
			.append('div')
			.attr('class','table-responsive');
		const table = tableWrapper.append('table')
			.attr('id','state-table')
			.attr('class','table table-striped')
			// .attr('class','table-striped');
		const headerRow = table.append('thead').append('tr');
		// headerRow.append('th')
		// 	.text('№');
		headerRow.append('th')
			.text('УПСЗН');
		headerRow.append('th')
			.text('Філія');
		headerRow.append('th')
			.text('Тип реєстру');
		headerRow.append('th')
			.text('Статус');
		const tbody = table.append('tbody');

	return {
		update: (day) => {
			if (day) {
				if ($.fn.dataTable.isDataTable('#state-table')) {
			        $('#state-table').DataTable().destroy();
			    }
				$('#state-table').DataTable({
					data: day.values,
					columns: [
						{data: 'name'},
						{data: 'filia'},
						{data: 'type'},
						{data: 'state'}
					],
					language: {
				        search: 		"Пошук:",
				        info:           "Записи з _START_ по _END_ із _TOTAL_",
				        infoEmpty: 		"Записи відсутні",
				        paginate: {
								        first:      "Перший",
								        last:       "Останній",
								        next:       "Наступний",
								        previous:   "Попередній"
								    },
						lengthMenu:     "Показувати _MENU_ записів",
						emptyTable: 	"Дані відсутні"
				    },
					destroy: true
				})
			}
		}
	}
}
// const stateTable = () => {
// 	d3.select('#state-table').remove();
// 	const tableWrapper = d3.select('#main-content-1').append('div')
// 		.attr('class','table-responsive');
// 	const table = tableWrapper.append('table')
// 		.attr('id','state-table')
// 		.attr('class','table table-striped')
// 		// .attr('class','table-striped');
// 	const headerRow = table.append('thead').append('tr');
// 	headerRow.append('th')
// 		.text('№');
// 	headerRow.append('th')
// 		.text('УПСЗН');
// 	headerRow.append('th')
// 		.text('Філія');
// 	headerRow.append('th')
// 		.text('Тип реєстру');
// 	headerRow.append('th')
// 		.text('Статус');

// 	const tbody = table.append('tbody');
// 	const drawRow = (text) => {
// 		const r = tbody.append('tr')
//     	r.append('td')
//     		.text(text[0])
//     	r.append('td')
//     		.text(text[1])
//     	r.append('td')
// 			.text(text[2])
//     	r.append('td')
//     		.text(text[3])
//     		.attr('class','align-middle')
//     	r.append('td')
//     		.text(text[4])
//     		.attr('class','align-middle');
    	
// 	}

// 	const update = (day) => {
//         d3.selectAll('#state-table tbody tr').remove();
//         day.values.forEach( (v,i) => {
//             drawRow([(i+1),v.name,v.filia,v.type,v.state]);
//         } );
//         // const rows = tbody.selectAll('.rows')
//         // 	.data(day.values)
//         // 	.enter().append('tr');
//     }
//     return {
//         update: update
//     }
// }

export { stateTable };