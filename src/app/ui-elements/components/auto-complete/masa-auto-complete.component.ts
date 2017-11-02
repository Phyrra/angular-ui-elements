import { Component, OnInit } from '@angular/core';
import { HostListener, ElementRef, Input } from '@angular/core';
import { ContentChild, TemplateRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { forwardRef } from '@angular/core';
import { KEY_CODE } from '../../constants';

import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounce';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/observable/timer';

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

	@ContentChild(TemplateRef) option;
	@Input() optionRenderer: (item: any) => string;

	@Input() minSearchLength;

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
				this.scrollToSelection(selectedElement, this.selectedIndex - prevIndex);
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
			this.search = this.optionRenderer(value);
		} else {
			this.search = '';
		}
	}

	onKeyDown($event: any): void {
		switch ($event.keyCode) {
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

	private scrollToSelection(elem: HTMLElement, direction: number) {
		const bodyElement: HTMLElement = document.body;
		const wrapperElement: HTMLElement = this.elementRef.nativeElement.getElementsByClassName('foldout')[0];

		const wrapperRect: ClientRect = wrapperElement.getBoundingClientRect();
		const elementRect: ClientRect = elem.getBoundingClientRect();

		const elementTop: number = elementRect.top + bodyElement.scrollTop;
		const elementBottom: number = elementRect.bottom + bodyElement.scrollTop;

		const wrapperTop: number = wrapperRect.top + bodyElement.scrollTop;
		const wrapperBottom: number = wrapperRect.bottom + bodyElement.scrollTop;

		if (direction > 0) {
			if (elementBottom > wrapperBottom) {
				wrapperElement.scrollTop += (elementBottom - wrapperBottom);
			}
		} else if (direction < 0) {
			if (elementTop < wrapperTop) {
				wrapperElement.scrollTop -= (wrapperTop - elementTop);
			}
		}
	}
}
