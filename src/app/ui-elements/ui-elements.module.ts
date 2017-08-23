import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MasaDropdownComponent } from './components/dropdown/masa-dropdown.component';

@NgModule({
  declarations: [
    MasaDropdownComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  providers: [
  ],
  exports: [
    MasaDropdownComponent
  ]
})
export class MasaUiElementsModule { }
