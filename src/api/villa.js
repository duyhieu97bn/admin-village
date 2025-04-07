import request from 'utils/request'

const group = '/component'

export function getListVilla(data) {
  return request({
    url: `${group}/villa`,
    method: 'GET',
    data: data
  })
}


export function updateDetail(data) {
  return request({
    url: `${group}/room`,
    method: 'POST',
    data: data
  })
}

export function add(data) {
  return request({
    url: `${group}/room`,
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
