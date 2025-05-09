import request from 'utils/request'

const group = ''

export function isMemberExist(data) {
  return request({
    url: `${group}/isMemberExist`,
    method: 'POST',
    data: data
  })
}

export function validateOldPassword(data) {
  return request({
    url: `${group}/validateOldPassword`,
    method: 'POST',
    data: data
  })
}

export function register(data) {
  return request({
    url: `${group}/register`,
    method: 'POST',
    data: data
  })
}

export function login(data) {
  return request({
    url: `${group}/login`,
    method: 'POST',
    data: data
  })
}

export function logout() {
  return request({
    url: `${group}/logout`,
    method: 'DELETE'
  })
}

export function validateAccessToken() {
  return request({
    url: `${group}/validateAccessToken`,
    method: 'POST'
  })
}

export function refreshAccessToken(data) {
  return request({
    url: `${group}/refreshAccessToken`,
    method: 'PUT',
    data: data
  })
}

export function profile() {
  return request({
    url: `${group}/profile`,
    method: 'GET'
  })
}

export function updatePassword(data) {
  return request({
    url: `${group}/updatePassword`,
    method: 'PUT',
    data: data
  })
}

export function updateProfile(data) {
  return request({
    url: `${group}/updateProfile`,
    method: 'PUT',
    data: data
  })
}
