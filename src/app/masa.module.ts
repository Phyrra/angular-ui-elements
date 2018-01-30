import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MasaAppComponent } from './bootstrap/components/app/masa-app.component';
import { MasaUiElementsModule } from './ui-elements/masa-ui-elements.module';
import { FormsModule } from '@angular/forms';

@NgModule({
	declarations: [
		MasaAppComponent
	],
	imports: [
		BrowserModule,
		MasaUiElementsModule,
		FormsModule
	],
	providers: [],
	bootstrap: [
		MasaAppComponent
	]
})
export class MasaModule { }
