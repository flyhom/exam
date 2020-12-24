const express = require('express');
const router = express.Router();

const asyncHandler = require('express-async-handler');
const db = require('../db');
router.post('/buyCheck', asyncHandler(async(req, res, next) => {
    let { token, pId, buyNum } = req.body;
    let shipping;

    if (!buyNum) {
        buyNum = 0;
    }
    if (token) {
        let queryCheck = await db(`Select * from users Where login_token = '${token}'`);
        if (queryCheck.length < 1) {
            return res.json({ status: 0, message: '請登入後再進行購買' });
        }
    } else {
        return res.json({ status: 0, message: '登入已逾時，請重新登入' });
    }
    try {
        let queryResult = await db(`Select id as 'pId', name, price, stock from products where id = ?`, [pId]);
        if (queryResult.length < 1) {
            return res.json({ status: 0, message: '獲取商品錯誤，請重新整理再購買一次' });
        } else {
            let price = queryResult[0].price;
            let stock = queryResult[0].stock;
            if (stock < 1) {
                return res.json({ status: 0, message: '商品已完售' });
            }
            if (price > 30000) {
                shipping = 0;
            } else {
                shipping = 100;
            }
            return res.json({ status: 1, message: '資料獲取成功', product: queryResult, shipping: shipping, buyNum: parseInt(buyNum) });
        }
    } catch (err) {
        next(err);
    }
}));

router.post('/buy', asyncHandler(async(req, res, next) => {
    let { token, pId, buyNum, price, payment_method, send_method, address } = req.body;
    let shipping, uId;
    let now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    console.log(now);
    if (token) {
        let queryCheck = await db(`Select * from users Where login_token = '${token}'`);
        if (queryCheck.length < 1) {
            return res.json({ status: 0, message: '請登入後再進行購買' });
        } else {
            uId = queryCheck[0].id;
        }
    } else {
        return res.json({ status: 0, message: '登入已逾時，請重新登入' });
    }
    try {
        await db(`Insert into orders ( uId, pId, num, price, payment_method, send_method, address, create_time ) Values ( ?, ?, ?, ?, ?, ?, ?, ? )`, [uId, pId, buyNum, price, payment_method, send_method, address, now]);
        let queryResult = await db(`Select id as 'pId', name, price from products where id = ?`, [pId]);
        if (queryResult.length < 1) {
            return res.json({ status: 0, message: '獲取商品錯誤，請重新整理再購買一次' });
        } else {
            let price = queryResult[0].price;
            if (price > 30000) {
                shipping = 0;
            } else {
                shipping = 100;
            }
            return res.json({ status: 1, message: '資料獲取成功', product: queryResult, shipping: shipping });
        }
    } catch (err) {
        next(err);
    }
}));


module.exports = router;