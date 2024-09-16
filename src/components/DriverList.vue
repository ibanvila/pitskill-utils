<template>
  <div class="container mt-5 mb-5">
    <form class="row">
      <div class="col-3">
        <div class="input-group">
          <span class="input-group-text">
        <i class="bi bi-x-lg" @click="eventId=''"></i></span>
        <input type="text" v-model="eventId" class="form-control" placeholder="Enter event ID" aria-label="Username" aria-describedby="basic-addon1">
      </div>
      </div>
      <div class="col-1">
        <button type="button" class="btn btn-primary" @click="updateEvent">Search</button>
      </div>
      <div class="col-7">
        <h1>{{ eventName }}</h1>
      </div>
    </form>
    <table class="table mt-3">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">User ID</th>
          <th scope="col">Name</th>
          <th scope="col">Surname</th>
          <th scope="col">Pitskill</th>
          <th scope="col">Pitrep</th>
          <th scope="col" class="border-0">Class</th>
        </tr>
      </thead>
      <tbody>
      <tr v-for="(driver, index) in driversInfo" :key="index">
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
        <td class="border-0">
          <div :class="driver.clazz.style">{{ driver.clazz.name }}</div>
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
      driversInfo: [],
      eventDrivers: [],
      loading: false, // To show a loading message
      error: null,
      eventName: '',
      eventId: ''
    }
  },
  computed: {

  },
  methods: {
    updateEvent () {
      console.log(this.eventId)
      this.fetchEvent()
    },
    getClass (index) {
      if (this.eventName.includes('GT3 Elite')) {
        return index < 30 ? 'bg-success-subtle' : index < 35 ? 'bg-warning-subtle' : 'bg-danger-subtle'
      } else {
        return ''
      }
    },
    async fetchNameSurname (userId) {
      try {
        const response = await PitskillService.getDriverList(userId) // Perform a GET request with axios

        const name = response.data.payload.sigma_user_data.profile_data.first_name || 'N/A'
        const surname = response.data.payload.sigma_user_data.profile_data.last_name || 'N/A'
        const pitskill = response.data.payload.tpc_driver_data.currentPitSkill || 'N/A'
        const pitrep = response.data.payload.tpc_driver_data.currentPitRep || 'N/A'
        const clazz = this.getLicense(pitskill, pitrep)

        return { userId, name, surname, pitskill, pitrep, clazz }
      } catch (error) {
        console.error(`Error fetching data for user ID: ${userId}`, error.message)
        return { userId, name: 'Error', surname: 'Error', pitskill: 'Error', pitrep: 'Error' }
      }
    },
    async fetchAllNames () {
      try {
        const promises = this.eventDrivers.map(this.fetchNameSurname)
        const fetchedDrivers = await Promise.all(promises) // Fetch all data in parallel

        // Sort users by pitskill in descending order
        this.driversInfo = fetchedDrivers.sort((a, b) => b.pitskill - a.pitskill)
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
    fetchEvent () {
      if (this.eventId !== '') {
        console.log(this.eventId)
        PitskillService.getEventInfo(this.eventId).then((response) => {
          if (response.data.payload) {
            this.eventDrivers = this.extractDriversId(response.data.payload.event_vehicle_registration)
            this.eventName = response.data.payload.event_name
            this.fetchAllNames()
          } else {
            this.eventDrivers = []
            this.driversInfo = []
            this.eventName = 'Wrong event ID'
          }
        })
      }
    },
    getLicense (pitskill, pitrep) {
      console.log(pitskill)
      console.log(pitrep)
      if (pitskill > 4500 && pitrep > 20.00) {
        return { name: 'Elite', style: 'font-bold rounded border text-center bg-black text-white border-warning' }
      } else if (pitskill > 3500 && pitrep > 20.00) {
        return { name: 'Pro', style: 'font-bold rounded border text-center bg-white text-black border-black' }
      } else if (pitskill > 3000 && pitrep > 15.00) {
        return { name: 'Veteran', style: 'font-bold rounded border text-center bg-white text-black border-black' }
      } else if (pitskill > 2500 && pitrep > 15.00) {
        return { name: 'Platinum', style: 'font-bold rounded border text-center bg-class-gray text-black border-dark-subtle' }
      } else if (pitskill > 2000 && pitrep > 10.00) {
        return { name: 'Silver', style: 'font-bold rounded border text-center bg-class-gray text-black border-dark-subtle' }
      } else if (pitskill > 1750 && pitrep > 10.00) {
        return { name: 'Steel', style: 'font-bold rounded border text-center bg-class-gray text-black border-dark-subtle' }
      } else if (pitskill > 1500 && pitrep > 5.00) {
        return { name: 'Bronze', style: 'font-bold rounded border text-center bg-class-red text-white border-white' }
      } else if (pitskill > 1000 && pitrep > 5.00) {
        return { name: 'Copper', style: 'font-bold rounded border text-center bg-class-red text-white border-white' }
      } else if (pitskill > 0 && pitrep > 5.00) {
        return { name: 'AM', style: 'font-bold rounded border text-center bg-class-red text-white border-white' }
      }
      return { name: 'PROVISIONAL', style: 'font-bold rounded border text-center bg-class-red text-white border-white' }
    }
  },
  mounted () {
    this.fetchEvent()
  }
}
</script>
