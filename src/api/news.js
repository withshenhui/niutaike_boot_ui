import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/api/news/list',
    method: 'get',
    params: query
  })
}

export function fetchNews() {
  return request({
    url:`/api/news/${id}`,
    method: 'get'
  })
}

export function createNews(data) {
  return request({
    url: '/api/news/save',
    method: 'post',
    data
  })
}

export function updateNews(data) {
  return request({
    url: '/api/news/update',
    method: 'post',
    data
  })
}

export function removeNews(id) {
  return request({
    url: `/api/news/remove/${id}`,
    method: 'delete'
  })
}
