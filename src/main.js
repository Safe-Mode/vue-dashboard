import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import Vuelidate from 'vuelidate'

import router from './router'
import store from './store'

Vue.use(Vuelidate)

axios.defaults.baseURL = 'https://vue-update-c0899.firebaseio.com'
// axios.defaults.headers.common['Authorization'] = 'dgdfg'
axios.defaults.headers.get['Accepts'] = 'application/json'

const reqInterceptor = axios.interceptors.request.use((config) => {
  console.log('ReqInterceptor', config);
  return config
})

const resInterceptor = axios.interceptors.response.use((config) => {
  console.log('ResInterceptor', config);
  return config
})

axios.interceptors.request.eject(reqInterceptor)
axios.interceptors.response.eject(resInterceptor)

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
