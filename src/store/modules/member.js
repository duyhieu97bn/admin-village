import { register, login, logout, profile } from 'api/auth'

const defaultState = () => {
  return {
    username: null,
    fullName: null,
    phoneNumber: null,
    address: null,
    email: null,
    role: null,
    // 
    member: null,
    memberData: null,
    roleList: [
      "role",
      "role:list",
      "member:list",
      "pair:list",
      "log:list"
    ],
    permissionList: [
      "role",
      "role:list",
      "member:list",
      "pair:list",
      "log:list",
      "member:update",
      "member:remove",
      "article:add",
      "article:remove"
    ]
  }
}

export default {
  state: defaultState(),

  mutations: {
    SET_MEMBER: (state, _member) => {
      // const { member, memberData, roleList, permissionList } = _member
      // state.member = member
      // state.memberData = memberData
      // state.roleList = roleList
      // state.permissionList = permissionList
      const { username, fullName, phoneNumber, address, email, role } = _member
      state.username = username
      state.fullName = fullName
      state.phoneNumber = phoneNumber
      state.address = address
      state.email = email
      state.role = role
    },
    RESET_MEMBER: (state) => {
      Object.assign(state, defaultState())
    }
  },

  actions: {
    authLogin({ commit }, params) {
      return new Promise((resolve, reject) => {
        login(params)
          .then((response) => {
            commit('SET_TOKEN', response.data)
            commit('SET_MEMBER', response.data.user)
            resolve(response.data)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    memberRegister({ commit }, params) {
      return new Promise((resolve, reject) => {
        register(params)
          .then((response) => {
            commit('SET_TOKEN', response.data)
            resolve(response.data)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    memberProfile({ commit }) {
      return new Promise((resolve, reject) => {
        profile()
          .then((response) => {
            commit('SET_MEMBER', response.data)
            resolve(response.data)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    memberLogout({ commit }) {
      return new Promise((resolve) => {
        logout().finally(() => {
          commit('RESET_MEMBER')
          commit('RESET_TOKEN')
          commit('RESET_ROUTERS')
          resolve()
        })
      })
    },
  }
}
