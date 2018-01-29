import { ElementRef } from '@angular/core';

export function scrollToElement(elem: HTMLElement, wrapperElement: HTMLElement, direction: number): void {
	const bodyElement: HTMLElement = document.body;

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

export function emitEvent(elem: ElementRef, event: string): void {
  elem.nativeElement.dispatchEvent(new Event(event, { bubbles: true }));
}

export function focusElement(elem: ElementRef, querySelector: string): void {
	elem.nativeElement.querySelector(querySelector).focus();
}
