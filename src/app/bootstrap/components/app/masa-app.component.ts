import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

@Component({
	selector: 'masa-app',
	templateUrl: './masa-app.component.html',
	styleUrls: ['./masa-app.component.scss']
})
export class MasaAppComponent implements OnInit {
	someData: any[] = [{
		id: 1,
		name: 'A'
	}, {
		id: 2,
		name: 'B'
	}, {
		id: 3,
		name: 'C'
	}, {
		id: 4,
		name: 'D'
	}, {
		id: 5,
		name: 'E'
	}, {
		id: 6,
		name: 'F'
	}, {
		id: 7,
		name: 'G'
	}];

	someGroupedData: any[] = [{
		title: 'Group 1',
		items: [{
			id: 1,
			name: 'A'
		}, {
			id: 2,
			name: 'B'
		}]
	}, {
		title: 'Group 2',
		items: [{
			id: 3,
			name: 'C'
		}]
	}];

	someComplexData: any[] = [{
		title: 'Hans Muster',
		items: [{
			id: 1,
			accountOwner: 'Hans Muster',
			accountNumber: '520.184.004',
			accountName: 'Erbschaft',
			saldo: -215.66
		}, {
			id: 2,
			accountOwner: 'Hans Muster',
			accountNumber: '520.184.300',
			accountName: 'Familie',
			saldo: 13023
		}]
	}, {
		title: 'Eva Loveless',
		items: [{
			id: 3,
			accountOwner: 'Eva Loveless',
			accountNumber: '123.456.001',
			accountName: 'Hauptkonto',
			saldo: 123235
		}, {
			id: 4,
			accountOwner: 'Eva Loveless',
			accountNumber: '123.456.002',
			accountName: 'Zweitkonto',
			saldo: 0
		}]
	}];

	someAsyncData: any[];

	ngOnInit(): void {
		Observable.of(
			[{
				id: 1,
				name: 'A'
			}, {
				id: 2,
				name: 'B'
			}, {
				id: 3,
				name: 'C'
			}]
		)
		.subscribe(data => this.someAsyncData = data);
	}

	onValueSelected(item: any): void {
		console.log(item);
	}
}
