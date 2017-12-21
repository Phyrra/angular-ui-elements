import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MasaDropdownComponent } from './components/dropdown/masa-dropdown.component';
import { MasaAutoCompleteComponent } from './components/auto-complete/masa-auto-complete.component';
import { MasaInputComponent } from './components/input/masa-input.component';

@NgModule({
	declarations: [
		MasaDropdownComponent,
		MasaAutoCompleteComponent,
		MasaInputComponent
	],
	imports: [
		CommonModule,
		FormsModule
	],
	providers: [
	],
	exports: [
		MasaDropdownComponent,
		MasaAutoCompleteComponent,
		MasaInputComponent
	]
})
export class MasaUiElementsModule { }
