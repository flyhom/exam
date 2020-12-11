const query = require('../db')

const sha256 = require('crypto-js/sha256');
async function selectAllData() {
    let sql = 'SELECT * FROM users'
    let values = ''
    let dataList = await query(sql)
    let password = sha256('abcd1234').toString();
    console.log(password + " " + password.length);
    let uId = 1;
    // query(`UPDATE users set password = '${password}' where id = '${uId}'`);
    query(`UPDATE users set password = ? where id = ?`, [password, uId]);
    return dataList
}

async function getData() {
    let dataList = await selectAllData()
    console.log(dataList)
}

getData()