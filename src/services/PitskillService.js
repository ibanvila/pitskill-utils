import axios from 'axios'
const githubAxios = axios.create({
  baseURL: '',
  headers: {
    'Content-type': 'application/json'
  }
})

class PitskillService {
  getDriverList (userId) {
    return githubAxios.get(`https://api.pitskill.io/api/pitskill/getdriverinfo?id=${userId}`)
  }

  getEventInfo (eventId) {
    return githubAxios.get(`https://api.pitskill.io/api/events/${eventId}`)
  }
}

export default new PitskillService()
