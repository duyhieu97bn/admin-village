import request from 'utils/request'

const group = '/member'

export function detail(data) {
  return request({
    url: `${group}/detail`,
    method: 'POST',
    data: data
  })
}

export function list(data) {
  return request({
    url: `${group}/list`,
    method: 'POST',
    data: data
  })
}

export function updateDetail(data) {
  return request({
    url: `${group}/updateDetail`,
    method: 'PUT',
    data: data
  })
}

export function add(data) {
  return request({
    url: `${group}/add`,
    method: 'POST',
    data: data
  })
}

export function remove(data) {
  return request({
    url: `${group}/remove`,
    method: 'DELETE',
    data: data
  })
}
