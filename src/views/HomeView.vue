<template>
  <div class="home">
    <DriverList/>
  </div>
</template>

<script>
import DriverList from '@/components/DriverList.vue'

export default {
  name: 'HomeView',
  components: {
    DriverList
  }
}
</script>
