<template>
<div
	class="daterange"
	v-on-click-outside='handleClose'
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
			type="text"
			v-bind="$attrs"
			class="daterange__input"
			:class="{error: error || isError}"
			@input="handleValue($event.target.value)"
			:placeholder="placeholder"
			@keydown="keyMonitor"
			:maxlength="selectedOption === 'one' ? 10 : 23"
			autocomplete="off"
			@focus="openCalendar = true;"
			:value="currentInputDate"
		/>
		<div
			v-if="error && errorMessage.length"
			class="daterange__error"
		>{{ errorMessage }}</div>
	</label>
	<div class="daterange__calendar">
		<calendar
			v-if="openCalendar"
			:top-buttons="topButtons"
			v-model="currentDate"
			@input="handleInput"
			:is-double="isDouble"
			:disable-after="handleDateString(disableAfter)"
			:disable-before="handleDateString(disableBefore)"
			:locale="locale"
			@set-option="selectedOption = $event; $emit('option', $event)"
			:option="option"
			:button-names="buttonNames"
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
import { directive as onClickOutside } from 'vue-on-click-outside';

export default {
	directives: {
    'on-click-outside': onClickOutside,
  },
  inheritAttrs: false,
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
			selectedOption: this.option,
			isError: false
		}
	},
	props: {
		title: { type: String, default: ''},
		disableAfter: {type: [String, Date], default:  null},
		disableBefore: {type: [String, Date], default: null},
		placeholder: { type: String, default: ''},
		value: { type: [Date, Object], default: ''},
		locale: { type: String, default: 'en'},
		isDouble: { type: Boolean, default: false},
		topButtons: { type: Boolean, default: false},
		option: { type: String, default: 'one'},
		error: { type: Boolean, default: false},
		required: { type: Boolean, default: false},
		errorMessage: { type: String, default: ''},
		buttonNames: { type: Array, default: () => ['One', 'Range']}
	},
	watch: {
		value(val) {
			this.onCreate(val);
		},
		currentInputDate(val) {
			if (!val.length) this.isError = false;
		},
		selectedOption(old, val) {
			if (old !== val)
				this.currentInputDate = '';
		}
	},
	created() {
		this.currentDate = {
			start: null,
			end: null
		};

		this.onCreate(this.value);
	},
	methods: {
		handleInput(date) {
			this.$emit('input', this.handleDate(date));
			this.isError = false;
		},
		onCreate(val) {
			if (isValidDate(val)) {
				this.currentDate.start = val;
				this.currentInputDate = formatDate(val, this.format);
			} else if (val) {
				if (val.start) {
					this.currentDate = val;
					const {start, end} = this.currentDate;
					if (end && start.getTime() > end.getTime())
						[this.currentDate.start, this.currentDate.end] = [end, start];
					this.currentInputDate = `${formatDate(start, this.format)}${end ? ' - ' + formatDate(end, this.format) : ''}`;
				} else {
			 		this.currentDate.start = new Date(new Date().setHours(0, 0, 0, 0));
			 		this.currentInputDate = '';
				}
			} else {
			 	this.currentDate.start = null;
			 	this.currentInputDate = '';
			}
		},
		handleDateString(dis) {
			if (dis && dis.length)
				return new Date(parseDate(dis, this.format));
			else if (isValidDate(dis))
				return new Date(dis.setHours(0, 0, 0, 0));
			else null;
		},
		handleDate(date) {
  		if (date.end) {
				let s = date.end.getTime() < date.start.getTime() ? date.end : date.start;
				let e = date.end.getTime() < date.start.getTime() ? date.start : date.end;
				this.currentInputDate = `${formatDate(s, this.format)} - ${formatDate(e, this.format)}`;
				this.openCalendar = false;
				return {start: s, end: e};
			} else {
				this.currentInputDate = formatDate(date.start, this.format);
				this.openCalendar = this.selectedOption !== 'one' || !date.start;
				return date.start;
			}
		},
		handleClose() {
			if (this.openCalendar) {
				if (this.currentInputDate.length > 5 && this.currentInputDate.length < 10) {
					this.currentInputDate = `${this.currentInputDate.slice(0, 5)}.${new Date().getFullYear()}`;
					this.handleCurrentInputDate();
				} else if (!this.currentInputDate.length) {
					this.isError = false;
				}
				this.openCalendar = false;
				this.$emit('close');
			}
		},
		handleCurrentInputDate() {
			this.isError = false;
			if (this.checkInputDate(this.currentInputDate)) {
				this.currentDate.start = this.handleDateString(this.currentInputDate);
				this.openCalendar = false;
				this.$emit('input', this.handleDate(this.currentDate));
			}
		},
		handleRangeInputDate() {
			let [start, end] = this.currentInputDate
				.split('-')
				.map(str => str.trim());
			if (this.checkInputDate(start)
				&& this.checkInputDate(end)) {
				this.currentDate = {
					start:  this.handleDateString(start),
					end:  this.handleDateString(end)
				}
				this.$emit('input', this.handleDate(this.currentDate));
			}
		},
		handleValue(val) {
			if (this.selectedOption === 'range'
				&& val.length === 10) {
				val += ' - '
			} else if (
				val.length === 2
				|| val.length === 5
				|| val.length === 15
				|| val.length === 18
			) {
				val += '.';
			}
			this.currentInputDate = val;

			if (this.selectedOption === 'one'
				&& this.currentInputDate.length === this.format.length) {
				this.handleCurrentInputDate();
			} else if (this.selectedOption === 'range'
				&& this.currentInputDate.length === 23) {
				this.handleRangeInputDate();
			}
		},
		keyMonitor(e) {
			let check = e.keyCode > 95 && e.keyCode < 106
			|| e.keyCode > 47 && e.keyCode < 58
		  || e.keyCode === 8
		  || e.keyCode === 9
		  || e.keyCode === 37
		  || e.keyCode === 39;
			if (!check) e.preventDefault();
		},
		checkInputDate(date) {
			let disableB = this.disableBefore ? parseDate(this.disableBefore, this.format) : new Date(new Date().setFullYear(new Date().getFullYear() - 100));;
			let disableA = this.disableAfter  ? parseDate(this.disableAfter, this.format) : null;

			let between;
			let parsed = parseDate(date, this.format);

			if (!parsed) {
				this.$emit('error');
				this.isError = true;
				return false;
			}

			if (disableA) {
				between = isBetween(
					disableB,
					disableA
				)(parsed)
			} else {
				between = parsed.getTime() > disableB.getTime();
			}

			if (!between) {
				this.$emit('error');
				this.isError = true;
				return false;
			}

			this.isError = false;
			return true;
		}
	},
	computed: {
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
	&__error {
		font-size: 12px;
		color: $errorColor;
		margin-top: 3px;
		font-weight: 500;
	}
	&__input {
		padding: 11px 0 13px 9px;
		line-height: 12px;
		border: 1px solid #e1e1e1;
		margin-top: 4px;
		font-weight: 500;
		width: 100%;
		outline: none;
		box-sizing: border-box;
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