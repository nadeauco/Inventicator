# Inventicator
_Version 0.5.2_

---


## Getting Started

1. Copy all the files to a web server.
2. Change the `apiURL` in _inventicator.js_ to the correct URL where _source.json_ can be found.
3. If you want to enable console logs, find the `devMode` in `vueModel.data` and set it to `true`.
4. Access the index page in a web browser and enjoy the magic.

## Technologies

[Vue.js](https://vuejs.org/guide/) serves as the MVVM framework for the app.

Questions, options, and scores are all loaded in dynamically from the source JSON file.

## Defining Questions

**Select**-type questions allow the user to select one option from a list of options. The question total score will reflect the value of the selected option's score value. Select questions are defined in JSON like this:

```json
"prototypeStatus": {

	"type": "select",
	"number": "1a",
	"heading": "Prototype",
	"caption": "How developed is the prototype?",
	"instructions": "",
	"lowLabel": "",
	"highLabel": "",
	"options": {
		"drawing": {
			"caption": "Drawing, written description",
			"score": 1,
			"default": true
		},
		"rendering": {
			"caption": "3D rendering or video",
			"score": 2
		},
		...
	}

}
```

**Multi-select**-type questions allow a user to select multiple options from the list of options. The option score values for the selected options are added to calculate the total question score. Multi-select questions have the same JSON data signature as Select questions, except their `type` attribute is set to `"multiselect"`, as in this example:

```json
"marketConsumer": {

	"type": "multiselect",
	"number": "5a",
	"heading": "Market (Consumer)",
	"caption": "",
	"instructions": "",
	"options": {
		"none": {
			"caption": "No targeting (Everyone)",
			"score": 0,
			"default": true
		},
		"age": {
			"caption": "Age",
			"score": 1
		},
		...
	}

},
```

**Plus/Minus** questions allow the user to select a plus or minus (or both) for each item in the list of options. Activating a _minus_ option causes the option's score value to be deducted from the total question score, and activating a _plus_ option causes the option's score value to be added to the total question score. The data signature for Plus/Minus questions is almost identical to the other question types, except that the `type` attribute is set to `"plusminus"`. Additionally, the `default` parameter, which marks options that should be activated by default, may be replaced with individual `plusDefault` and `minusDefault` properties:

```json
"socialEconomicConsiderations": {

	"type": "plusminus",
	"number": "8",
	"heading": "Social/Economic Considerations",
	"caption": "",
	"instructions": "",
	"options": {
		"none": {
			"caption": "None",
			"score": 0,
			"plusDefault": true,
			"minusDefault": true
		},
		"publicHealth": {
			"caption": "Public Health",
			"score": 1
		},
		...
	}

}
```

## Rendering Questions

The questions are loaded in and rendered according to the templates found in `index.html`.

The template markup can be found in `<template>` elements tagged with the component IDs:

 - `tmp-inv-question-select`
 - `tmp-inv-question-multiselect`
 - `tmp-inv-question-plusminus`.

The template code will hopefully be self-explanatory. Vue's [Binding Syntax](https://vuejs.org/guide/syntax.html) and [List Rendering](https://vuejs.org/guide/list.html) docs explain the techniques being used in great detail.

To render a question individually, use the corresponding component name, and pass in the matching question handle from the JSON source, like this:

```html
<inv-question-plusminus 
	handle="socialEconomicConsiderations"
	v-if="questionsLoaded">
</inv-question-plusminus>
```

Note: The `v-if` directive here refers to a `questionsLoaded` marker on the view-model, which indicates that the question data is ready. This directive is necessary to make sure the components don't render before Vue has a chance to load in the source data. (If they did render prematurely, it'd cause _Property of undefined_ errors in the JS.

### Receiving form data

Each question renders normal HTML form controls. The active selections are automatically bound to the view-model for purposes of live calculations. However, you may want to actually submit this data over-the-wire &mdash; For example, to save to a CMS or to generate a print-out PDF.

Each of the rendered form controls carries a name attribute: `selections[handle]` (where `handle` matches a question handle from the source JSON). If you create a form to wrap around all the form controls, those selections will be available as an array in the POST data.

Additionally, example code is provided to illustrate how to generate live-rendered controls to also submit totals values. The example provided renders visible controls for purposes of demo/debugging, but in production you may wish to render hidden controls:

```html
<div v-for="(handle, total) in totals">
	<input
		type="hidden"
		name="totals[{{ handle }}]" 
		value="{{ total }}" >
</div>
```

## Questions and further development

Please feel free to address any questions, clarifications, bug reports, or work requests to:

Michael Rog  
michael@topshelfcraft.com

