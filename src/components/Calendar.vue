<template>
		<div class="calendar-wrapper">
			<div class="calendar__top calendar-top">
				<div 
					class="calendar-buttons"
					v-if="topButtons"
				>
					<div 
							class="calendar-buttons__one"
							@click="chooseOption('one')"
							:class="{active: selectedOption === 'one'}"
						>One
					</div>
					<div 
							class="calendar-buttons__range"
							@click="chooseOption('range')"
							:class="{active: selectedOption === 'range'}"
						>Range</div>
					</div>
				<div class="calendar-top__nav">
					<div 
						class="calendar-top__arrow left"
						@click="prevMonth"
					></div>
					<div class="calendar-top__month">{{ localMonth }}, {{ localYear }}</div>
					<div 
						class="calendar-top__arrow right"
						@click="nextMonth"
					></div>
				</div>
			</div>
			<div class="calendar__main">
				<div class="calendar calendar-left">
					<table class="calendar-date">
						<tr class="calendar-date__day-names">
							<td v-for="name in dayNames">
								{{ name }}
							</td>
						</tr>
						<tr
							class="calendar-date__week"
							v-for="week in days.slice(0, 5)"
						>
							<td v-for="day in week">
								<day-cell 
								  :day="day"
								  @set-day="setDay"
								  @hovered="hoverRange"
								/> 
							</td>
						</tr>
					</table>
				</div>
				<div 
					class="calendar calendar-right"
					v-if="isDouble"
				>
					<table class="calendar-date">
						<tr class="calendar-date__day-names">
							<td v-for="name in dayNames">
								{{ name }}
							</td>
						</tr>
						<tr
							class="calendar-date__week"
							v-for="week in days.slice(4,)"
						>
							<td v-for="day in week">
								<day-cell 
								  :day="day"
								  @set-day="setDay"
								  @hovered="hoverRange"
								/> 
							</td>
						</tr>
					</table>
				</div>
			</div>
	</div>
</template>
<script>

import DayCell from './DayCell';
import { months } from '../config/calendar-assets.js';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { getDates } from '../config/array-of-dates.js';
import { 
	startOfWeek,
	endOfWeek,
	lastDayOfMonth,
	startOfMonth,
	isBetween
} from '../config/dates-helpers.js';

dayjs.extend(customParseFormat);

export default {
	components: { DayCell },
	data() {
		return {
			localDate: null,
			localMonth: null,
			localYear: null,
			localeFormat: null,
			
			days: [],
			currentDate: {
				start: null,
				end: null
			},
			
			selectedOption: 'one',
			hovering: true
		}
	},
	props: {
		date: { type: [String, Date], default:() => new Date()},
		format: { type: String, default: 'DD.MM.YYYY'},
		disableBefore: { type: [Date, String], default: () => new Date(null) },
		disableAfter: { type: [Date, String], default: () => null},
		isDouble: { type: Boolean, default: false},
		locale: { type: String, default: 'ru'},
		topButtons: { type: Boolean, default: false},
		value: { type: [Object,String], default: () => ({
			start: null,
			end: null
		})}
	},
	created() {
		this.localDate = this.parseDate(this.date);
		this.localYear = this.parseDate(this.date).getFullYear();
		this.localMonth = this.formatDate(this.parseDate(this.date), 'MMM');

		import('dayjs/locale/' + this.locale)
			.then(data => {
				dayjs.locale(this.locale);
			})
			.then(() => {
				this.monthDays();
				this.handleDays((val) => {
					val.isActive = val.value.getTime() === this.localDate.getTime() 
				})
			})
	},
	methods: {
		chooseOption(option) {
			if (this.selectedOption !== option) {
				this.selectedOption = option;
				this.handleDays((day) => { 
					day.isActive = false;
					day.isHovered = false; 
				});
				this.currentDate = {
					start: null,
					end: null 
				}
			}
		},
 		handleDays(func = null) {
			this.days.forEach(week => {
				week.forEach(day => func(day))
			})
		},
		formatDate(date, format) {
			return dayjs(date).format(format);
		},
		prevMonth() {
			let month = this.localDate.getMonth();
			let year = this.localDate.getFullYear();
			if (month === 0) {
				month = 12;
				year -= 1;
			}
			this.localDate.setMonth(month - 1);
			this.localDate.setFullYear(year), 
			this.localMonth = (this.formatDate(
				this.localDate, 
				'MMM', 
				{ locale: this.localeFormat})
			);
			this.monthDays();
			this.getYear();
		},
		nextMonth() {
			let month = this.localDate.getMonth();
			let year = this.localDate.getFullYear();
			if (month === 11) {
				month = -1
				year += 1;
			}
			this.localDate.setMonth(month + 1), 
			this.localDate.setFullYear(year), 
			this.localMonth = (this.formatDate(
				this.localDate,
				'MMM', 
				{ locale: this.localeFormat})
			);
			this.monthDays();
			this.getYear();
		},
		monthDays() {
			this.days = [];
			let weekStart = this.locale !== 'en';
			let firstDay = startOfMonth(this.localDate);
			let prevLastDay = new Date(dayjs(firstDay).subtract(1, 'day'));
			let res = [
			...getDates(
				startOfWeek(
					(prevLastDay.getDay() 
					? prevLastDay 
					: firstDay 
				), 
				weekStart),
				endOfWeek(lastDayOfMonth(
					!this.isDouble ? firstDay : new Date(dayjs(firstDay).add(1, 'month'))
 				), weekStart)
			)].map(item => {
				let {start, end} = this.currentDate;

				let checkActive = (
					start && item.getTime() === start.getTime()
					|| end && item.getTime() === end.getTime());

				let checkHover = (
					start && end && isBetween(start, end)(item)
				);

				let checkDisabled = this.checkDateDisabled(item);

				return {
					isHovered: checkHover,
					isActive: checkActive,
					isDisabled: checkDisabled,
					value: item
				};
			})
			for (var i = 0; i < res.length - 7; i+= 7)
				this.days.push(res.slice(i, i + 7))
			this.days.push(res.slice(i,))
		},
		parseDate(str) {
			if (str) {
				if (str.getDate !== undefined)
					return str; // String is actually a Date
				return new Date(dayjs(str, this.format));
			}
			return null;
		},
		checkDateDisabled(date) {
			let before = this.parseDate(this.disableBefore);
			let after  = this.parseDate(this.disableAfter);

			return before.getTime() > date.getTime()
			|| after
			&& after.getTime() < date.getTime()
		},
		getYear() {
			this.localYear = this.localDate.getFullYear();
		},
		setOne(date) {
			this.handleDays((day) => {
				day.isActive = day.value.getTime() === date.getTime();
			});

			this.currentDate = {
				start: date,
				end: null
			};

			this.$emit('input', this.formatDate(this.currentDate.start, this.format))
		},
		setRange(date) {
			let { start, end } = this.currentDate;

			if (start && end 
				&& date.getTime() !== start.getTime()
				&& date.getTime() !== end.getTime()) {
				this.hovering = true;
				this.currentDate.start = null;
			}

			if (!this.currentDate.start){
				this.setOne(date);
			} else {
				this.currentDate.end = date;
				this.hovering = false;
				if (date.getTime() < start.getTime())
					[this.currentDate.end, this.currentDate.start] = [start, end];

				let [s, e] = [
					this.formatDate(this.currentDate.start, this.format),
					this.formatDate(this.currentDate.end, this.format)
				]
				this.$emit('input', `${s} - ${e}`)
			}
		},
		hoverRange(date) {
			let { start } = this.currentDate;
			if (this.selectedOption === 'range'
				&& start !== null && this.hovering) {
				this.handleDays((day) => {
					if (day.value.getTime() !== date.getTime()) {
						if (day.value.getTime() !== start.getTime())
							day.isActive = false;
					} else  {
						day.isActive = true;
						this.currentDate.end = day.value;
					}
				});

				this.handleDays((innerDay) => {
					let between = isBetween(start, date);
					innerDay.isHovered = between(innerDay.value);
				});
			}
		},
		setDay(val) {
			if (this.selectedOption === 'one')
				this.setOne(val);
			else if (this.selectedOption === 'range')
				this.setRange(val);
		}
	},
	computed: {
		dayNames() {
			if (this.locale === 'en')
				return  ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
			return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
		}
	}
}
</script>
<style lang="scss">

$calendarBack: #fff;
$month: #202020;
$arrow: #7bb6db;
$buttonsColor: $arrow;
$shadow: 0px 0px 3px 2px #e3e4e9;

.calendar {
  padding: 10px 15px;
	background-color: $calendarBack;
	&-wrapper {
		width: max-content;
		padding: 20px 25px;
    box-shadow: $shadow; 
	}
	&-buttons {
		margin-bottom: 15px;
		display: flex;
		align-items: center;
		justify-content: center;
		& > * {
			border: 1px solid $buttonsColor;
			padding: 5px; 
			cursor: pointer;
			&:first-child {
				border-top-left-radius: 5px;
				border-bottom-left-radius: 5px;
			}
			&:last-child {
				border-top-right-radius: 5px;
				border-bottom-right-radius: 5px;

			}
			&.active {
				background-color: $buttonsColor;
				color: white;
			}
		}
	}
	&__main {
		& > * { 
			display: inline-block;
	    vertical-align: top; 
		}
	}
	&-top {
		&__nav {
			display: flex;
			align-items: center;
			justify-content: space-between;
		}
		&__arrow {
			// background-color: $arrow;
			padding: 14px;
			position: relative;
			cursor: pointer;
			&:hover {
				box-shadow: $shadow;
				transition: box-shadow .3s;
			}
			&::after,
			&::before {
				content: '';
				display: block;
				background-color: $month;
				height: 9px;
				width: 2px;
				position: absolute;
				top: 50%; left: 50%;
			}
			&::before {
				transform: translate(-50%, -50%) rotate(45deg);
			}
			&::after {
				transform: translate(-50%, -50%) rotate(-45deg);
			}
			&.left {
				margin-left: 10px;
				&::before {
					top: 40%;
		    	left: calc(50% - 2px);
				}
				&::after {
					top: 60%;
		    	left: calc(50% - 2px);
				}
			}
			&.right {
				margin-right: 10px;
				transform: rotate(180deg);
				&::after {
					top: 60%;
				}
				&::before {
					top: 40%;
				}
			}
		}
		&__month {}
	}
	&-bottom {
		&__daycell {}
	}
	&-date {
		border-collapse: collapse;
		& td { 
			padding: 10px;
			vertical-align: middle;
			text-align: center;
		}
	}
}
</style>