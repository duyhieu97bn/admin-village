import request from 'utils/request'

const group = '/component'

export function getListAmenity(data) {
  return request({
    url: `${group}/amenity`,
    method: 'GET',
    data: data
  })
}

export function getListRoomType(data) {
  return request({
    url: `${group}/room-type`,
    method: 'GET',
    data: data
  })
}
