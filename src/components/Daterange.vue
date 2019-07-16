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
			@input="$emit('input', handleValue($event.target.value))"
			:placeholder="placeholder"
			@keydown="keyMonitor"
			:maxlength="10"
			autocomplete="off"
			@focus="openCalendar = true"
			:value="currentDate"
		/>
	</label>
	<div class="daterange__calendar">
		<calendar
			v-if="openCalendar"
			:format="format"
			:top-buttons="true"
			:date="currentDate"
			v-model="currentDate"
			@input="$emit('input', currentDate)"
		/>
	</div>
</div>
</template>
<script>
import Calendar from './Calendar';
import 
{ 
	formatDate, 
	parseDate 
} from '../config/dates-helpers'; 
export default {
	components: { Calendar },
	data() { 
		return {
			currentRange: {},
			currentDate: '',
			inputDate: '',
			openCalendar: false,
			isError: false,
			currentDate: ''
		} 
	},
	props: {
		title: { type: String, default: 'Daterange'},
		format: { type: String, default: 'DD.MM.YYYY'},
		range: { type: Object, default: null},
		placeholder: { type: String, default: ''},
		value: { type: [String, Date], default: ''},
		denominator: { type: String, default: '.'},
	},
	watch: {
		value(val) {
			if (val.length == 2 || val.length == 5)
				return val + this.denominator;
			else return val;
		}
	},
	created() {
		this.currentDate = this.value.length < this.dateLen
		? formatDate(new Date(), this.format)
		: this.value; 
	},
	methods: {
		handleValue(val) {
			let fVal;
			if (val.length == 2 || val.length == 5)
				fVal = val + this.denominator;
			else fVal = val;

			this.currentDate = fVal;
			return fVal;
		},
		keyMonitor(e) {
			let check = e.keyCode > 95 && e.keyCode < 106 
			|| e.keyCode > 47 && e.keyCode < 58
		  || e.keyCode === 8;
			if (!check) e.preventDefault();
		},
		handlePropDate() {
			let date = this.value.length ? this.value : new Date();
			return new Date(dayjs(date, this.format))
		}
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
	&__calendar {
		width: max-content;
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