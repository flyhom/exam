const express = require('express');
const router = express.Router();

const asyncHandler = require('express-async-handler');
const db = require('../db');
router.get('/', asyncHandler(async(req, res, next) => {
    let { page, sortId } = req.query;
    let queryResult, queryResult2;
    if (!page) {
        page = 0;
    } else if (page > 0) {
        page = (page - 1) * 10;
    }
    try {
        if (sortId) {
            queryResult = await db(`Select p.id as 'pId', ps.name as 'sort_name', p.name, p.price, pic.id AS 'picId', pic.src, pic.filename from products as p, product_sort as ps, (SELECT * FROM product_preview_pics group by pid) as pic where p.sortId = ps.id AND pic.pid = p.id and p.sortId = ? limit ?,10`, [sortId, page]);
            queryResult2 = await db(`Select count(*) as 'productCount' from products as p, product_sort as ps where p.sortId = ps.id and p.sortId = ?`, [sortId]);
        } else {
            queryResult = await db(`Select p.id as 'pId', ps.name as 'sort_name', p.name, p.price, pic.id AS 'picId', pic.src, pic.filename from products as p, product_sort as ps, (SELECT * FROM product_preview_pics group by pid) as pic where p.sortId = ps.id AND pic.pid = p.id limit ?,10`, [page]);
            queryResult2 = await db(`Select count(*) as 'productCount' from products as p, product_sort as ps where p.sortId = ps.id`);
        }

        if (queryResult.length < 1) {
            return res.json({ status: 0, message: '目前沒有商品分類，請新增分類' });
        } else {
            maxPageNum = Math.ceil(queryResult2[0].productCount / 10);
            return res.json({ status: 1, message: '資料獲取成功', maxPageNum: maxPageNum, products: queryResult });
        }
    } catch (err) {
        next(err);
    }
}));

router.get('/select', asyncHandler(async(req, res, next) => {
    let { pId } = req.query;
    try {
        let queryProduct = await db(`Select * from products where id = ?`, [pId]);
        let queryProductPreviewPics = await db(`Select * from product_preview_pics where pid = ? ORDER by sequence asc`, [pId]);
        if (queryProduct.length < 1) {
            return res.json({ status: 0, message: '找不到該商品' });
        } else {

            return res.json({ status: 1, message: '資料獲取成功', product: queryProduct, previewPics: queryProductPreviewPics });
        }
    } catch (err) {
        next(err);
    }
}));

router.get('/sort', asyncHandler(async(req, res, next) => {
    try {
        let queryResult = await db(`Select id, name from product_sort where status = 1`);
        if (queryResult.length < 1) {
            return res.json({ status: 0, message: '目前沒有商品分類，請新增分類' });
        } else {
            return res.json({ status: 1, message: '資料獲取成功', sorts: queryResult });
        }
    } catch (err) {
        next(err);
    }
}));

module.exports = router;