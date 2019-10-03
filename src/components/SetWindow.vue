<template>
	<div class="set-window">
		<div class="set-window__wrap">
			<arrow 
				v-show="arrows"
				arrow-type="left"
				@arrow-click="$emit('arrow-left')"
			/>
			<table class="set-window__cells">
				<tr v-for="vals in divValues">
					<td v-for="val in vals">
						<set-cell 
							:value="val"
							@click="setVal"
							:is-active="activeVal === val"
						/>
					</td>
				</tr>
			</table>
			<arrow
				arrow-type="right"
				v-show="arrows"
				@arrow-click="$emit('arrow-right')"
			/>
		</div>
	</div>
</template>
<script>
import SetCell from "./SetCell";
import Arrow from "./Arrow";
export default {
	components: {
		SetCell,
		Arrow
	},
	props: { 
		values: {
			type: Array,
			default: () => []
		},
		arrows: {
			type: Boolean,
			default: false
		},
		curVal: {
			type: [Number, String],
			default: ''
		}
	},
	data() {
		return {
			activeVal: null
		}
	},
	watch: {
		curVal(val) {
			this.activeVal = val;	
		}
	},
	created() {
		this.activeVal = this.curVal;
	},
	computed: {
		divValues() {
			const res = [];
			for (let i = 0; i < this.values.length; i+=3)
				res.push(this.values.slice(i, i + 3));
			return res;
		}
	},
	methods: {
		setVal(val) {
			this.activeVal = val;
			this.$emit('set-val', val);
		}
	}
}
</script>

<style lang="scss">
.set-window {
	&__wrap {
		display: flex;
		align-items: center;
	}
	&__cells {
		& td {
			padding: 6px;
			text-align: center;
		}
	}
}
</style>