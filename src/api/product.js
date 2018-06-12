import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/api/product/list',
    method: 'get',
    params: query
  })
}

export function fetchProduct() {
  return request({
    url:`/api/product/${id}`,
    method: 'get'
  })
}

export function createProduct(data) {
  return request({
    url: '/api/product/save',
    method: 'post',
    data
  })
}

export function updateProduct(data) {
  return request({
    url: '/api/product/update',
    method: 'post',
    data
  })
}

export function removeProduct(id) {
  return request({
    url: `/api/product/remove/${id}`,
    method: 'delete'
  })
}
