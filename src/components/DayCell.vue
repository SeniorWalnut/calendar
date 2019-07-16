<template>
	<div 
		class="day-cell"
		:class="[ 
			{active: day.isActive}, 
			{disabled: day.isDisabled},
			{hovered: day.isHovered} 
		]"
		@click="!day.isDisabled && $emit('set-day', day.value)"
		@mouseenter="$emit('hovered', day.value)"
	>
		<div 
			class="day-cell__date"
		>{{ dayNum }}</div>
	</div>
</template>
<script>
export default {
	props: {
		day: { 
			type: Object, 
			default: () => {
				return {
		 			isActive: false,
					value: new Date(),
					isHovered: false,
					isDisabled: false
				}
			}
		}
	},
	computed: {
		dayNum() {
			return this.day.value.getDate();
		}
	} 
}
</script>

<style lang="scss">
$active: #A64636;
$hovered: #E5AFAB;
$disabled: #e3e4e9;
	.day-cell {
		cursor: pointer;
		&.active {
			background-color: $active;
			color: white;
		}
		&.hovered {
			background-color: $hovered;
			color: white;
		}
		&.disabled {
			color: $disabled;
			cursor: default;
		}
		// &__date {		}
	}
</style>