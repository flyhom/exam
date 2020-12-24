const express = require('express');
const router = express.Router();

const asyncHandler = require('express-async-handler');
const db = require('./db');
const fs = require("fs");

let default_path = process.cwd() + '/public';
console.log(default_path);
let pId;

//acer
let defaultFolder = "C:/Users/oppqq/OneDrive/Documents/檔案區/網站系統設計與製作/網站用圖片/筆電商品-僅透明背景-140/";
let name, sortId, price, stock;
let type = 2; //0=acer, 1=GIGABYTE, 2=LENOVO
if (type == 0) {
    defaultFolder = defaultFolder + "ACER-95";
    sortId = 4;
} else if (type == 1) {
    defaultFolder = defaultFolder + "GIGABYTE-28";
    sortId = 5;
} else if (type == 2) {
    defaultFolder = defaultFolder + "LENOVO-17";
    sortId = 6;
}


//亂數
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

console.log('random ' + getRandomInt(3));

//22
price = [12000, 15000, 16900, 22000, 24000, 27800, 29900, 31900, 34000, 36000, 39000, 41900, 44900, 48900, 50000, 52000, 55000, 58000, 60800, 69900, 72500, 81000];
stock = getRandomInt(10);
let jsonData;
let arr = new Array();
let summary, specification;

let previewPath;
let previewPathSave;

// let files;
fs.readdir(defaultFolder + "/", asyncHandler(async(err, files) => {
    // files.forEach(file => {
    //     console.log(file);
    // });
    // console.log(files);
    for (let i = 0; i < files.length; i++) {
        // files[i];
        // console.log(files[i]);
        let filenew = fs.readdirSync(defaultFolder + "/" + files[i]);
        // console.log('filenew ' + filenew);
        // console.log('filenew length ' + filenew.length);
        // console.log(filenew);
        // return 1;
        for (let j = 0; j < filenew.length; j++) {
            // console.log(file.length);
            if (filenew[j].includes('json')) {
                console.log(filenew[j] + ' is json.');
                jsonData = JSON.parse(fs.readFileSync(defaultFolder + "/" + files[i] + "/" + filenew[j], 'utf8'));
                // console.log(jsonData.summary);
                // console.log(jsonData.specification);
                if (type == 0 || type == 2) {
                    arr.push(jsonData.summary);
                    summary = JSON.stringify(arr);
                    arr = new Array();
                } else if (type == 1) {
                    summary = JSON.stringify(jsonData.summary);
                }
                specification = JSON.stringify(jsonData.specification);
                name = jsonData.title;
                await db(`Insert into products ( sortId, name, price, stock, summary, specification ) Values ( ?, ?, ?, ?, ?, ? )`, [sortId, name, price[getRandomInt(21)], getRandomInt(10), summary, specification]);
                let queryProduct = await db(`Select * from products Where name like '%${name}%'`);
                if (queryProduct.length >= 1) {
                    pId = queryProduct[0].id;
                    console.log(pId);
                } else {
                    return res.json({ status: 0, message: '新增商品失敗，請稍後再試' });
                }
                console.log(summary);

                previewPath = default_path + '/images/products/' + pId + "/preview/";
                previewPathSave = '/images/products/' + pId + "/preview/";
                console.log(previewPath);
                //建立資料夾
                fs.mkdirSync(previewPath, { recursive: true }, (err) => {
                    if (err) throw err;
                });
                for (let z = 0; z < jsonData.images.length; z++) {
                    fs.copyFile(defaultFolder + "/" + files[i] + '/' + jsonData.images[z], previewPath + jsonData.images[z], (err) => {
                        if (err) throw err;
                    });
                    await db(`Insert into product_preview_pics ( pid, sequence, src, filename ) Values ( ?, ?, ?, ? )`, [pId, z, previewPathSave, jsonData.images[z]]);
                }
                // break;
            } else if (filenew[j].includes('png')) {
                // console.log(file + ' is png.');
            }

        }
    }
    return 'end';
}));
// fs.readdirSync().forEach(file => {
//     console.log(file);
// });





module.exports = router;