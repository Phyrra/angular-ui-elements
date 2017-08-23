import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MasaAppComponent } from './bootstrap/components/app/masa-app.component';
import { MasaUiElementsModule } from './ui-elements/ui-elements.module';

@NgModule({
	declarations: [
		MasaAppComponent
	],
	imports: [
		BrowserModule,
		MasaUiElementsModule
	],
	providers: [],
	bootstrap: [
		MasaAppComponent
	]
})
export class MasaModule { }
