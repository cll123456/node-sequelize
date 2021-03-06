// 关于administrator对外暴露的api
const express = require('express');
const administratorRoute = express.Router();
const administratorSer = require('./../../services/AdministratorService');
const {publish} = require("../../util/jwtUtils");
const {handleAsyncApi} = require('./../../util/apiUtils');
const {encrypt} = require('./../../util/crypto')

administratorRoute.post('/login', handleAsyncApi(loginAdministrator, '登录成功'));
administratorRoute.get('/whoAmI', handleAsyncApi(whoAmIAdministrator, '获取成功'));
administratorRoute.get('/', handleAsyncApi(getAllAdministrator, '查询成功'));
administratorRoute.get('/jsonp', getAllAdministratorJsonp);
administratorRoute.get('/:id', handleAsyncApi(getAdministratorById, '查询成功'));
administratorRoute.post('/', handleAsyncApi(saveAdministrator, '添加成功'));
administratorRoute.put('/:id', handleAsyncApi(uptAdministrator, '修改成功'));
administratorRoute.delete('/:id', handleAsyncApi(delAdministrator, '删除成功'));

/**
 * 账号登录
 * @param req
 * @param res
 * @param next
 * @returns {Promise<null|*>}
 */
async function loginAdministrator(req, res, next) {
    const r = await administratorSer.login({loginId: req.body.loginId, loginPwd: req.body.loginPwd})
    /** 使用cookies 和 session 来做验证登录
     // 返回一个cookie，需要进行加密处理
     const value = encrypt(req.body.loginId);
     res.cookie('token', value, {
        path: "/",
        domain: "localhost",
        maxAge: 7 * 24 * 3600 * 1000,
    });
     res.header('authorization', value);
     // 设置session的用户信息
     req.session.userInfo = r;
     */
    /**
     * 使用jwt来进行验证登录
     */
     publish(res, {id: r.id})
    return r;
}

/**
 * 获取所有的图书管理员
 * @param req
 * @param res
 * @param next
 * @returns {Promise<{total: number, datas: *}>}
 */
async function getAllAdministrator(req, res, next) {
    return await administratorSer.findAllAdmins();
}

/**
 * 通过jsonp来访问的
 * @param req
 * @param res
 * @param next
 * @returns {Promise<string>}
 */
async function getAllAdministratorJsonp(req, res, next) {
    const r = await administratorSer.findAllAdmins();
    res.send(`callback(${JSON.stringify(r)})`);
    return;
}

/**
 * 通过id来获取图书管理员
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
async function getAdministratorById(req, res, next) {
    const id = req.params.id;
    return await administratorSer.findAdminById(id);
}

/**
 * 添加图书管理员
 * @param req
 * @param res
 * @param next
 * @returns {Promise<object>}
 */
async function saveAdministrator(req, res, next) {
    const administratorObj = req.body;
    return await administratorSer.addAdministrator(administratorObj);
}

/**
 * 修改图书管理员
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
async function uptAdministrator(req, res, next) {
    const id = req.params.id;
    const uptObj = req.body;
    return await administratorSer.updateAdministrator(uptObj, id);
}

/**
 * 删除图书管理员
 * @param req
 * @param res
 * @param next
 * @returns {Promise<number>}
 */
async function delAdministrator(req, res, next) {
    const id = req.params.id;
    return await administratorSer.deleteAdministrator(id)
}

/**
 * 我是谁，通过token,换取用户信息
 * @param req
 * @param res
 * @param next
 * @returns {Promise<number>}
 */
async function whoAmIAdministrator(req, res, next) {
    const id = req.userId;
    return await administratorSer.findAdminById(id)
}

module.exports = administratorRoute;
