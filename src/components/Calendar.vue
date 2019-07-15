<template>
		<div class="calendar-wrapper">
			<div 
				class="calendar-buttons"
				v-if="topButtons"
			>
				<div 
					class="calendar-buttons__one"
					@click="chooseOption('one')"
					:class="{active: selectedOption === 'one'}"
				>One</div>
				<div 
					class="calendar-buttons__range"
					@click="chooseOption('range')"
					:class="{active: selectedOption === 'range'}"
				>Range</div>
			</div>
			<div class="calendar__top calendar-top">
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
			<div class="calendar calendar-left">
				<div class="calendar__bottom calendar-bottom">
					<table class="calendar-bottom__date calendar-date">
						<tr class="calendar-date__day-names">
							<td v-for="name in dayNames">
								{{ name }}
							</td>
						</tr>
						<tr
							class="calendar-date__week"
							v-for="week in days"
						>
							<td v-for="day in week">
								<day-cell 
								  :day="day"
								  @set-day="setDay"
								/> 
							</td>
						</tr>
					</table>
				</div>
			</div>
			<div 
				class="calendar calendar-right"
				v-if="isDouble"
			>
				<div class="stub"></div>
				<div class="calendar__bottom calendar-bottom">
					<table class="calendar-bottom__date calendar-date">
						<tr
							class="calendar-date__week"
							v-for="week in days"
						>
							<td v-for="day in week">
								<day-cell 
								  :day="day"
								  @set-day="$event => fetchSelectedDay($event)"
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
import { getDates } from '../config/array-of-dates.js';
import { 
	startOfWeek,
	endOfWeek,
	lastDayOfMonth,
	startOfMonth
} from '../config/dates-helpers.js';

import {  
	// lastDayOfMonth, // here
	parse, // here
	subDays // here
} from 'date-fns';

export default {
	components: { DayCell },
	data() {
		return {
			days: [],
			localDate: new Date(this.date),
			localeFormat: null,
			currentDate: {
				start: null,
				end: null
			},
			localMonth: null,
			localYear: parseInt(this.formatDate(this.date, 'YYYY', { locale: this.localeFormat})),
			selectedOption: 'one'
		}
	},
	props: {
		date: { type: [String, Date], default:() => new Date()},
		format: { type: String, default: 'DD.MM.YYYY'},
		range: { type: Object, default: () => ({
			start: new Date(null),
			end: new Date(new Date().getFullYear() + 100, 1, 1)
		})},
		dateDisable: { type: Object, default: () => null},
		isDouble: { type: Boolean, default: false},
		locale: { type: String, default: 'ru'},
		topButtons: { type: Boolean, default: false},
		value: { type: [Object,String], default: () => ({
			start: null,
			end: null
		})}
	},
	created() {
		import('date-fns/locale/' + this.locale)
			.then(data => {
				this.localeFormat  = data;
				this.localMonth = this.formatDate(this.date, 'MMM', { locale: this.localeFormat})
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
			this.selectedOption = option;
			this.handleDays((day) => { day.isActive = false; });
			window.removeEventListener('mousemove', this.hoverWhileRange);
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
			console.log(startOfWeek(new Date(), 1))
			this.days = [];
			let weekStart = this.locale !== 'en';
			let firstDay = startOfMonth(this.localDate);
			let prevLastDay = subDays(firstDay, 1);
			let res = [
			...getDates(
				startOfWeek(
					(prevLastDay.getDay() 
					? prevLastDay 
					: firstDay 
				), 
				weekStart),
				lastDayOfMonth(firstDay)
			)].map(item => {
				let check = (this.currentDate.start && item.getTime() === this.currentDate.start.getTime())
				return {
					isActive: check,
					value: item
				}
			})
			for (var i = 0; i < res.length - 7; i+= 7)
				this.days.push(res.slice(i, i + 7))
			this.days.push(res.slice(i,))
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
			if (!this.currentDate.start)
				this.setOne(date);
			window.addEventListener('mousemove', this.hoverWhileRange);
		},
		hoverWhileRange(event) {
			console.log(event)
		},
		setDay(val) {
			if (this.selectedOption === 'one')
				this.setOne(val);
			else if (this.selectedOption === 'range')
				this.setRange(val);
			// else if (this.selectedOption === 'range')
			// 	this.setRange(val);
			// this.days.forEach(week => {
				// week.forEach(day => {
				// 	if (this.selectedOption === 'one')
				// 		this.setOneOption(val)*/
				// 	// if (day.value.getTime() === val.getTime())
					// 	day.isActive = true;
					// else if (this.selectedOption === 'one')
					// 	day.isActive = false;
					// else if (this.selectedOption === 'range'
					// 	&& val.getTime() !== )
			// 	})
			// });

			// this.currentDate = val;
			// let date = {
			// 	start: null,
			// 	end: null
			// };

			// if (selectedOption === 'range' && date.end)
			// 	date.end = val;
			// else date.start = val;

			// this.$emit('input', date);
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
	&-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
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