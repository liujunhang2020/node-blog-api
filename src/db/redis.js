const redis = require('redis')
const {REDIS_CONF} = require('../config/db')

const redisClient = redis.createClient(REDIS_CONF.port,REDIS_CONF.host)

redisClient.on('error',err=> {
    if(err) {
        console.error(err)
    }
})

function set(key,val) {
    if(typeof val === 'object') { // 如果val的值是一个对象，那么就把这个数据转换成json
        val = JSON.stringify(val)
    }
    redisClient.set(key,val,redis.print)
}

function get(key) { // get是一个异步操作，所以使用promise
    return new Promise((resolve,reject)=> {
        redisClient.get(key,(err,val)=> {
            if(err) {
                reject(err)
                return 
            }
            // 如果是key 是null
            if(val ===null) {
                resolve(null)
                return 
            }
            // 如果value是json，那么就解析
            try {
                resolve(
                    JSON.parse(val)
                )
            }catch(ex) {
                resolve(val)
            }
        })
    })
}

module.exports = {
    set,
    get 
}