<template>
	<div class="option-select">
		<arrow 
			@arrow-click="$emit('arrow-left')"
			arrow-type="left"
		/>
			<div 
				class="option-select__option"
				@click="handleOption"
			>
				{{ curVal }}	
			</div>
		<arrow 
			@arrow-click="$emit('arrow-right')"
			arrow-type="right"
		/>	
	</div>
</template>
<script>
import Arrow from './Arrow';
export default {
	components: {
		Arrow
	},
	props: {
		curVal: {
			type: [Number, String],
			default: ''
		}
	},
	data() {
		return {
			active: false
		}
	},
	methods: {
		handleOption() {
			this.active = !this.active;
			this.$emit('click', this.active);
		}
	}
}
</script>
<style lang="scss">
$buttonsColor: #ff8584;
.option-select {
	display: flex;
	align-items: center;
	&__option {
		color: $buttonsColor;
		font-weight: bold;
		font-size: 14px;
		cursor: pointer;
		text-decoration: underline;
	}
}
</style>