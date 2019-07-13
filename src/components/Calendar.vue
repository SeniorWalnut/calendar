<template>
	<div class="calendar-wrapper">
		<div class="calendar__top calendar-top">
			<div class="calendar-top__arrow left"></div>
			<div class="calendar-top__month">{{ month }}</div>
			<div class="calendar-top__arrow right"></div>
		</div>
		<div class="calendar-component">
			<div class="calendar calendar-left">
				<div class="calendar__bottom calendar-bottom">
					<table class="calendar-bottom__date calendar-date">
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
			<div class="calendar calendar-right">
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
								/> 
							</td>
						</tr>
					</table>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import DayCell from './DayCell'
export default {
	components: { DayCell },
	data() {
		return {
			// days: new Array(35),
			month: 'July, 2018'
		}
	},
	mounted() {},
	methods: {},
	computed: {
		currentMonth() {
			return new Date().getMonth();
		},
		days() {
			let arr = [];
			for (let i = 0; i < 5; i++)
				arr.push(new Array(7).fill(Math.floor(Math.random() * 32)));
			arr.unshift(['m', 't', 'w', 'th', 'fri', 'sat', 'sun'])
			return arr;
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
	width: max-content;
	&-wrapper {
		width: max-content;
	}
	&-component {
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