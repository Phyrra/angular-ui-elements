import { Component } from '@angular/core';
import { ElementRef } from '@angular/core';
import { Input } from '@angular/core';
import { HostBinding } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { forwardRef } from '@angular/core';

const INPUT_VALUE_ACCESSOR = {
	name: 'masaInputValueAccessor',
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => MasaInputComponent), // tslint:disable-line:no-use-before-declare
	multi: true
};

@Component({
	selector: 'masa-input',
	templateUrl: './masa-input.component.html',
	styleUrls: ['./masa-input.component.scss'],
	providers: [
		INPUT_VALUE_ACCESSOR
	]
})
export class MasaInputComponent implements ControlValueAccessor {
	@Input() value: string;
	@Input() label: string;
	@HostBinding('class.disabled') @Input() disabled: boolean;

	@HostBinding('class.focus') hasFocus: boolean;

	private onTouch: Function;
	private onModelChange: Function;

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
	 * Writes the interal value when the model is changed from the outside
	 *
	 * @param {any} item - the item to be selected
	 */
	writeValue(val: string): void {
		this.value = val;

		if (this.onTouch) {
			this.onTouch();
		}

		if (this.onModelChange) {
			this.onModelChange(val);
		}
	}

	onFocus(): void {
		this.hasFocus = true;

		this.elementRef.nativeElement.dispatchEvent(new Event('focus'));
	}

	onBlur(): void {
		this.hasFocus = false;

		this.elementRef.nativeElement.dispatchEvent(new Event('focus'));
	}
}
