<template>
		<div class="calendar-wrapper">
			<div class="calendar__top calendar-top">
				<div 
					class="calendar-top__arrow left"
					@click="prevMonth"
				></div>
				<div class="calendar-top__month">{{ localMonth }}</div>
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

import {  
	format,
	eachDay,
	lastDayOfMonth,
	startOfMonth,
	parse,
	startOfWeek,
	endOfWeek,
	subDays
} from 'date-fns';

export default {
	components: { DayCell },
	data() {
		return {
			// days: new Array(35),
			days: [],
			localDate: new Date(this.date),
			localeFormat: null,
			localMonth: format(this.date, 'MMM', { locale: this.localeFormat})
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
		locale: { type: String, default: 'ru'}
	},
	created() {
		import('date-fns/locale/' + this.locale)
			.then(data => {
				this.localeFormat  = data.format; 
		})
	},
	methods: {
		prevMonth() {
			let month = this.localDate.getMonth();
			if (month === 0) month = 12;
			this.localDate.setMonth(month - 1);
			this.localMonth = (format(
				this.localDate, 
				'MMM', 
				{ locale: this.localeFormat})
			);
			this.monthDays();
		},
		nextMonth() {
			let month = this.localDate.getMonth();
			if (month === 12) month = -1
			this.localDate.setMonth(month + 1), 
			this.localMonth = (format(
				this.localDate,
				'MMM', 
				{ locale: this.localeFormat})
			);
			this.monthDays();
		},
		monthDays() {
			let weekStart = this.locale !== 'en';
			let firstDay = startOfMonth(this.localDate, {weekStartsOn: weekStart});
			let prevLastDay = subDays(firstDay, 1);
			let res = [
			...eachDay(
				startOfWeek(prevLastDay, {weekStartsOn: weekStart}),
				lastDayOfMonth(firstDay, {weekStartsOn: weekStart})
			)].map(item => {
				return {
					isActive: false,
					value: item
				}
			})
			for (let i = 0; i < res.length - 6; i+= 6)
				this.days.push(res.slice(i, i + 6))
		}
	},
	computed: {
		dayNames() {
			return ['m', 't', 'w', 'th', 'fri', 'sat', 'sun'];
		}
	}
}
</script>
<style lang="scss">

$calendarBack: #fff;
$month: #202020;
$arrow: #7bb6db;
$shadow: 0px 0px 3px 2px #e3e4e9;

.calendar {
	padding: 10px 15px;
	background-color: $calendarBack;
	&-component {
		width: max-content;
		box-shadow: $shadow;
		& > * {
			display: inline-block;
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