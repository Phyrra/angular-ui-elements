import { Component, ElementRef, forwardRef, HostBinding, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { emitEvent, focusElement } from '../../helpers';

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
	@Input() label: string;
	@HostBinding('class.disabled') @Input() disabled: boolean;
	@Input() required: boolean;

	@HostBinding('class.focus') hasFocus: boolean;

  value: string;

	private onTouch: Function;
	private onModelChange: Function;

	touched: boolean = false;

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
	 * @param {string} val - the value to set
	 */
	writeValue(val: string): void {
		this.value = val;
	}

  /**
	 * Focus the element
   */
	focus(): void {
		focusElement(this.elementRef, 'input');
	}

  /**
   * Handles the focus event
   */
	onFocus(): void {
		this.hasFocus = true;

		emitEvent(this.elementRef, 'focus');
	}

  /**
   * Handles the blur event
   */
	onBlur(): void {
		this.hasFocus = false;

		this.touched = true;
		if (this.onTouch) {
			this.onTouch();
		}

		emitEvent(this.elementRef, 'blur');
	}

  /**
	 * Handles changes of the model.
	 * Emits the touch and change events.
   */
	onChange(): void {
		if (this.onTouch) {
			this.onTouch();
		}

		if (this.onModelChange) {
			this.onModelChange(this.value);
		}

		emitEvent(this.elementRef, 'change');
	}
}
