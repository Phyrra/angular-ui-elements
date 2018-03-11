import { Component, Input, forwardRef } from '@angular/core';
import { HostListener } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const TOGGLE_VALUE_ACCESSOR = {
	name: 'masaInputValueAccessor',
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => MasaToggleComponent), // tslint:disable-line:no-use-before-declare
	multi: true
};

@Component({
	selector: 'masa-toggle',
	templateUrl: './masa-toggle.component.html',
	styleUrls: ['./masa-toggle.component.scss'],
	providers: [
		TOGGLE_VALUE_ACCESSOR
	]
})
export class MasaToggleComponent implements ControlValueAccessor {
	@Input() disabled: boolean;

	value: boolean;

	private onTouch: Function;
	private onModelChange: Function;

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
	 * @param {boolean} val - the value to set
	 */
	writeValue(val: boolean): void {
		this.value = val;
	}

	@HostListener('click') onClick() {
		this.value = !this.value;

		if (this.onTouch) {
			this.onTouch();
		}

		if (this.onModelChange) {
			this.onModelChange(this.value);
		}
	}
}
