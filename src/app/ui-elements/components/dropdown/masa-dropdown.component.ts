import { Component, ContentChild, ElementRef, forwardRef, HostBinding, HostListener, Input, OnInit, TemplateRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { KEY_CODE } from '../../constants';
import { emitEvent, focusElement, scrollToElement } from '../../helpers';

import * as _ from 'lodash';

const DROPDOWN_VALUE_ACCESSOR = {
	name: 'masaDropdownValueAccessor',
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => MasaDropdownComponent), // tslint:disable-line:no-use-before-declare
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
	@Input() label: string;
	@Input() data: any;
	@Input() search: string[];
	@Input() noSearch: number = 0;
	@HostBinding('class.disabled') @Input() disabled: boolean;
	@Input() required: boolean;

	@ContentChild('option', { read: TemplateRef }) optionTemplate: TemplateRef<any>;
	@ContentChild('display', { read: TemplateRef }) displayTemplate: TemplateRef<any>;

	private onTouch: Function;
	private onModelChange: Function;

	touched: boolean;

	@HostBinding('class.open') isOpen: boolean = false;
	@HostBinding('class.focus') hasFocus: boolean = false;
	private searchHasFocus: boolean;

	selectedItem: any;
	searchTerm: string;

	filteredData: any;

	isGrouped: boolean;
	showSearch: boolean;

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
	 * @param {Function} fn - the function to be called
	 */
	registerOnChange(fn: Function): void {
		this.onModelChange = fn;
	}

	/**
	 * Writes the internal value when the model is changed from the outside
	 *
	 * @param {any} item - the item to be selected
	 */
	writeValue(item: any): void {
		const id: any = (item || {}).id;

		if (!this.selectedItem || this.selectedItem.id !== id) {
			this.selectedItem = this.getAllItems(this.data)
				.find(elem => elem.id === id);
		}
	}

  /**
	 * Focus the element
   */
	focus(): void {
		focusElement(this.elementRef, '.dropdown-wrapper');
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

		if ([KEY_CODE.DOWN_ARROW, KEY_CODE.UP_ARROW].find(code => code === $event.which)) {
			$event.preventDefault();
		}

		if (this.isOpen) {
			switch ($event.which) {
				case KEY_CODE.ESC:
					this.onClose();

					break;
				case KEY_CODE.ENTER:
				case KEY_CODE.TAB:
					this.onSelect(this.selectedItem);

					break;
				case KEY_CODE.UP_ARROW:
					this.onNavigateSelection(-1);

					break;
				case KEY_CODE.DOWN_ARROW:
					this.onNavigateSelection(1);

					break;
			}
		} else {
			switch ($event.which) {
				case KEY_CODE.ENTER:
					this.onOpen();

					break;
				case KEY_CODE.UP_ARROW:
					this.onNavigateSelection(-1);

					this.onSelect(this.selectedItem);

					break;
				case KEY_CODE.DOWN_ARROW:
					this.onNavigateSelection(1);

					this.onSelect(this.selectedItem);

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

		if (clickInside) {
			if (!this.hasFocus) {
				this.onFocus();
			}
		} else {
			if (this.isOpen) {
				this.onClose();
			}

			if (this.hasFocus) {
				this.onBlur();
			}
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
			this.focusSearch();
		}
	}

	/**
	 * Handles the opening of the dropdown
	 */
	onOpen(): void {
		this.isOpen = true;

		this.focusSearch();
	}

	private focusSearch(): void {
		if (this.showSearch && this.isOpen) {
			setTimeout(() => {
				focusElement(this.elementRef, 'masa-input input');
			});
		}
	}

	/**
	 * Handles the closing of the dropdown
	 */
	onClose(): void {
		this.isOpen = false;

		this.focus();
	}

	/**
	 * Handles the selection of an item.
	 * This expects the item to be an "internal" item (i.e. already indexed).
	 * Emits the touch and change events.
	 *
	 * @param {any} item - the internal item to be selected
	 */
	onSelect(item: any): void {
		this.selectedItem = item;

		if (this.onTouch) {
			this.onTouch();
		}

		if (this.onModelChange) {
			this.onModelChange(item);
		}

		if (this.isOpen) {
			this.onClose();
		}

		emitEvent(this.elementRef, 'change');
	}

	/**
	 * Handles the navigation of the highlighted item
	 *
	 * @param {number} direction - either up (-1) or down (1)
	 */
	onNavigateSelection(direction: number) {
		const allItems: any[] = this.getAllItems(this.filteredData);

		let currentIdx;
		if (this.selectedItem) {
			currentIdx = allItems.findIndex(elem => elem.id === this.selectedItem.id);
		} else {
			currentIdx = -1;
		}

		currentIdx = Math.max(
			0,
			Math.min(
				currentIdx + direction,
				allItems.length - 1
			)
		);

		this.selectedItem = allItems[currentIdx];

		if (this.isOpen) {
			const selectedElement: HTMLElement = this.elementRef.nativeElement.getElementsByClassName('dropdown-option')[currentIdx];
			const wrapperElement: HTMLElement = this.elementRef.nativeElement.querySelector('.dropdown-option-list');

			scrollToElement(selectedElement, wrapperElement, direction);
		}
	}

	/**
	 * Handles the change of the search while typing.
	 * Does not unselect an item if it is no longer visible,
	 * but may reset the currently highlighted index.
	 */
	onChangeSearch(): void {
		if (!this.searchTerm) {
			this.filteredData = this.data;

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
	}

	/**
	 * Handles the focus event
	 */
	onFocus(): void {
		if (!this.hasFocus && !this.searchHasFocus) {
			emitEvent(this.elementRef, 'focus');
		}

		this.hasFocus = true;
	}

	/**
	 * Handles the blur event
	 */
	onBlur(): void {
		setTimeout(() => {
			if (!this.searchHasFocus) {
				this.hasFocus = false;

				this.touched = true;
				if (this.onTouch) {
					this.onTouch();
				}

				emitEvent(this.elementRef, 'blur');
			}
		});
	}

	/**
	 * Handles the focus event on the internal search
	 */
	onFocusSearch(): void {
		this.searchHasFocus = true;
	}

	/**
	 * Handles the blur event on the internal search
	 */
	onBlurSearch(): void {
		this.searchHasFocus = false;
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

		return this.noSearch < this.getAllItems(this.data).length;
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
