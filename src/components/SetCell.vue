<template>
	<div 
		class="set-cell"
		@click="$emit('click', value)"
		:class="{ active: isActive }"
	>{{ value }}</div>
</template>
<script>
export default {
	props: {
		value: {
			type: [Number, String],
			default: ''
		},
		isActive: {
			type: Boolean,
			default: false
		}
	}
}
</script>
<style lang="scss">
$buttonsColor: #ff8584;

.set-cell {
	padding: 8px;
	color: #202020;
	cursor: pointer;
	font-size: 14px;
	&.active {
		background-color: $buttonsColor;
		font-weight: bold;
		color: white;
	}
}
</style>