import Vue from 'vue'
import Vuex from 'vuex'
import axios from './axios-auth'
import globalAxios from 'axios'
import router from './router'
import apiKey from './apiKey'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    idToken: null,
    userId: null,
    user: null
  },
  mutations: {
    AUTH_USER (state, userData) {
      state.idToken = userData.idToken
      state.userId = userData.localId
    },
    STORE_USER (state, user) {
      state.user = user
    },
    RESET_AUTH_DATA (state) {
      state.idToken = null
      state.userId = null
    }
  },
  actions: {
    setLocalStorage (context, data) {
      const now = new Date()
      const expDate = new Date(now.getTime() + data.expiresIn * 1000)

      window.localStorage.setItem('token', data.idToken)
      window.localStorage.setItem('expDate', expDate)
      window.localStorage.setItem('userId', data.localId)
    },
    setLogoutTimer ({ dispatch }, expTime) {
      window.setTimeout(() => {
        dispatch('logout')
      }, expTime * 1000)
    },
    signup ({ commit, dispatch }, authData) {
      axios.post(`signupNewUser?key=${apiKey}`, {
        email: authData.email,
        password: authData.password,
        returnSecureToken: true
      })
          .then((response) => {
            console.log(response)
            commit('AUTH_USER', response.data)
            commit('STORE_USER', authData)
            dispatch('setLocalStorage', response.data)
            dispatch('storeUser', response.data)
            dispatch('setLogoutTimer', response.data.expiresIn)
            router.replace('dashboard')
          })
          .catch((error) => {
            console.log(error)
          })
    },
    login ({ commit, dispatch }, authData) {
      axios.post(`verifyPassword?key=${apiKey}`, {
        email: authData.email,
        password: authData.password,
        returnSecureToken: true
      })
          .then((response) => {
            console.log(response)
            commit('AUTH_USER', response.data)
            commit('STORE_USER', authData)
            dispatch('setLocalStorage', response.data)
            dispatch('setLogoutTimer', response.data.expiresIn)
            router.replace('dashboard')
          })
          .catch((error) => {
            console.log(error)
          })
    },
    logout ({ commit }) {
      commit('RESET_AUTH_DATA')
      window.localStorage.removeItem('token')
      window.localStorage.removeItem('expDate')
      window.localStorage.removeItem('userId')
      router.replace('signin')
    },
    autoLogin ({ commit }) {
      const token = window.localStorage.getItem('token')

      if (!token) {
        return
      }

      const expDate = window.localStorage.getItem('expDate')
      const userId = window.localStorage.getItem('userId')
      const now = new Date

      if (now >= expDate) {
        return
      }

      commit('AUTH_USER', {
        idToken: token,
        localId: userId
      })
    },
    fetchUser ({ commit, state }) {
      if (!state.idToken) {
        return
      }

      globalAxios.get('users.json' + '?auth=' + state.idToken)
          .then((response) => {
            console.log(response.data);
            const users = []

            for (let key in response.data) {
              const user = response.data[key]
              user.id = key
              users.push(user)
            }

            console.log(users);
          })
          .catch(error => console.log(error))
    },
    storeUser ({ commit, state }, userData) {
      if (!state.idToken) {
        return
      }

      globalAxios.post('users.json' + '?auth=' + state.idToken, userData)
          .then((response) => {
            console.log(response)
          })
          .catch((error) => {
            console.log(error)
          })
    }
  },
  getters: {
    user (state) {
      return state.user
    },
    isAuth (state) {
      return state.idToken !== null
    }
  }
})
