<template>
<div 
	class="daterange"
>
	<label 
		class="daterange__wrap" 
		for="daterange"
	>
		<h1 
			class="daterange__title"
			v-if="title"
		>{{ title }}</h1>
		<input 
			id="daterange" 
			type="text" 
			class="daterange__input"
			:class="{'daterange_error': isError}"
			@input="handleValue($event.target.value)"
			:placeholder="placeholder"
			@keydown="keyMonitor"
			:maxlength="10"
			autocomplete="off"
			@focus="openCalendar = true;"
			:value="currentInputDate ? handleDate(currentInputDate) : handleDate(currentDate)"
		/>
	</label>
	<div class="daterange__calendar">
		<calendar
			v-if="openCalendar"
			:top-buttons="true"
			v-model="currentDate"
			@input="$emit('input', handleDate(currentDate))"
			@clear="currentInputDate = ''"
			:is-double="true"
			:disable-after="disableAfter ? handleDateString(disableAfter) : null"
			:disable-before="disableBefore ? handleDateString(disableBefore) : null"
			:locale="locale"
			@close="openCalendar = false"
		/>
	</div>
</div>
</template>
<script>
import Calendar from './Calendar';
import 
{ 
	formatDate, 
	parseDate,
	isBetween
} from '../config/dates-helpers'; 
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

export default {
	components: { Calendar },
	data() { 
		return {
			currentRange: {},
			currentDate: '',
			currentInputDate: '',
			inputDate: '',
			openCalendar: false,
			isError: false,
			currentDate: '',
			format: 'DD.MM.YYYY'
		} 
	},
	props: {
		title: { type: String, default: 'Daterange'},
		disableAfter: {type: [String, Date], default:  null},
		disableBefore: {type: [String, Date], default: null},
		range: { type: Object, default: null},
		placeholder: { type: String, default: ''},
		value: { type: [String, Date], default:() => new Date()},
		denominator: { type: String, default: '.'},
		locale: { type: String, default: 'en'},
	},
	created() {
		if (typeof this.value.getTime === "function")
			this.currentDate = this.value;
		else {
			this.currentDate = this.handleDateString(this.value);
		}
	},
	methods: {
		handleDateString(dis) {
			let formatted = dis.length ? parseDate(dis, this.format) : new Date().setHours(0, 0, 0, 0);

			return new Date(formatted);
		},
		handleDate(date) {
			if (typeof date.getTime === "function")
				return formatDate(date, this.format)
			else if (date.length) return date;
			else {
				let s = date.end.getTime() < date.start.getTime() ? date.end : date.start;
				let e = date.end.getTime() < date.start.getTime() ? date.start : date.end;
				[s, e] = [formatDate(date.start, this.format), formatDate(date.end, this.format)];
				return `${s} - ${e}`
			} 
		},
		handleValue(val) {
			if (val.length === 2 || val.length === 5)
				val += '.';
			this.currentInputDate = val;

			if (this.currentInputDate.length === this.format.length) {
				if (this.checkInputDate()) {
					this.currentDate = parseDate(this.currentInputDate, this.format);
					this.$emit('input', this.handleDate(this.currentDate));
					this.openCalendar = false;
				} else {
					this.currentInputDate = '';
					this.currentDate = new Date(new Date().setHours(0, 0, 0, 0));
					this.$emit('input', formatDate(this.currentDate));
					this.openCalendar = false;
				}
			}
		},
		keyMonitor(e) {
			let check = e.keyCode > 95 && e.keyCode < 106 
			|| e.keyCode > 47 && e.keyCode < 58
		  || e.keyCode === 8;
			if (!check) e.preventDefault();
		},
		checkInputDate() {
			function isValidDate(d) {
  			return d instanceof Date && !isNaN(d);
			}			

			let d = new Date();
			d.setFullYear(new Date().getFullYear());

			let disableB = this.disableBefore ? this.disableBefore : new Date(null);
			let disbleA = this.disableAfter  ? this.disableAfter : d;

			let between = isBetween(
				disableB,
				disbleA
			)

			return between(parseDate(this.currentInputDate, this.format)) 
			&& isValidDate(parseDate(this.currentInputDate, this.format));
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