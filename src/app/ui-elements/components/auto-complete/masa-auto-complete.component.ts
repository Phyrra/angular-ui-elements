import { Component, ContentChild, ElementRef, forwardRef, HostListener, Input, OnInit, TemplateRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounce';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/observable/timer';

import { KEY_CODE } from '../../constants';
import { scrollToElement } from '../../helpers';

export interface Action {
	immediate: boolean;
	action: () => void;
}

const AUTO_COMPLETE_VALUE_ACCESSOR = {
	name: 'masaAutoCompleteValueAccessor',
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => MasaAutoCompleteComponent), // tslint:disable-line:no-use-before-declare
	multi: true
};

@Component({
	selector: 'masa-auto-complete',
	templateUrl: './masa-auto-complete.component.html',
	styleUrls: ['./masa-auto-complete.component.scss'],
	providers: [
		AUTO_COMPLETE_VALUE_ACCESSOR
	]
})
export class MasaAutoCompleteComponent implements ControlValueAccessor, OnInit {
	@Input() loadingText: string;
	@Input() noItemsText: string;

	@Input() disabled: boolean;
	@Input() required: boolean;

	@ContentChild(TemplateRef) optionTemplate: TemplateRef<any>;
	@Input() itemRenderer: (item: any) => string;

	@Input() minSearchLength;

	@ContentChild('overflow', { read: TemplateRef }) overflowTemplate: TemplateRef<any>;
	@Input() maxItems: number;

	private onTouch: Function;
	private onModelChange: Function;

	search: string;

	isOpen: boolean = false;
	selectedIndex: number;

	@Input() source: (text: string) => Observable<any[]>;

	private keys: Subject<any> = new Subject<any>();
	private actions: Subject<any> = new Subject<any>();

	isLoading: boolean = false;
	apiSubscription: Subscription;

	items: any[];

	constructor(private elementRef: ElementRef) { }

	ngOnInit(): void {
		this.keys.asObservable()
			.debounce((action: Action) => {
				if (action.immediate) {
					return Observable.timer(0);
				}

				return Observable.timer(300);
			})
			.subscribe((action: Action) => {
				if (action.immediate) {
					if (this.items) {
						if (this.isLoading) {
							// do nothing
						} else {
							action.action();
						}
					} else {
						if (this.isLoading) {
							// do nothing
						} else {
							this.loadList();
						}
					}
				} else {
					if (this.isLoading) {
						this.apiSubscription.unsubscribe();
					}

					this.loadList();
				}

				this.actions.next(action);
			});
	}

	@HostListener('document:click', ['$event.target']) onOutsideClick(targetElement: any): void {
		const clickInside = this.elementRef.nativeElement.contains(targetElement);

		if (!clickInside) {
			this.onClose();
		}
	}

	@HostListener('keydown', ['$event']) onKeyEvent($event: any): void {
		if (this.disabled) {
			return;
		}

		if ($event.keyCode === KEY_CODE.UP_ARROW || $event.keyCode === KEY_CODE.DOWN_ARROW) {
			if (this.items && this.items.length > 0) {
				const dir: number = $event.keyCode === KEY_CODE.UP_ARROW ? -1 : 1;

				const prevIndex: number = this.selectedIndex;

				// Loop around
				this.selectedIndex = (this.selectedIndex + this.items.length + dir) % this.items.length;

				const selectedElement: HTMLElement = this.elementRef.nativeElement.getElementsByClassName('option')[this.selectedIndex];
				const wrapperElement: HTMLElement = this.elementRef.nativeElement.getElementsByClassName('auto-complete-option-list')[0];

				scrollToElement(selectedElement, wrapperElement, this.selectedIndex - prevIndex);
			}
		}
	}

	registerOnTouched(fn: Function): void {
		this.onTouch = fn;
	}

	registerOnChange(fn: Function): void {
		this.onModelChange = fn;
	}

	// Writes the internal value when the model is changed from the "outside"
	writeValue(value: any): void {
		if (value) {
			if (typeof this.itemRenderer === 'function') {
				this.search = this.itemRenderer(value);
			} else {
				this.search = value.toString();
			}
		} else {
			this.search = '';
		}
	}

	onKeyDown($event: any): void {
		if (this.disabled) {
			return;
		}

		if ([KEY_CODE.DOWN_ARROW, KEY_CODE.UP_ARROW].find(code => code === $event.which)) {
			$event.preventDefault();
		}

		switch ($event.which) {
			case KEY_CODE.ENTER:
				this.keys.next({
					immediate: true,
					action: this.selectCurrentItem.bind(this)
				});

				break;
			case KEY_CODE.TAB:
				this.keys.next({
					immediate: true,
					action: this.onClose.bind(this)
				});

				break;
			case KEY_CODE.UP_ARROW:
			case KEY_CODE.DOWN_ARROW:
				// ignore, handled by different listener

				break;
			default:
				this.keys.next({
					immediate: false,
					action: () => {}
				});
		}
	}

	onBlur($event: any): void {
		this.actions.next({
			immediate: true,
			action: this.onClose.bind(this)
		});
	}

	private loadList(): void {
		if (this.minSearchLength > 0 && this.search.length < this.minSearchLength) {
			this.items = [];
			this.isOpen = false;

			return;
		}

		this.isOpen = true;
		this.isLoading = true;

		this.apiSubscription = this.source(this.search)
			.do(() => this.isLoading = false)
			.withLatestFrom(this.actions)
			.subscribe(([results, action]) => {
				this.items = results;
				this.selectedIndex = 0;

				if (action.immediate) {
					action.action();
				}

				this.apiSubscription = null;
			});
	}

	selectItemAtIndex(index: number): void {
		this.selectedIndex = index;

		this.selectCurrentItem();
	}

	private selectCurrentItem(): void {
		const selectedItem: any = this.items[this.selectedIndex];

		this.writeValue(selectedItem);
		this.onModelChange(selectedItem);

		this.onClose();
	}

	private onClose(): void {
		this.isOpen = false;

		if (this.apiSubscription) {
			this.apiSubscription.unsubscribe();
		}

		this.items = null;
	}
}
