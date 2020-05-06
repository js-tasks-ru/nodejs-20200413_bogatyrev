const path = require('path');
const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

const chatController = require('./controller/chat');
router.get('/subscribe/', chatController.subscribe);
router.post('/publish', chatController.publish);

app.use(router.routes());

module.exports = app;
