<template>
<div 
	class="daterange"
>
	<label 
		class="daterange__wrap" for="daterange"
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
			@focus="openCalendar = true"
			:value="handleDate(currentDate)"
		/>
	</label>
	<div class="daterange__calendar">
		<calendar
			v-if="openCalendar"
			:top-buttons="true"
			v-model="currentDate"
			:is-double="true"
			:disable-after="handleDateString(disableAfter)"
			:disable-before="handleDateString(disableBefore)"
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
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import { mixin as onClickOutside } from 'vue-on-click-outside'

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
	mixins: [onClickOutside],
	props: {
		title: { type: String, default: 'Daterange'},
		format: { type: String, default: 'DD.MM.YYYY'},
		disableAfter: {type: [String, Date], default:  null},
		disableBefore: {type: [String, Date], default: null},
		range: { type: Object, default: null},
		placeholder: { type: String, default: ''},
		value: { type: [String, Date], default:() => new Date()},
		denominator: { type: String, default: '.'},
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
		showCalendar() {
			this.openCalendar = false;
		},
		handleValue(val) {
			if (this.curOption === 'one')
				this.handleOneVal(val);
			else this.handleRangeVal(val);
		},
		keyMonitor(e) {
			let check = e.keyCode > 95 && e.keyCode < 106 
			|| e.keyCode > 47 && e.keyCode < 58
		  || e.keyCode === 8;
			if (!check) e.preventDefault();
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