import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MasaDropdownComponent } from './components/dropdown/masa-dropdown.component';
import { MasaAutoCompleteComponent } from './components/auto-complete/masa-auto-complete.component';

@NgModule({
	declarations: [
		MasaDropdownComponent,
		MasaAutoCompleteComponent
	],
	imports: [
		CommonModule,
		FormsModule
	],
	providers: [
	],
	exports: [
		MasaDropdownComponent,
    MasaAutoCompleteComponent
	]
})
export class MasaUiElementsModule { }
