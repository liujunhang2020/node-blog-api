const fs = require('fs')
const path = require('path')

// 写日志
function writeLog(writeStream,log) {
    writeStream.write(log + '\n') // 核心代码
}


function createWriteStream(fileName) {
    // 拼接一个完整路径
    const fullName = path.join(__dirname,"../",'../',"logs",fileName)
    const writeStream = fs.createWriteStream(fullName, {
        flags: 'a'
    })
    return writeStream
}

// 写访问日志
const accessWriteStream = createWriteStream('access.log') 

function access(log) {
    writeLog(accessWriteStream,log)
}

module.exports = {
    access
}