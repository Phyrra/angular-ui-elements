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

	onValueSelected(item): void {
		console.log(item);
	}
}
