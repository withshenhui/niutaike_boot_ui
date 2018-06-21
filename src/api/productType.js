import request from '@/utils/request'

export function fetchResult() {
  return request({
    url: '/api/productype/result',
    method: 'get'
  })
}

export function fetchList(query) {
  return request({
    url: '/api/productype/index',
    method: 'get',
    params: query
  })
}

export function createProductType(data) {
  return request({
    url: '/api/productype/save',
    method: 'post',
    data
  })
}

export function updateProductType(data) {
  return request({
    url: '/api/productype/update',
    method: 'post',
    data
  })
}

export function removeProductType(id) {
  return request({
    url: `/api/productype/remove/${id}`,
    method: 'delete'
  })
}