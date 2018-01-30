# UI Elements

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.1.3.

## Development server

Run `yarn start` for a dev server. Navigate to `http://localhost:4200/`.

## Build

Run `yarn build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Example

A working example can be found [here](https://masa-dropdown.000webhostapp.com/).

## Input

### Usage

```
<masa-input label="Label"></masa-input>
```

The model can be bound like any other input with either `[(ngModel)]` and `(ngModelChange)` or using `FormGroup`.

For errors the element `<sama-error>` can be used.

```
<masa-input label="Label">
	<sama-error *ngIf="control.invalid">
		Error message
	</sama-error>
</masa-input>
```

### Inputs

| Input    | Description                                                                                                  | Example               |
| ---------| ------------------------------------------------------------------------------------------------------------ | --------------------- |
| label    | A label (string) to show while nothing is selected and as label once something is                            | `label="Label"`       |
| disabled | A flag to disable the input                                                                                  | `[disabled]="true"`   |
| required | A flag to mark the input as required                                                                         | `[required]="true"`   |

## Dropdown

### Usage

The data must come in form of an array, that holds items with an `id` field (note, `name` is not important).

```
const data = [{
	id: 1,
	name: 'A'
}, {
	id: 2,
	name: 'B'
}, {
	id: 3,
	name: 'C'
}]
```

The data array may also consist of groups, that have a `title` property (will be rendered) and an `items` array, that must come in the form of the above.

```
const groupedData = [{
	title: 'Group 1',
	items: [{
		id: 1,
		name: 'A'
	}, {
		id: 2,
		name: 'B'
	}]
}, {
	title: 'Group 2',
	items: [{
		id: 3,
		name: 'C'
	}]
}];
```

To use the component, a template to render the items must be defined with the angular-id `#option`.

```
<masa-dropdown [data]="someData" label="Label">
	<ng-template #option let-item="item">
		{{ item.name }}
	</ng-template>
</masa-dropdown>
```

A second template for rendering the seleciton may also be defined with the angular-id `#display`. If none is set, the item template will be used.

```
<masa-dropdown [data]="someData" label="Label">
	<ng-template #display let-selection="item">
		<div>
			{{ selection.name }}
		</div>
		<div>
			{{ selection.description}}
		</div>
	</ng-template>

	<ng-template #option let-item="item">
		{{ selection.name }}
	</ng-template>
</masa-dropdown>
```

The model can be bound like any other input with either `[(ngModel)]` and `(ngModelChange)` or using `FormGroup`.

For errors the element `<sama-error>` can be used.

```
<masa-dropdown [data]="someData" label="Label">
	<ng-template #option let-item="item">
		{{ item.name }}
	</ng-template>
	
	<sama-error *ngIf="control.invalid">
		Error message
	</sama-error>
</masa-dropdown>
```

### Inputs

| Input    | Description                                                                                                  | Example               |
| ---------| ------------------------------------------------------------------------------------------------------------ | --------------------- |
| data     | The data                                                                                                     | `[data]="someData`    |
| label    | A label (string) to show while nothing is selected and as label once something is                            | `label="Label"`       |
| search   | An array of fields that may be searched. If none is provided, the search will not be available               | `[search]="['name']"` |
| noSearch | A numeric limit from which the search will be shown. Only shows search if there are more than 10 items       | `[noSearch]="10"`     |
| disabled | A flag to disable the input                                                                                  | `[disabled]="true"`   |
| required | A flag to mark the input as required                                                                         | `[required]="true"`   |

## Auto complete

### Usage

The data is coming from an async datasource in form of an `Observable`. For this, bind a function, returning an `Observable` to the `source` attribute.
The resolved data must be an array.

There are no restrictions on the items within the result set. A function to turn the item into a string must be provided. This will get executed, when an element of the auto-complete list is selected.

To use the component, a template to render the items must be defined with the angular-id `#option`.

```
<masa-auto-complete
	[source]="asyncDataSource"
	[itemRenderer]="itemToString"
>
	<ng-template #option let-user="item">
		{{ user.firstName }} {{ user.lastName }}
	</ng-template>
</masa-auto-complete>
```

A second template to render a message in case of a data-overflow may be provided. This will be shown, if the result set is bigger than the specified maximum amount of items to be displayed.

```
<masa-auto-complete
	[source]="asyncDataSource"
	[itemRenderer]="itemToString"
	[maxItems]="3"
>
	<ng-template #option let-user="item">
		{{ user.firstName }} {{ user.lastName }}
	</ng-template>

	<ng-template #overflow let-number="number">
		<div class="overflow-warning">
			There are {{ number }} items, only the first 3 are shown
		</div>
	</ng-template>
</masa-auto-complete>
```

The model can be bound like any other input with either `[(ngModel)]` and `(ngModelChange)` or using `FormGroup`.

**Important note:** The returned value is the item object, not the string from the input field.

### Input

| Input           | Description                                                                                                                                                 | Example                         |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| source          | A function returning an `Observable` data source: `(text: string) => Observable<any[]>`                                                                     | `[data]="asyncDataSource`       |
| itemRenderer    | A function turning the selected item into a string: `(item: any) => string`. If none is provided, the JS `.toString()` will be used.                        | `[itemRenderer]="itemToString"` |
| minSearchLength | The minimum length of the typed text before an API request is started                                                                                       | `[minSearchLength]="3"`         |
| maxItems        | The maximum number of items displayed in the list. If the result set exceeds this number, a warning will be shown, if a corresponding template is provided. | `[maxItems]="10"`               |
| loadingText     | The text to be shown while the API request is pending                                                                                                       | `loadingText="Loading"`         |
| noItemsText     | The text to be shown, when the API request did not return any results                                                                                       | `noItemsText="No items found`   |
| disabled        | A flag to disable the input                                                                                                                                 | `[disabled]="true"`             |
| required        | A flag to mark the input as required                                                                                                                        | `[required]="true"`             |
