const mysql = require('mysql')
const {MYSQL_CONF} = require('../config/db')


// 设置数据库配置信息
const con = mysql.createConnection(MYSQL_CONF)

// 连接数据库 
con.connect() 

// 统一执行sql的函数
function exec(sql) {
    return new Promise((resolve,reject)=> {
        con.query(sql,(err,result)=> {
            if(err) {
                reject(err)
                return 
            }
            resolve(result)
        })
    })
}

module.exports = {
    exec,
    escape: mysql.escape
}