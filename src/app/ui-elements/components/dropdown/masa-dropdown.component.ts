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

	private onTouch: Function;
	private onModelChange: Function;

	isOpen: boolean = false;
	selectedItem: any;
	searchTerm: string;

	filteredData: any;

	isGrouped: boolean;
	showSearch: boolean;

	currentIdx: number = -1;

	/**
	 * Constructor of the Component
	 *
	 * @constructor
	 * @param {ElementRef} elementRef - the reference of the element
	 */
	constructor(private elementRef: ElementRef) { }

	/**
	 * Register callback for ControlValueAccessor onTouch,
	 * sets the function to be called when the element is touched
	 *
	 * @param {Function} fn - the function to be called
	 */
	registerOnTouched(fn: Function): void {
		this.onTouch = fn;
	}

	/**
	 * Register callback for ControlValueAccessor onChange,
	 * sets the function to be called when the value within is changed
	 *
	 * @param {Function} fn - the funciton to be called
	 */
	registerOnChange(fn: Function): void {
		this.onModelChange = fn;
	}

	/**
	 * Writes the interal value when the model is changed from the outside
	 *
	 * @param {any} item - the item to be selected
	 */
	writeValue(item: any): void {
		const id: any = (item || {}).id;

		if (!this.selectedItem || this.selectedItem.id !== id) {
			const realItem = this.getAllItems(this.data)
				.find(elem => elem.id === id);

			this.onSelect(realItem);
		}
	}

	/**
	 * Handles keyboard events,
	 * results may differe whether the dropdown is open or not.
	 * Will not get evaluated for disabled dropdowns.
	 *
	 * @param {KeyboardEvent} $event - the keyboard event
	 */
	onWrapperKeydown($event: KeyboardEvent): void {
		if (this.disabled) {
			return;
		}

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
			}
		} else {
			switch ($event.which) {
				case 13: // ENTER
					this.onOpen();

					break;
				case 38: // UP
					this.onNavigateSelection(-1);
					this.onSelectCurrent();

					break;
				case 40: // DOWN
					console.log('hier');
					this.onNavigateSelection(1);
					this.onSelectCurrent();

					break;
			}
		}
	}

	/**
	 * Handles the document click event.
	 * Closes the dropdown if the click happens outside of it.
	 *
	 * @param {any} targetElement - the target of the click
	 */
	@HostListener('document:click', ['$event.target']) onOutsideClick(targetElement: any): void {
		const clickInside = this.elementRef.nativeElement.contains(targetElement);

		if (!clickInside) {
			this.onClose();
		}
	}

	/**
	 * Initializes the dropdown
	 */
	ngOnInit(): void {
		this.isGrouped = this.isGroup();
		this.onChangeSearch();
		this.showSearch = this.shouldShowSearch();
	}

	/**
	 * Toggles the open state of the dropdown.
	 * Will not get evaluated for disabled dropdowns.
	 */
	onToggle(): void {
		if (this.disabled) {
			return;
		}

		this.isOpen = !this.isOpen;

		if (this.isOpen) {
			this.evaluateCurrentIndex();
		}
	}

	/**
	 * Handles the opening of the dropdown
	 */
	onOpen(): void {
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

	/**
	 * Handles the closing of the dropdown
	 */
	onClose(): void {
		this.isOpen = false;
	}

	/**
	 * Handles the seleciton of an item.
	 * This expects the item to be an "internal" item (i.e. already indexed).
	 * Emits the touch and change events.
	 *
	 * @param {any} item - the internal item to be selected
	 */
	onSelect(item: any): void {
		this.selectedItem = item;
		this.evaluateCurrentIndex();

		if (this.onTouch) {
			this.onTouch();
		}

		if (this.onModelChange) {
			this.onModelChange(item);
		}

		this.onClose();
	}

	/**
	 * Handles the mouse entering of an option
	 *
	 * @param {any} item - the internal item that is hovered
	 */
	onMouseEnter(item: any): void {
		this.currentIdx = item.idx;
	}

	/**
	 * Handles the mouse leaving of the options block
	 */
	onMouseLeave(): void {
		this.currentIdx = -1;
	}

	/**
	 * Handles the selection of the currently highlighted item
	 */
	onSelectCurrent(): void {
		if (this.currentIdx === -1) {
			return;
		}

		this.onSelect(
			this.getAllItems(this.filteredData)
				.find(elem => elem.idx === this.currentIdx)
		);
	}

	/**
	 * Handles the navigation of the highlighted item
	 *
	 * @param {number} direction - either up (-1) or down (1)
	 */
	onNavigateSelection(direction: number) {
		this.currentIdx = Math.max(
			0,
			Math.min(
				this.currentIdx + direction,
				this.getMaxItems(this.filteredData) - 1
			)
		);
	}

	/**
	 * Handles the change of the search while typing.
	 * Does not unselect an item if it is no longer visible,
	 * but may reset the currently highlighted index.
	 */
	onChangeSearch(): void {
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

		const numberedItems = this.numberFilteredItems();

		if (this.selectedItem) {
			const lastSelectedItem = numberedItems.find(elem => elem.id === this.selectedItem.id);

			if (lastSelectedItem) {
				this.currentIdx = lastSelectedItem.idx;
			} else {
				this.currentIdx = -1;

				// We don't want to delete the selected item in this case!
			}
		} else {
			this.currentIdx = -1;
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

	private numberFilteredItems(): any[] {
		const allFilteredItems = this.getAllItems(this.filteredData);

		allFilteredItems
			.forEach((item, idx) => item.idx = idx);

		return allFilteredItems;
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
