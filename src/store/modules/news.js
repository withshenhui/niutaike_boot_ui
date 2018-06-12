import { fetchList, createNews, updateNews, removeNews } from '@/api/news'

const news = {
  state: {
   list:[],
   count:0
  },

  mutations: {
    GET_NEWS_LIST: (state, list, count) => {
      state.list = list
      state.count = count
    }
  },

  actions: {
    // GET LIST
    GetNewsList({ commit }, newsQuery) {
      return new Promise((resolve, reject) => {
        fetchList(newsQuery).then(response => {
          commit('GET_NEWS_LIST', response.data.data, response.data.count)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    }
  }
}

export default news
