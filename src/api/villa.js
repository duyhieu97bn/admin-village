import request from 'utils/request'

const group = '/component'

export function detail(data) {
  return request({
    url: `${group}/detail`,
    method: 'POST',
    data: data
  })
}

export function listVilla(data) {
  return request({
    url: `${group}/villa`,
    method: 'POST',
    data: data
  })
}

export function listAmenity(data) {
  return request({
    url: `/${group}/listAmenity`,
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
