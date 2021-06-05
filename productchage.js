const express = require('express');
const router = express.Router();

const asyncHandler = require('express-async-handler');
const db = require('./db');
const fs = require("fs");

let default_path = process.cwd() + '/public';
// console.log(default_path);
let pId;

//acer
let defaultFolder = "C:/Users/oppqq/OneDrive/Documents/檔案區/網站系統設計與製作/網站用圖片/筆電商品-僅透明背景-140/";
let name, sortId, price, stock;
let type = 1; //0=acer, 1=GIGABYTE, 2=LENOVO
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


async function asyncCall() {
    let queryCheck = await db(`Select * from products Where sortId = 5`);
    let specification = JSON.stringify(queryCheck[0].specification);
    console.log(specification['name']);
}

asyncCall();
module.exports = router;