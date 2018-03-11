import { ModuleWithProviders, NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MasaDropdownComponent } from './components/dropdown/masa-dropdown.component';
import { MasaAutoCompleteComponent } from './components/auto-complete/masa-auto-complete.component';
import { MasaInputComponent } from './components/input/masa-input.component';
import { MasaErrorComponent } from './components/error/masa-error.component';
import { MasaToggleComponent } from './components/toggle/masa-toggle.component';

@NgModule({
	declarations: [
		MasaDropdownComponent,
		MasaAutoCompleteComponent,
		MasaInputComponent,
		MasaErrorComponent,
		MasaToggleComponent
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
		MasaInputComponent,
		MasaErrorComponent,
		MasaToggleComponent
	]
})
export class MasaUiElementsModule {
	static forRoot(): ModuleWithProviders {
  	return {
  		ngModule: MasaUiElementsModule,
			providers: []
  	};
	}
}
