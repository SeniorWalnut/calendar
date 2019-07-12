<template>
<div class="daterange">
	<label class="daterange__wrap" for="daterange">
		<h1 
			class="daterange__title"
			v-if="title"
		>{{ title }}</h1>
		<input 
			id="daterange" 
			type="text" 
			class="daterange__input"
			:class="{'daterange_error': isError}"
			:value="value"
			@input="$emit('input', handleValue($event.target.value))"
			:placeholder="placeholder"
			@keydown="keyMonitor"
			:maxlength="10" 
		/>
	</label>
	<div class="daterange__calendar">
		<calendar
			v-show="openCalendar"
			:range="range"
			:days="makeCalendar"
			:choosen-range="currentRange"
		/>
	</div>
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
			inputDate: '',
			openCalendar: false,
			isError: false,
			currentRange: { 
				start: null,
				end: null
			}
		} 
	},
	props: {
		title: { type: String, default: 'Daterange'},
		format: { type: String, default: 'DD.MM.YYYY'},
		range: { type: Object, default: null},
		placeholder: { type: String, default: ''},
		// date: { type: String},
		value: { type: String, default: ''},
		denominator: { type: String, default: '.'},
		format: { type: String, default: 'DD.MM.YYYY'},
		range: { type: Object, default: () => ({
			start: new Date(1970, 1, 1),
			end: new Date(new Date().getFullYear() + 100, 1, 1)
		})},
	},
	watch: {
		value(val) {
			 if (val.length  === this.dateLen) {
				this.openCalendar = this.checkValid(val) 
				? true : this.handleError();			 	
			 }
		}
	},
	methods: {
		/*
		 Methods for handeling input values  
		*/
		handleValue(val) {
			if (val.length == 2 || val.length == 5)
				return val + this.denominator;
			else return val;
		},
		keyMonitor(e) {
			let check = e.keyCode > 95 && e.keyCode < 106 
			|| e.keyCode > 47 && e.keyCode < 58
		  || e.keyCode === 8;
			console.log(check, e.keyCode)
			if (!check) e.preventDefault();
		},
		/*
		 Methods for dates itself  
		*/
		// Need to be locale over there
		getDayOfWeek(num) {
			return new Date(this.value) + num;
		},
		getMonth() {
			return new Date(this.value).getFullYear();
		},
		getYear() {
			return new Date(this.value).getFullYear();
		},
		// Validation
		checkValid(date) {
			// if (getYear)
		},
		handleError() {
			this.isError = true;
		},

	},
	computed: {
		dateLen() {
			return this.format.length;
		}
	}
}
</script>
<style lang="scss">
$textColor: #2c2c2c;
$placeholderColor: rgba(0, 0, 0, 0.87);
$errorColor: red;
.daterange {
	font-family: 'Roboto', sans-serif;
	&__wrap {
	  	display: block;
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
		width: 100%;
		&.error {
			outline: $errorColor solid 1px;
		}
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