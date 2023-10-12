import { Send } from "../../utils/Http";
import { Toast } from "../../view/common";
let Coin = {};


Coin.findCoinRank = (params) => { // params
    return new Promise((resolve, reject) => {
        Send(`api/Coin/FindCoinRank`, params)
        .then((res) => {
            if (res.code == 200) {
                resolve(res.data)
            }else {
                Toast.tipTop(res.message)
            }
        })
        .catch((err) =>{
            reject(err)
            console.log('err', err)
        })
    })
}

Coin.getCoinAmount = (type) => { // type
    return new Promise((resolve, reject) => {
        Send(`api/Coin/FindCoinAmount?type=${type}`, '', 'get')
        .then((res) => {
            if (res.code == 200) {
                resolve(res.data)
            }else {
                Toast.tipTop(res.message)
            }
        })
        .catch((err) =>{
            reject(err)
            console.log('err', err)
        })
    })
}

Coin.getCoinType = () => { // type
    return new Promise((resolve, reject) => {
        Send(`api/Coin/FindCoinType`, '', 'get')
        .then((res) => {
            if (res.code == 200) {
                resolve(res.data)
            }else {
                Toast.tipTop(res.message)
            }
        })
        .catch((err) =>{
            reject(err)
            console.log('err', err)
        })
    })
}

/**
 * @name 获取各个币种记录
 * @param {*} params 
 */
Coin.getCoinRecord = (params) => { // params
    return new Promise((resolve, reject) => {
        Send(`api/Coin/CoinRecord`, params)
        .then((res) => {
            if (res.code == 200) {
                resolve(res.data)
            }else {
                Toast.tipTop(res.message)
            }
        })
        .catch((err) =>{
            reject(err)
            console.log('err', err)
        })
    })
}

/**
 * @name 提交提币
 * @param {*} params 
 */
Coin.moveCoinToSomeone = (params) => { // params
    return new Promise((resolve, reject) => {
        Send(`api/Coin/MoveCoinToSomeone`, params)
        .then((res) => {
            if (res.code == 200) {
                resolve(res.data)
            }else {
                reject(res)
                Toast.tipTop(res.message)
            }
        })
        .catch((err) =>{
            reject(err)
            console.log('err', err)
        })
    })
}

/**
 * @name 发送提币短信
 * @param {*} mobile 
 */
Coin.moveCoinSendCode = (mobile) => { // params
    return new Promise((resolve, reject) => {
        Send(`api/Coin/MoveCoinSendCode?mobile=${mobile}`, '', 'get')
        .then((res) => {
            if (res.code == 200) {
                resolve(res.data)
            }else {
                Toast.tipTop(res.message)
                reject(res);
            }
        })
        .catch((err) =>{
            reject(err)
            console.log('err', err)
        })
    })
}


/**
 * @name 矿机列表
 * @param {*}  
 */
Coin.getMinningList = () => { 
    return new Promise((resolve, reject) => {
        Send(`api/Coin/MinningList`, '', 'get')
        .then((res) => {
            if (res.code == 200) {
                resolve(res.data)
            }else {
                Toast.tipTop(res.message)
            }
        })
        .catch((err) =>{
            reject(err)
            console.log('err', err)
        })
    })
}

/**
 * @name 开始挖矿&&领取奖励
 * @param {*} mid 
 */
Coin.doTask = (mid) => { 
    return new Promise((resolve, reject) => {
        Send(`api/Coin/DoTask?mId=${mid}`, '', 'get')
        .then((res) => {
            if (res.code == 200) {
                resolve(res.data)
            }else {
                Toast.tipTop(res.message)
                reject(res)
            }
        })
        .catch((err) =>{
            reject(err)
            console.log('err', err)
        })
    })
}

/**
 * @name 修复矿机
 * @param {*} mid 
 */
Coin.repairMinning = (mid) => { 
    return new Promise((resolve, reject) => {
        Send(`api/Coin/RepairMinning?mId=${mid}`, '', 'get')
        .then((res) => {
            if (res.code == 200) {
                resolve(res.data)
            }else {
                reject(res)
                Toast.tipTop(res.message)
            }
        })
        .catch((err) =>{
            reject(err)
            console.log('err', err)
        })
    })
}


/**
 * @name 矿机列表
 * @param {*} status 
 */
Coin.getTasksShop = (status) => { 
    return new Promise((resolve, reject) => {
        Send(`api/System/TasksShop?status=${status}`, '', 'get')
        .then((res) => {
            if (res.code == 200) {
                resolve(res.data)
            }else {
                reject(res)
                Toast.tipTop(res.message)
            }
        })
        .catch((err) =>{
            reject(err)
            console.log('err', err)
        })
    })
}

/**
 * @name 兑换矿机
 * @param {*} minningId 
 */
Coin.exchange = (minningId) => { 
    return new Promise((resolve, reject) => {
        Send(`api/System/Exchange?minningId=${minningId}`, '', 'get')
        .then((res) => {
            if (res.code == 200) {
                resolve(res.data)
            }else {
                reject(res)
                Toast.tipTop(res.message)
            }
        })
        .catch((err) =>{
            reject(err)
            console.log('err', err)
        })
    })
}

/**
 * @name 贡献值流水
 * @param {*} params 
 */
Coin.getGlodsRecord = (params) => { 
    return new Promise((resolve, reject) => {
        Send(`api/Coin/GlodsRecord`, params)
        .then((res) => {
            if (res.code == 200) {
                resolve(res)
            }else {
                Toast.tipTop(res.message)
            }
        })
        .catch((err) =>{
            reject(err)
            console.log('err', err)
        })
    })
}

/**
 * @name 锁仓收益配置
 * @param {*} params 
 */
Coin.lookUpIncomeSetting = () => { 
    return new Promise((resolve, reject) => {
        Send(`api/Coin/LookUpIncomeSetting`, {}, 'get')
        .then((res) => {
            if (res.code == 200) {
                resolve(res.data)
            }else {
                Toast.tipTop(res.message)
            }
        })
        .catch((err) =>{
            reject(err)
            console.log('err', err)
        })
    })
}

/**
 * @name 锁仓
 * @param {*} params 
 */
Coin.confirmLookUp = (type, amount) => { 
    return new Promise((resolve, reject) => {
        Send(`api/Coin/ConfirmLookUp?type=${type}&amount=${amount}`, {}, 'get')
        .then((res) => {
            if (res.code == 200) {
                resolve(res.data)
            }else {
                reject(res)
                Toast.tipTop(res.message)
            }
        })
        .catch((err) =>{
            reject(err)
            console.log('err', err)
        })
    })
}

/**
 * @name 锁仓记录
 * @param {*} params 
 */
Coin.minnersOrder = (params) => {
    return new Promise((resolve, reject) => {
        Send(`api/Coin/MinnersOrder`, params)
        .then((res) => {
            if (res.code == 200) {
                resolve(res.data)
            }else {
                reject(res)
                Toast.tipTop(res.message)
            }
        })
        .catch((err) =>{
            reject(err)
            console.log('err', err)
        })
    })
}

/**
 * @name 赎回
 * @param {*} params 
 */
Coin.stopOrder = (orderId) => { 
    return new Promise((resolve, reject) => {
        Send(`api/Coin/SopOrder?orderId=${orderId}`, {}, 'get')
        .then((res) => {
            if (res.code == 200) {
                resolve(res.data)
            }else {
                reject(res)
                Toast.tipTop(res.message)
            }
        })
        .catch((err) =>{
            reject(err)
            console.log('err', err)
        })
    })
}

/**
 * @name 面板数据
 * @param {*} params 
 */
Coin.KLinePanel = (coinType) => { 
    return new Promise((resolve, reject) => {
        Send(`api/Coin/KLinePanel?coinType=${coinType}`, {}, 'get')
        .then((res) => {
            if (res.code == 200) {
                resolve(res.data)
            }else {
                reject(res)
                Toast.tipTop(res.message)
            }
        })
        .catch((err) =>{
            reject(err)
            console.log('err', err)
        })
    })
}

/**
 * @name K线数据
 * @param {*} params 
 */
Coin.KLine = (params) => {
    return new Promise((resolve, reject) => {
        Send(`api/Coin/KLine`, params)
        .then((res) => {
            if (res.code == 200) {
                resolve(res.data)
            }else {
                reject(res)
                Toast.tipTop(res.message)
            }
        })
        .catch((err) =>{
            reject(err)
            console.log('err', err)
        })
    })
}

/**
 * @name 成交数据
 * @param {*} params 
 */
Coin.CoinData = (type, coinType) => { 
    return new Promise((resolve, reject) => {
        Send(`api/Coin/CoinData?type=${type}&coinType=${coinType}`, {}, 'get')
        .then((res) => {
            if (res.code == 200) {
                resolve(res.data)
            }else {
                reject(res)
                Toast.tipTop(res.message)
            }
        })
        .catch((err) =>{
            reject(err)
            console.log('err', err)
        })
    })
}



export default Coin