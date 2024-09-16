<template>
  <div class="container">
    <h1>{{ eventName }}</h1>
    <table class="table">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">User ID</th>
          <th scope="col">Name</th>
          <th scope="col">Surname</th>
          <th scope="col">Pitskill</th>
          <th scope="col">Pitrep</th>
        </tr>
      </thead>
      <tbody>
      <tr v-for="(driver, index) in drivers" :key="index">
        <td :class="getClass(index)">
          {{ index + 1 }}
        </td>
        <td :class="getClass(index)">
          {{ driver.userId }}
        </td>
        <td :class="getClass(index)">
          {{ driver.name }}
        </td>
        <td :class="getClass(index)">
          {{ driver.surname }}
        </td>
        <td :class="getClass(index)">
          {{ driver.pitskill }}
        </td>
        <td :class="getClass(index)">
          {{ driver.pitrep }}
        </td>
      </tr>
      </tbody>
    </table>

    <div v-if="loading">Loading...</div>
    <div v-if="error" style="color: red;">{{ error }}</div>
  </div>
</template>
<script>
import PitskillService from '@/services/PitskillService.js'

export default {
  name: 'DriverList',
  data () {
    return {
      drivers: [],
      driverList: [],
      loading: false, // To show a loading message
      error: null,
      eventName: ''
    }
  },
  computed: {
    getClasss (index) {
      return index < 30 ? 'bg-success-subtle' : index < 35 ? 'bg-warning-subtle' : 'bg-danger-subtle'
    }
  },
  methods: {
    getClass (index) {
      return index < 30 ? 'bg-success-subtle' : index < 35 ? 'bg-warning-subtle' : 'bg-danger-subtle'
    },
    async fetchNameSurname (userId) {
      try {
        const response = await PitskillService.getDriverList(userId) // Perform a GET request with axios

        const name = response.data.payload.sigma_user_data.profile_data.first_name || 'N/A'
        const surname = response.data.payload.sigma_user_data.profile_data.last_name || 'N/A'
        const pitskill = response.data.payload.tpc_driver_data.currentPitSkill || 'N/A'
        const pitrep = response.data.payload.tpc_driver_data.currentPitRep || 'N/A'

        return { userId, name, surname, pitskill, pitrep }
      } catch (error) {
        console.error(`Error fetching data for user ID: ${userId}`, error.message)
        return { userId, name: 'Error', surname: 'Error', pitskill: 'Error', pitrep: 'Error' }
      }
    },
    async fetchAllNames () {
      try {
        const promises = this.driverList.map(this.fetchNameSurname)
        const fetchedDrivers = await Promise.all(promises) // Fetch all data in parallel

        // Sort users by pitskill in descending order
        this.drivers = fetchedDrivers.sort((a, b) => b.pitskill - a.pitskill)
      } catch (err) {
        this.error = 'Failed to fetch user data'
      } finally {
        this.loading = false
      }
    },
    extractDriversId (data) {
      return data
        .flatMap(vehicle => vehicle.event_registrations)
        .map(registration => registration.user_id)
    },
    fetchEvent (eventId) {
      PitskillService.getEventInfo(eventId).then((response) => {
        this.driverList = this.extractDriversId(response.data.payload.event_vehicle_registration)
        this.eventName = response.data.payload.event_name
        this.fetchAllNames()
      })
    }
  },
  mounted () {
    this.fetchEvent('dee7bed6-520c-42b4-a075-e3aad4641a1a')
  }
}
</script>
