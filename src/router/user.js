const {login} = require('../controller/user')
const { SuccessModel,ErrorModel } = require('../model/resModel')

const { set } = require('../db/redis')


const handleUserRouter = (req,res) => {
    const method = req.method // 获取方法
    const url = req.url // 获取url地址
    // const path = url.split('?')[0] // 获取请求地址

    //************用户登录接口(/api/user/login)*************/
    if(method === "POST" && req.path === "/api/user/login") {
        const {username,password} = req.body  
        // const {username,password} = req.query
        
        const result = login(username,password) 
        return result.then(data => {
            // console.log(data.username)
            if(data.username) {

                // 操作cookie 
                // res.setHeader('Set-Cookie',`username=${data.username}; path=/; httpOnly; expires=${getCookieExpires()}`)

                //设置session
                // 相当于SESSION_DATA[userId].username = data.username
                // console.log('1-------',req.session)
                req.session.username = data.username 
                req.session.realname = data.realname 
                // console.log('2-------',req.session)
                // 同步到redis
                set(req.sessionId,req.session)
                return new SuccessModel()
            }
            return new ErrorModel('用户名或者密码错误')
        })
    }

    //************登录验证的测试*************/
    /*
    if(method === 'GET' && req.path === '/api/user/login-test') {
        if(req.session.username) {
            return Promise.resolve(new SuccessModel({
                username: req.session
            }))
        }
        return Promise.resolve(new ErrorModel('尚未登录'))
    }*/
}

module.exports = handleUserRouter