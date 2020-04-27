const {exec} = require('../db/mysql')
const xss = require('xss')
const getList = (author,keyword) => {
   
    let sql = `select * from blogs where 1=1 `

    if(author) {
        sql += `and author='${author}' `
    }

    if(keyword) {
        sql += `and title like '%${keyword}%' `
    }
    sql += `order by createtime desc;`

    return exec(sql) // 此时返回的是一个promise
}

const getDetail = (id) => {
    let sql = `select * from blogs where id='${id}'`
    return exec(sql).then(rows=> {
        return rows[0]
    })
}

const newBlog = (blogData = {}) => {
    // blogData是一个博客对象 包括博客相关信息
    // console.log('blogData:',blogData)

    let title = xss(blogData.title)
    let content = blogData.content
    let author = blogData.author
    let createTime = Date.now() 

    let sql = `
        insert into blogs (title,content,createtime,author)
        values ('${title}','${content}',${createTime},'${author}');
    `
    return exec(sql).then(insertData=> {
        //console.log('insertData is',insertData)
        return {
            id: insertData.insertId
        }
    })

    // return {
    //     id: 3 // 表示新建博客，插入到数据表里的id 
    // }
}

const updateBlog = (id,blogData={}) => {
    // console.log('id- blogdata:', id ,'-',blogData)
    const title = blogData.title 
    const content = blogData.content 

    const sql = `
        update blogs set title='${title}',content='${content}' where id=${id};
    `
    return exec(sql).then(updateData => {
        // console.log('updateData is ', updateData)
        if (updateData.affectedRows > 0) {
            return true 
        }
        return false 
    })
    // return true 
}

const delBlog = (id, author) => {
    const sql = `delete from blogs where id=${id} and author='${author}'`

    return exec(sql).then(delData=> {
        if(delData.affectedRows > 0 ) {
            return true 
        }
        return false 
    })
}

module.exports = {
    getList,
    getDetail,
    newBlog,
    updateBlog,
    delBlog
}