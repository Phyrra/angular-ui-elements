# MasaDropdown

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.1.3.

## Development server

Run `yarn start` for a dev server. Navigate to `http://localhost:4200/`.

## Build

Run `yarn build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Example

A working example can be found [here](https://masa-dropdown.000webhostapp.com/).

## Usage

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
<masa-dropdown [data]="someData" placeholder="-- choose --">
	<ng-template #option let-item="item">
		{{ item.name }}
	</ng-template>
</masa-dropdown>
```

A second template for rendering the seleciton may also be defined with the angular-id `#display`. If none is set, the item template will be used.

```
<masa-dropdown [data]="someData" placeholder="-- choose --">
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

### Inputs

| Input       | Description                                                                                                  | Example                      |
| ----------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| data        | The data                                                                                                     | `data="someData`             |
| placeholder | A placeholder (string) to show while nothing is selected                                                     | `placeholder="-- choose --"` |
| search      | An array of fields that may be searched. If none is provided, the search will not be available               | `search="['name']"`          |
| noSearch    | A numeric limit from which the search will be shown. Only shows search if there are more than 10 items       | `noSearch="10"`              |
| disabled    | A flag to disable the input                                                                                  | `disabled="true"`            |
