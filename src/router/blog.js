const { getList, getDetail, newBlog, updateBlog, delBlog } = require('../controller/blog')
const { SuccessModel, ErrorModel } = require('../model/resModel')

// 验证是否登录 
const loginCheck = (req) => {
    if(!req.session.username) {
       return Promise.resolve(
           new ErrorModel('尚未登录')
       )
    }
}


const handleBlogRouter = (req, res) => {
    const method = req.method // 获取方法
    const url = req.url // 获取url地址
    // const path = url.split('?')[0] // 获取请求地址
    let id = req.query.id
    // get 类型的接口
    //****************获取博客列表(/api/blog/list)********************** 
    if (method === "GET" && req.path === "/api/blog/list") {

        // 用户传递过来的数据都在query当中，所以可以直接从query当中取数据
        let author = req.query.author || ''
        let keyword = req.query.keyword || ''

        if(req.query.isadmin) {
            // 管理员界面
            const loginCheckResult = loginCheck(req)
            if(loginCheckResult) {
                return loginCheckResult
            }
            // 强制管理自己的博客
            author = req.session.username
        }

        let result = getList(author, keyword)
        return result.then(listData => {
            return new SuccessModel(listData)
        })

        // let listData = getList(author,keyword)

        // return new SuccessModel(listData)
        // return {
        //     msg: "这是获取博客列表的接口"
        // }
    }
    //****************获取博客详情(/api/blog/detail)********************** 
    if (method === "GET" && req.path === "/api/blog/detail") {

        let detailResult = getDetail(id)
        return detailResult.then(detailData => {
            return new SuccessModel(detailData)
        })
        // return new SuccessModel(detailData)
        // return {
        //     msg: "这是获取博客详情的接口"
        // }
    }

    // post 类型的接口
    //****************新建一篇博客(/api/blog/new)********************** 
    if (method === "POST" && req.path === "/api/blog/new") {

        // 登录验证
        const loginCheckResult = loginCheck(req)
        if(loginCheckResult) {
            // 如果为true，表示未登录
            return loginCheckResult
        } 

        // 接收一下博客的内容
        req.body.author = req.session.username // 假数据，因为没有开发登录，所以此时先设置为假数据
        let newBlogResult = newBlog(req.body)
        return newBlogResult.then(data => {
            return new SuccessModel(data)
        })

        // return {
        //     msg: "这是新建博客的接口"
        // }
    }

    //****************更新一篇博客(/api/blog/update)********************** 
    if (method === "POST" && req.path === "/api/blog/update") {
         // 登录验证
         const loginCheckResult = loginCheck(req)
         if(loginCheckResult) {
             // 如果为true，表示未登录
             return loginCheckResult
         } 

        let updateResult = updateBlog(id, req.body)

        return updateResult.then(val => {
            if (val) {
                return new SuccessModel()
            } else {
                return new ErrorModel('更新博客失败')
            }
        })


        // return {
        //     msg: "这是更新博客的接口"
        // }
    }

    //****************删除一篇博客(/api/blog/del)********************** 
    if (method === "POST" && req.path === "/api/blog/del") {
         // 登录验证
         const loginCheckResult = loginCheck(req)
         if(loginCheckResult) {
             // 如果为true，表示未登录
             return loginCheckResult
         } 

        let author = req.session.username // 假数据 
        let result = delBlog(id, author)
        return result.then(val => {
            if (val) {
                return new SuccessModel()
            } else {
                return new ErrorModel('删除博客失败')
            }
        })

        // return {
        //     msg: "这是删除博客的接口"
        // }
    }
}

module.exports = handleBlogRouter