<template>
<div class="daterange">
	<label class="daterange__wrap" for="daterange">
		<!-- <h1 class="daterange__title"></h1> -->
		<h1 
			class="daterange__title"
			v-if="title"
		>{{ title }}</h1>
		<input 
			id="daterange" 
			type="text" 
			class="daterange__input"
			:value="value"
			@input="$emit('input', handleValue($event.target.value))"
			:placeholder="placeholder"
			@keydown="keyMonitor"
			maxlength="10" 
		>
		<calendar />
	</label>
</div>
</template>
<script>
import Calendar from './Calendar';
export default {
	components: { Calendar },
	data() { 
		return {
			currentRange: {},
			currentDate: new Date(),
			inputDate: ''
		} 
	},
	props: {
		title: { type: String, default: 'Daterange'},
		format: { type: String, default: 'DD.MM.YYYY'},
		range: { type: Object, default: null},
		placeholder: { type: String, default: ''},
		// date: { type: String},
		value: { type: String, default: ''}
	},
	methods: {
		handleValue(val) {
			if (val.length == 2 || val.length == 5)
				return val + '.';
			else return val;
		},
		keyMonitor(e) {
			let check = e.keyCode > 95 && e.keyCode < 106 
			|| e.keyCode > 47 && e.keyCode < 58
		  || e.keyCode === 8;
			console.log(check, e.keyCode)
			if (!check) e.preventDefault();
		}
	}
}
</script>
<style lang="scss">
$textColor: #2c2c2c;
$placeholderColor: rgba(0, 0, 0, 0.87);

.daterange {
	font-family: 'Roboto', sans-serif;
	&__wrap {
  	display: block;
		width: auto;
	}
	&__title {
		font-size: 12px;
		text-align: left;
		font-weight: 400;
		color: $textColor;
		margin: 0;
		padding-left: 9px;
	}
	&__input {
		padding: 11px 0 13px 9px;
		line-height: 12px;
		border: 1px solid #e1e1e1;
		margin-top: 4px;
		font-weight: 500;
		&:focus {
			outline: none;
			&::-webkit-input-placeholder { color: transparent;  }
			&::-moz-placeholder { color: transparent; }
			&:-ms-input-placeholder { color: transparent; }
		}
		&:placeholder {
			font-size: 14px;
			font-weight: 500;
			color: $placeholderColor;
			opacity: .86
		}
	}
}
</style>