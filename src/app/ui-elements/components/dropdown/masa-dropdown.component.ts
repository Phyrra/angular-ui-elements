import { Component, OnInit } from '@angular/core';
import { HostListener, ElementRef } from '@angular/core';
import { Input, Output, EventEmitter } from '@angular/core';
import { ContentChild, TemplateRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { forwardRef } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import * as _ from 'lodash';

const DROPDOWN_VALUE_ACCESSOR = {
	name: 'masaDropdownValueAccessor',
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => MasaDropdownComponent),
	multi: true
};

@Component({
	selector: 'masa-dropdown',
	templateUrl: './masa-dropdown.component.html',
	styleUrls: ['./masa-dropdown.component.scss'],
	providers: [
		DROPDOWN_VALUE_ACCESSOR
	]
})
export class MasaDropdownComponent implements OnInit, ControlValueAccessor {
	@Input() placeholder: string;
	@Input() data: any;
	@Input() search: string[];
	@Input() noSearch: number = 0;
	@Input() disabled: boolean;

	@ContentChild(TemplateRef) template;
	@ContentChild('option', { read: TemplateRef }) option;
	@ContentChild('display', { read: TemplateRef }) display;

	private onModelChange: Function;

	isOpen: boolean = false;
	selectedItem: any;
	searchTerm: string;

	filteredData: any;

	isGrouped: boolean;
	showSearch: boolean;

	currentIdx: number = -1;

	constructor(private elementRef: ElementRef) { }

	registerOnTouched(fn: Function): void {
		// ignore
	}

	registerOnChange(fn: Function): void {
		this.onModelChange = fn;
	}

	writeValue(item: any): void {
		if (!this.selectedItem || (item || {}).id !== this.selectedItem.id) {
			this.onSelect(item);
		}
	}

	@HostListener('focus') onFocus(): void {
		this.onOpen();
	}

	@HostListener('document:click', ['$event.target']) onOutsideClick(targetElement: any): void {
		const clickInside = this.elementRef.nativeElement.contains(targetElement);

		if (!clickInside) {
			this.onClose();
		}
	}

	@HostListener('document:keydown', ['$event']) onKeyClick($event: KeyboardEvent): void {
		if (this.isOpen) {
			switch ($event.which) {
				case 27: // ESC
					this.onClose();

					break;
				case 13: // ENTER
					this.onSelectCurrent();

					break;
				case 38: // UP
					this.onNavigateSelection(-1);

					break;
				case 40: // DOWN
					this.onNavigateSelection(1);

					break;
				default:
					console.log($event.which);
			}
		}
	}

	ngOnInit(): void {
		this.isGrouped = this.isGroup();
		this.onChangeSearch();
		this.showSearch = this.shouldShowSearch();
	}

	onToggle(): void {
		if (this.disabled) {
			return;
		}

		this.isOpen = !this.isOpen;

		if (this.isOpen) {
			this.evaluateCurrentIndex();
		}
	}

	onOpen(): void {
		if (this.disabled) {
			return;
		}

		this.isOpen = true;
		this.evaluateCurrentIndex();
	}

	private evaluateCurrentIndex(): void {
		if (this.selectedItem) {
			this.currentIdx = this.selectedItem.idx;
		} else {
			this.currentIdx = -1;
		}
	}

	onClose(): void {
		this.isOpen = false;
	}

	onSelect(item: any): void {
		this.selectedItem = item;

		if (this.onModelChange) {
			this.onModelChange(item);
		}

		this.onClose();
	}

	onMouseEnter(item: any): void {
		this.currentIdx = item.idx;
	}

	onMouseLeave(): void {
		this.currentIdx = -1;
	}

	onSelectCurrent(): void {
		if (this.currentIdx === -1) {
			return;
		}

		this.onSelect(
			this.getAllItems(this.filteredData)
				.find(elem => elem.idx === this.currentIdx)
		);
	}

	onNavigateSelection(direction: number) {
		setTimeout(() => {
			this.currentIdx = Math.max(
				0,
				Math.min(
					this.currentIdx + direction,
					this.getMaxItems(this.filteredData) - 1
				)
			);
		});
	}

	onChangeSearch(): void {
		this.currentIdx = -1;

		if (!this.searchTerm) {
			this.filteredData = this.data;
			this.numberFilteredItems();

			return;
		}

		if (this.isGrouped) {
			this.filteredData = this.data
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
			this.filteredData = this.filterItems(this.data);
		}

		this.numberFilteredItems();
	}

	private filterItems(items: any[]): any[] {
		const lowerSearch = this.searchTerm.toLocaleLowerCase();

		return items.filter(item => {
			return this.search.some(key => {
				return (_.get(item, key) || '').toString().toLocaleLowerCase().indexOf(lowerSearch) > -1;
			});
		});
	}

	private numberFilteredItems(): void {
		this.getAllItems(this.filteredData)
			.forEach((item, idx) => item.idx = idx);
	}

	private isGroup(): boolean {
		if (!this.data || this.data.length === 0) {
			return false;
		}

		const probe = this.data[0];

		return _.has(probe, 'title') && _.has(probe, 'items');
	}

	private shouldShowSearch(): boolean {
		if (!this.search) {
			return false;
		}

		if (this.noSearch === 0) {
			return true;
		}

		return this.noSearch < this.getMaxItems(this.data);
	}

	private getMaxItems(data: any): number {
		return this.getAllItems(data).length;
	}

	private getAllItems(data: any): any[] {
		if (this.isGrouped) {
			return data.reduce((accumulator, group) => {
				return accumulator.concat(group.items);
			}, []);
		} else {
			return data;
		}
	}
}
