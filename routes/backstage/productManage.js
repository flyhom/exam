const express = require('express');
const router = express.Router();

const asyncHandler = require('express-async-handler');
const db = require('../../db');
const formidable = require('formidable');
const fs = require("fs");
const path = require('path')

/* GET users listing. */

router.post('/', asyncHandler(async(req, res, next) => {
    let { token } = req.body;
    if (token) {
        let queryCheck = await db(`Select * from users Where login_token = '${token}' and admin = 1`);
        if (queryCheck.length < 1) {
            return res.json({ status: 0, message: '您沒有使用此功能的權限' });
        }
    } else {
        return res.json({ status: 0, message: '登入已逾時，請重新登入' });
    }
    try {
        let queryResult = await db(`Select * from product_sort`);
        console.log(queryResult);
        console.log(queryResult.length);
        if (queryResult.length < 1) {
            return res.json({ status: 0, message: '目前沒有商品分類，請新增分類' });
        } else {
            return res.json({ status: 1, message: '資料獲取成功', list: queryResult });
        }
    } catch (err) {
        next(err);
    }
}));

router.get('/productSorts', asyncHandler(async(req, res, next) => {
    try {
        let queryResult = await db(`Select * from product_sort`);
        if (queryResult.length < 1) {
            return res.json({ status: 0, message: '目前沒有商品分類，請新增分類' });
        } else {
            return res.json({ status: 1, message: '資料獲取成功', list: queryResult });
        }
    } catch (err) {
        next(err);
    }
}));

router.post('/add', asyncHandler(async(req, res, next) => {
    // let { token, name, sortId, price, stock } = req.body;
    let form = new formidable.IncomingForm();

    form.parse(req, asyncHandler(async(err, fields, files) => {
        let default_path = process.cwd() + '/public';
        // let default_path = '../../public';
        if (err) {
            //   return res.redirect(303, '/error');
            next(err);
        }
        let { token, name, sortId, price, stock } = fields;
        let { specification1, specification2, specification3 } = fields;
        let { previewPhoto1, previewPhoto2, previewPhoto3, descriptionPhoto } = files;
        //驗證使用者權限
        if (token) {
            let queryCheck = await db(`Select * from users Where login_token = '${token}' and admin = 1`);
            if (queryCheck.length < 1) {
                return res.json({ status: 0, message: '您沒有使用此功能的權限' });
            }
        } else {
            return res.json({ status: 0, message: '登入已逾時，請重新登入' });
        }
        //
        let pId;
        if (name && sortId && price && stock) {
            await db(`Insert into products ( sortId, name, price, stock ) Values ( ?, ?, ?, ? )`, [sortId, name, price, stock]);
            let queryProduct = await db(`Select * from products Where name like '%${name}%'`);
            if (queryProduct.length >= 1) {
                pId = queryProduct[0].id;
                console.log(pId);
            } else {
                return res.json({ status: 0, message: '新增商品失敗，請稍後再試' });
            }
        } else {
            return res.json({ status: 0, message: '請補完商品資料再送出' });
        }
        //預覽圖新增到資料庫
        let timmer = 0;
        let tempPhoto;
        let previewPath = default_path + '/images/products/' + pId + "/preview/";
        let previewPathSave = '/images/products/' + pId + "/preview/";
        //建立資料夾
        fs.mkdirSync(previewPath, { recursive: true }, (err) => {
            if (err) throw err;
        });
        do {
            if (timmer == 0) {
                tempPhoto = previewPhoto1;
            } else if (timmer == 1) {
                tempPhoto = previewPhoto2;
            } else {
                tempPhoto = previewPhoto3;
                // console.log(previewPhoto3);
            }
            if (tempPhoto) {
                console.log(tempPhoto.size);
                console.log(previewPath);
                console.log(tempPhoto.path);
                if (tempPhoto.size != 0) {
                    fs.renameSync(tempPhoto.path, previewPath + tempPhoto.name);
                    await db(`Insert into product_preview_pics ( pid, src, filename ) Values ( ?, ?, ? )`, [pId, previewPathSave, tempPhoto.name]);
                } else {
                    console.log(timmer + ' is not 存在 too');
                }
            } else {
                //檔案沒上傳
                // break;
                console.log(timmer + ' is not 存在');
            }
            // previewPath = default_path + '/images/';
            timmer = timmer + 1;
        } while (timmer < 3);

        //商品介紹圖片新增到資料庫
        let descriptionPath = default_path + "/images/products/" + pId + "/description/";
        let descriptionPathSave = "/images/products/" + pId + "/description/";
        //建立資料夾
        fs.mkdirSync(descriptionPath, { recursive: true }, (err) => {
            if (err) throw err;
        });
        if (descriptionPhoto) {
            fs.renameSync(descriptionPhoto.path, (descriptionPath + descriptionPhoto.name));
            await db(`Insert into product_desciption_pics ( pid, src, filename ) Values ( ?, ?, ? )`, [pId, descriptionPathSave, descriptionPhoto.name]);
        } else {

        }

        //商品規格新增
        let timmer2 = 0;
        let tempspecification;
        do {
            if (timmer2 == 0) {
                tempspecification = specification1;
            } else if (timmer2 == 1) {
                tempspecification = specification2;
            } else {
                tempspecification = specification3;
            }
            if (tempspecification) {
                await db(`Insert into product_specification ( pid, description ) Values ( ?, ?)`, [pId, tempspecification]);
            } else {
                //檔案沒上傳
                // break;
            }
            timmer2 = timmer2 + 1;
        } while (timmer2 < 3);
        //完成
        return res.json({ status: 1, message: '商品新增成功' });
        // return res.redirect(303, '/thankyou');
    }));
    try {
        // if (name) {
        //     db(`Insert into product_sort ( name ) Values ( ? )`, [name]);
        //     return res.json({ status: 1, message: '清單新增成功' });
        // } else {
        //     return res.json({ status: 0, message: '請填寫清單名稱' });
        // }
    } catch (err) {
        next(err);
    }
}));

module.exports = router;