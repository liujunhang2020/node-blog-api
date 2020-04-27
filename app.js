const querystring = require('querystring')

const handleBlogRouter = require("./src/router/blog")
const handleUserRouter = require("./src/router/user")

const { get, set } = require('./src/db/redis')

const { access } = require('./src/utils/log')


// 设置一个函数，用来设置cookie的过期时间
const getCookieExpires = () => {
    const d = new Date()
    d.setTime(d.getTime() + (24 * 60 * 60 * 1000))
    console.log('d.toGMTString() is ', d.toGMTString())
    return d.toGMTString()
}


// 存储session
// const SESSION_DATA = {}

// 创建一个函数，用来接受post data 
const getPostData = (req) => {
    // 返回值是一个promise
    const promise = new Promise((resolve, reject) => {

        // 如果请求的方法不是post 则返回一个空对象
        if (req.method !== 'POST') {
            resolve({})  // 注意，虽然请求方法并不属于post，但是并不属于错误，所以使用resolve而不是reject
            return
        }
        // 如果请求的数据不是一个json数据
        if (req.headers['content-type'] !== 'application/json') {
            resolve({})
            return
        }

        // 正式的处理数据
        let postData = ''
        req.on('data', chunk => {
            postData += chunk.toString()
        })
        req.on('end', () => {
            // 数据接收完毕之后来判断一下接收的数据是否为空
            if (!postData) {
                // 如果数据为空
                resolve({})
                return
            }
            // 不为空则解析数据
            resolve(
                JSON.parse(postData)
            )
        })
    })
    return promise
}

const serverHandle = (req, res) => {

    //============================== 记录日志
    access(`${req.method} -- ${req.url} -- ${req.headers['user-agent']} -- ${Date.now()}`)



    //=============================== 设置返回格式
    res.setHeader("Content-type", "application/json")

    //=============================== 获取path
    let url = req.url
    req.path = url.split('?')[0]

    //===============================获取query 
    req.query = querystring.parse(url.split('?')[1])

    //=============================== 解析cookie
    req.cookie = {}
    const cookieStr = req.headers.cookie || ''
    // cookie 存储的值是k1=2;k2=3 这种格式，下面我们来把cookie处理
    cookieStr.split(';').forEach(item => {
        if (!item) { // 如果item为空，则停止
            return
        }
        const arr = item.split('=') // 在将数组通过=进行分割
        const key = arr[0].trim()
        const val = arr[1].trim()
        req.cookie[key] = val
    })
    // console.log('req.cookie is ', req.cookie)

    // ================================ 解析session
    /*
    let needSetCookie = false // 是否需要设置cookie
    // 获取cookie当中的userid
    let userId =req.cookie.userid 
    // 判断req.cookie当中是否存在这个userId
    if(userId) { // 如果请求的req中存在userId
        // 判断当前SESSION_DATA当中是否存在与userId对应的数据
        if(!SESSION_DATA[userId]) { // 如果SESSION_DATA当中没有
            SESSION_DATA[userId] = {} // 没有就对其进行初始化
        }
        // 如果有的话,就把对应的数据赋值给req.session
        // req.session = SESSION_DATA[userId]
    }else { // 如果请求中没有userId
        needSetCookie = true 
        userId = `${Date.now()}_${Math.random()}`//// 没有userId 就把userId赋值为当前的时间戳
        SESSION_DATA[userId] = {} 
    }
    req.session = SESSION_DATA[userId] // {}
    */

    // =======================解析session，使用redis=================================
    let needSetCookie = false // 是否需要设置cookie
    let userId = req.cookie.userid
    if (!userId) {
        needSetCookie = true
        userId = `${Date.now()}_${Math.random()}`
        // 初始化redis当中的session值
        set(userId, {})
    }
    // 获取session
    req.sessionId = userId
    get(req.sessionId).then(sessionData => {
        // console.log('6----',sessionData) sessionData是一个空 {}
        if (sessionData === null) {
            // 初始化redis当中的session值
            set(req.sessionId, {})
            // 设置session
            req.seesion = {}
            // console.log('3-----',req.session)
        } else {
            // 设置session
            req.session = sessionData
            // console.log('4-----',req.session)
        }
        //=============================== 处理post数据
        return getPostData(req)
    })
        // 在正式处理路由之前先来接收post数据
        .then(postData => {
            req.body = postData // 将getPostData接收的数据存储到req.body身上

            //****************************处理blog路由****************************
            const blogResult = handleBlogRouter(req, res)
            if (blogResult) {
                blogResult.then(blogData => {
                    if (needSetCookie) {
                        res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`)
                    }
                    res.end(JSON.stringify(blogData))
                })
                return
            }
            // const blogData = handleBlogRouter(req, res)
            // if (blogData) {
            //     res.end(JSON.stringify(blogData))
            //     return
            // }

            // ****************************处理user路由****************************
            // const userData = handleUserRouter(req, res)
            // if (userData) {
            //     res.end(
            //         JSON.stringify(userData)
            //     )
            //     return
            // }
            const userResult = handleUserRouter(req, res)
            if (userResult) {
                userResult.then(data => {
                    if (needSetCookie) {
                        res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`)
                    }
                    res.end(
                        JSON.stringify(data)
                    )
                })
                return
            }

            // 未命中路由 就返回404 纯文本
            /**
             * 即设置返回文本格式 又同时设置状态码
             * res.writeHead(404,{"Content-type": "text/plain"})
             * 
             * 只设置返回文本格式
             * res.setHeader("Content-type","application/json")
            */
            res.writeHead(404, { "Content-type": "text/plain" })
            res.write("404 Not Found")
            res.end()
        })






}

module.exports = serverHandle

/// env: process.env.NODE_ENV // node内置的获取环境变量