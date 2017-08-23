import { Component, OnInit } from '@angular/core';
import { HostListener, ElementRef } from '@angular/core';
import { Input, Output, EventEmitter } from '@angular/core';
import { ContentChild, TemplateRef } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import * as _ from 'lodash';

@Component({
	selector: 'masa-dropdown',
	templateUrl: './masa-dropdown.component.html',
	styleUrls: ['./masa-dropdown.component.scss'],
})
export class MasaDropdownComponent implements OnInit {
	@Input() placeholder: string;
	@Input() data: any;
	@Input() search: string[];
	@Input() noSearch: number = 0;
	@Input() disabled: boolean;
	@Output() onChange = new EventEmitter<any>();

	@ContentChild(TemplateRef) option;

	isOpen: boolean = false;
	selectedItem: any;
	searchTerm: string;

	resolvedData: any;
	filteredItems: any;

	isGrouped: boolean;
	showSearch: boolean;

	constructor(private elementRef: ElementRef) { }

	@HostListener('document:click', ['$event.target']) onOutsideClick(targetElement: any): void {
		const clickInside = this.elementRef.nativeElement.contains(targetElement);

		if (!clickInside) {
			this.isOpen = false;
		}
	}

	ngOnInit(): void {
		if (this.data instanceof Observable) {
			this.data.subscribe(data => this.init(data));
		} else {
			this.init(this.data);
		}
	}

	private init(data: any): void {
		this.resolvedData = data;
		this.filteredItems = data;

		this.isGrouped = this.isGroup();
		this.showSearch = this.shouldShowSearch();
	}

	onToggle(): void {
		if (this.disabled) {
			return;
		}

		this.isOpen = !this.isOpen;
	}

	onClose(): void {
		this.isOpen = false;
	}

	onSelect(item): void {
		this.onClose();
		this.selectedItem = item;

		this.onChange.emit(item);
	}

	onChangeSearch(): void {
		if (!this.searchTerm) {
			this.filteredItems = this.resolvedData;

			return;
		}

		if (this.isGrouped) {
			this.filteredItems = this.resolvedData
				.map(group => {
					return {
						title: group.title,
						items: group.items
					};
				})
				.filter(group => {
					group.items = this.filterItems(group.items);

					return group.items.length > 0;
				});
		} else {
			this.filteredItems = this.filterItems(this.resolvedData);
		}
	}

	private filterItems(items: any[]): any[] {
		const lowerSearch = this.searchTerm.toLocaleLowerCase();

		return items.filter(item => {
			return this.search.some(key => {
				return (_.get(item, key) || '').toString().toLocaleLowerCase().indexOf(lowerSearch) > -1;
			});
		});
	}

	private isGroup(): boolean {
		if (!this.resolvedData || this.resolvedData.length === 0) {
			return false;
		}

		const probe = this.resolvedData[0];

		return _.has(probe, 'title') && _.has(probe, 'items');
	}

	private shouldShowSearch(): boolean {
		if (!this.search) {
			return false;
		}

		if (this.noSearch === 0) {
			return true;
		}

		if (this.isGrouped) {
			return this.noSearch < this.resolvedData.reduce((accumulator, group) => {
				return accumulator.concat(group.items);
			}, []).length;
		} else {
			return this.noSearch < this.resolvedData.length;
		}
	}
}
