<template>
  <div id="app">
    <daterange 
      title="Дата рождения"
      placeholder="DD.MM.YYYY"
      :value="date"
      @input="date = $event"
      locale="en"
      :is-double="true"
    />
  </div>
</template>

<script>
import Daterange from './components/Daterange';
export default {
  name: 'app',
  components: {
    Daterange
  },
  data() {
    return {
      date: '',
    }
  }
}
</script>

<style>
#app {
  font-family: 'Roboto', sans-serif;
}
</style>
