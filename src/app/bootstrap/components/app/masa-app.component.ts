import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/delay';

@Component({
	selector: 'masa-app',
	templateUrl: './masa-app.component.html',
	styleUrls: ['./masa-app.component.scss']
})
export class MasaAppComponent implements OnInit {
	value1: string;
	value2: string;

	item1: any;
	item2: any;
	item3: any;
	item4: any;
	item5: any;
	item6: any;

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
	}, {
		id: 8,
		name: 'H'
	}, {
		id: 9,
		name: 'I'
	}, {
		id: 10,
		name: 'J'
	}, {
		id: 11,
		name: 'K'
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

	autocompleteSource(text: string): Observable<any> {
		return Observable.of(
			[
				{ name: 'Albert Assler', abbreviation: 'AA' },
				{ name: 'Berta Bloomberg', abbreviation: 'BB' },
				{ name: 'Charles Costanza', abbreviation: 'CC' },
				{ name: 'Donald Duck', abbreviation: 'DD' },
				{ name: 'Erwin Ernst', abbreviation: 'EE' },
				{ name: 'Felix Fuchs', abbreviation: 'FF' },
				{ name: 'Gustav Gans', abbreviation: 'GG' },
				{ name: 'Herbert Hollinger', abbreviation: 'HH' },
				{ name: 'Ingo Itzwin', abbreviation: 'II' }
			]
			.filter(user => {
				const lowerSearch = (text || '').toLowerCase();

				return user.name.toLowerCase().includes(lowerSearch) ||
						user.abbreviation.toLowerCase().includes(lowerSearch);
			})
		)
		.delay(1000);
	}

	userToString(user: any): string {
		return `${user.name} (${user.abbreviation})`;
	}
}
