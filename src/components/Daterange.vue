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
			:class="{required: required}"
		>{{ title }}</h1>
		<input 
			id="daterange" 
			type="text" 
			class="daterange__input"
			:class="{error: error}"
			@input="handleValue($event.target.value)"
			:placeholder="placeholder"
			@keydown="keyMonitor"
			:maxlength="10"
			autocomplete="off"
			@focus="openCalendar = true;"
			:value="currentInputDate"
		/>
	</label>
	<div class="daterange__calendar">
		<calendar
			v-if="openCalendar"
			:top-buttons="topButtons"
			v-model="currentDate"
			@input="$emit('input', handleDate($event))"
			:is-double="isDouble"
			:disable-after="disableAfter ? handleDateString(disableAfter) : null"
			:disable-before="disableBefore ? handleDateString(disableBefore) : null"
			:locale="locale"
			@close="handleClose"
			:option="option"
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
	isBetween,
	isValidDate
} from '../config/dates-helpers'; 
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

export default {
	components: { Calendar },
	data() { 
		return {
			currentRange: {},
			currentDate: {},
			currentInputDate: '',
			inputDate: '',
			openCalendar: false,
			currentDate: '',
			format: 'DD.MM.YYYY',
			selectedOption: 'one'
		} 
	},
	props: {
		title: { type: String, default: ''},
		disableAfter: {type: [String, Date], default:  null},
		disableBefore: {type: [String, Date], default: null},
		placeholder: { type: String, default: ''},
		value: { type: [String, Date, Object], default: ''},
		denominator: { type: String, default: '.'},
		locale: { type: String, default: 'en'},
		isDouble: { type: Boolean, default: false},
		topButtons: { type: Boolean, default: false},
		option: { type: String, default: 'one'},
		error: { type: Boolean, default: false},
		required: { type: Boolean, default: false}
	},
	watch: {
		error(val) {
			this.$emit('checkValid', val);
		}
	},
	created() {
		this.currentDate = {
			start: null,
			end: null
		};
		
		if (typeof this.value === 'string') {
			this.currentDate.start = this.handleDateString(this.value);
			if (!this.value.length) {
				this.currentDate.start = new Date(new Date().setHours(0, 0, 0, 0));
				this.currentInputDate = '';
			}	else
				this.currentInputDate = formatDate(this.handleDateString(this.value), this.format);
		} else {
			this.currentDate.start = this.value;
			this.currentInputDate = formatDate(this.currentDate.start, this.format)
		}
	},
	methods: {
		handleDateString(dis) {
			if (dis.length)
				return new Date(parseDate(dis, this.format));
			else if (isValidDate(dis))
				return dis;
			else null;
		},
		handleDate(date) {
  		if (date.end) {
				let s = date.end.getTime() < date.start.getTime() ? date.end : date.start;
				let e = date.end.getTime() < date.start.getTime() ? date.start : date.end;
				this.currentInputDate = `${formatDate(s, this.format)} - ${formatDate(e, this.format)}`;
				return {start: s, end: e};
			} else {
				this.currentInputDate = formatDate(date.start, this.format);
				return date.start;
			}
		},
		handleClose() {
			if (this.currentInputDate.length > 5) {
				this.currentInputDate += new Date().getFullYear();
				this.handleCurrentInputDate()
			} else if (this.value.length) {
				this.currentInputDate = '';
			}
			this.openCalendar = false;
		},
		handleCurrentInputDate() {
			if (this.checkInputDate()) {
				this.currentDate.start = this.handleDateString(this.currentInputDate);
			} else {
				let date = new Date(new Date().setHours(0, 0, 0, 0));
				let dis = this.disableBefore;
				this.currentInputDate = '';
				this.currentDate.start = dis && new Date(dis.setHours(0, 0, 0, 0)).getTime() !== date.getTime()  
					? date
					: new Date(new Date().setDate(this.disableBefore.getDate() + 1));				
			}
			this.$emit('input', this.handleDate(this.currentDate));
		},
		handleValue(val) {
			if (val.length === 2 || val.length === 5)
				val += '.';
			this.currentInputDate = val;

			if (this.currentInputDate.length === this.format.length) {
				this.handleCurrentInputDate();
				this.openCalendar = false;
			}
		},
		keyMonitor(e) {
			let check = e.keyCode > 95 && e.keyCode < 106 
			|| e.keyCode > 47 && e.keyCode < 58
		  || e.keyCode === 8;
			if (!check) e.preventDefault();
		},
		checkInputDate() {		
			let disableB = this.disableBefore ? parseDate(this.disableBefore, this.format) : new Date(new Date().setFullYear(new Date().getFullYear() - 100));;
			let disableA = this.disableAfter  ? parseDate(this.disableAfter, this.format) : null;

			let parsed = parseDate(this.currentInputDate, this.format);
			let between;

			if (disableA) {
				between = isBetween(
					disableB,
					disableA
				)(parsed)
			} else {
				between = parsed.getTime() > disableB.getTime();
			}
			
			return between && isValidDate(parsed);
		}
	},
	computed: {
		dateLen() {
			return this.format.length;
		},
		nextCurrentDate() {
			let year = this.currentDate.start.getFullYear();
			let month = this.currentDate.start.getMonth();
			if (month === 11) {
				month = -1;
				year += 1
			} 

			let d = new Date();
			d.setMonth(month + 1);
			d.setFullYear(year);
			return {
				start: new Date(d),
				end: null
			}
		}
	}
}
</script>
<style lang="scss">
$textColor: #2c2c2c;
$placeholderColor: rgba(0, 0, 0, 0.87);
$errorColor: rgba(208, 2, 27, 0.65);
$calendarBack: #fff;
.daterange {
	font-family: 'Roboto', sans-serif;
	position: relative;
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
		&.required {
			&::after {
		    content: '*';
	    	font-size: 12px;
	    	color: #ff8584;
	    	top: -2px;
	    	position: relative;
			}
		}
	}
	&__calendar {
		width: max-content;
		display: flex;
		position: absolute;
		background-color: $calendarBack;
		z-index: 1000;
	}
	&__input {
		padding: 11px 0 13px 9px;
		line-height: 12px;
		border: 1px solid #e1e1e1;
		margin-top: 4px;
		font-weight: 500;
		width: 100%;
		outline: none;
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