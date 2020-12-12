const express = require('express');
const router = express.Router();

const asyncHandler = require('express-async-handler');
const db = require('../db');
const sha256 = require('crypto-js/sha256');
// const { token } = require('morgan');

router.post('/login', asyncHandler(async(req, res, next) => {
    let { email, password, token } = req.body;
    if (token) {
        let queryIsLogin = await db(`Select * from users Where login_token = '${token}'`);
        if (queryIsLogin.length == 1) {
            return res.json({ status: 1, message: '已登入', isLogin: true });
        } else {
            return res.json({ status: 0, message: '已超過登入時間，請重新登入' });
        }
    }
    if (!(email && password))
        return res.json({ status: 0, message: '帳號或密碼未填寫' });
    try {
        let queryResult = await db(`Select * from users Where email = '${email}'`);
        if (queryResult.length != 1)
            return res.json({ status: 0, message: '找不到此用戶' });
        if (sha256(password).toString() == queryResult[0].password) {
            token = sha256(Date.now() + queryResult[0].id).toString();
            let admin = queryResult[0].admin;
            await db(`UPDATE users set login_token = ? where id = ?`, [token, queryResult[0].id]);
            return res.json({ status: 1, message: '登入成功', admin: admin, token: token });
        } else {
            return res.json({ status: 0, message: '密碼錯誤' });
        }
    } catch (err) {
        next(err);
    }
}));

router.post('/register', asyncHandler(async(req, res, next) => {
    let { name, email, password, birthday, phone, token } = req.body;
    if (token) {
        let queryIsLogin = await db(`Select * from users Where login_token = '${token}'`);
        if (queryIsLogin.length == 1) {
            return res.json({ status: 1, message: '已登入', isLogin: true });
        } else {
            return res.json({ status: 0, message: '已超過登入時間，請重新登入' });
        }
    }
    if (!(name && email && password && birthday && phone))
        return res.json({ status: 0, message: '請填寫完全部資料，再進行註冊喔~' });
    try {
        let queryResult = await db(`Select * from users Where email = '${email}'`);
        if (queryResult.length != 1) {
            password = sha256(password).toString();
            db(`Insert into users ( name, email, password, birthday, phone ) Values ( ?, ?, ?, ?, ? )`, [name, email, password, birthday, phone]);
            return res.json({ status: 1, message: '註冊成功，請重新登入', isLogin: true });
        } else {
            return res.json({ status: 0, message: '此用戶已註冊過' });
        }
    } catch (err) {
        next(err);
    }
}));

router.post('/logout', function(req, res) {
    let { token } = req.body;
    db(`UPDATE users set login_token = NULL WHERE id = (SELECT id WHERE login_token = ?)`, [token]);
    res.json({
        status: 1,
        message: '登出成功'
    })
});

module.exports = router;