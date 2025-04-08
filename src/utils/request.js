import axios from 'axios'
import store from '@/store'
import router from '@/router'
import { ElMessage, ElLoading } from 'element-plus'

export const baseUrl = import.meta.env.VITE_API_DOMAIN

// refreshing token flag
let isRefreshing = false
let refreshSuccess = false
// retry requests queue
let requests = []
// fullscreen loading instance
let loadingInstance = null

// retry config
const retryConfig = {
    times: 1,
    delay: 1000,
}
const retryAdapterEnhancer = (adapter, options) => {
    const { times = retryConfig.times, delay = retryConfig.delay } = options
    return async (config) => {
        const { retryTimes = times, retryDelay = delay } = config
        let retryCount = 0
        const request = async () => {
            try {
                return await adapter(config)
            } catch (error) {
                if (!retryTimes || retryCount >= retryTimes) {
                    return Promise.reject(error)
                }
                retryCount += 1
                // delay process
                const delayFunc = new Promise((resolve) => {
                    setTimeout(() => resolve(), retryDelay)
                })
                // send the request again
                return delayFunc.then(() => request())
            }
        }
        return request()
    }
}

const setGetConfig = (config) => {
    config.baseURL = baseUrl
    const accessToken = store.getters.token && store.getters.token.accessToken ? store.getters.token.accessToken : ''
    config.headers['Authorization'] = `Bearer ${accessToken}`
    if (config.method === 'post' && !config.headers['Content-type']) {
        // will send preflight request (OPTIONS), needs back-end response correctly
        config.headers['Content-type'] = 'application/json;charset=UTF-8'
    }
    return config
}

const instance = axios.create({
    withCredentials: false,
    timeout: 5000,
    adapter: retryAdapterEnhancer(axios.defaults.adapter, retryConfig),
})

instance.interceptors.request.use(
    (config) => {
        if (config.method === 'get' && config.data) {
            const data = new URLSearchParams(config.data).toString()
            config.url += `?${data}`
        }
        loadingInstance = ElLoading.service({ fullscreen: true })
        return setGetConfig(config)
    },
    (error) => {
        return Promise.reject(error)
    }
)

const authErrorCallback = async (error) => {
    await store.dispatch('memberLogout')
    ElMessage.error(`${error}, please login`)
    router.push({ path: '/login' })
    return Promise.reject(response.data)
}

instance.interceptors.response.use(
    (response) => {
        loadingInstance && loadingInstance.close()
        if (response.data.message === "success") {
            return Promise.resolve(response.data)
        } else {
            if (response.data.message === 4001) {
                console.error('Token error:', response.data.msg)
                return authErrorCallback(response.msg)
            } else if (response.data.message === 4002) {
                console.error('Access token error, msg:', response.data.msg)
                console.error('Access token error, requests:', requests)
                console.error('Access token error, isRefreshing:', isRefreshing)
                const config = response.config
                if (!isRefreshing) {
                    const refreshToken = store.getters.token && store.getters.token.refreshToken ? store.getters.token.refreshToken : ''
                    if (refreshToken === null || refreshToken === '') {
                        return authErrorCallback('Empty refreshToken.')
                    }

                    console.debug('Refresh token, please wait...')
                    ElMessage.info('Refresh token, please wait...')

                    isRefreshing = true
                    return store.dispatch('refreshAccessToken', { refreshToken: refreshToken }).then(() => {
                        ElMessage.success('Refresh access token success, retry pending requests...')
                        console.debug('Refresh access token success, requests:', requests)
                        isRefreshing = false
                        refreshSuccess = true
                    }).catch((error) => {
                        isRefreshing = false
                        refreshSuccess = false
                        console.error('Refresh access token error:', error)
                        return authErrorCallback(error)
                    }).finally(() => {
                        if (refreshSuccess === true) {
                            // already refreshed token, retry pending requests
                            // don't put below code into above 'refreshToken' then()
                            // because if instace() return Promise.reject()
                            // that will be catched by above 'refreshToken' catch() and call authErrorCallback()
                            requests.forEach(callback => callback())
                            requests = []
                            return instance(setGetConfig(config))
                        }
                    })
                } else {
                    // pending requests when refreshing token
                    return new Promise((resolve) => {
                        requests.push(() => {
                            resolve(instance(setGetConfig(config)))
                        })
                    })
                }
            } else if (response.data.message === 4003) {
                console.error('Refresh access token error:', response.data.msg)
                return authErrorCallback(response.msg)
            } else {
                console.error('response message !== 0', response.data.msg)
                return Promise.reject(response.data)
            }
        }
    },
    (error) => {
        loadingInstance && loadingInstance.close()
        console.error('response error', error)
        if (error.response.status === 401 && !error.config.url.includes('logout')) {
            // 401 error, token expired
            return authErrorCallback(error.message)
        } 
        return Promise.reject(error)
    }
)

export default instance
