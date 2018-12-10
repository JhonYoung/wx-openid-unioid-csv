const Koa = require("koa");
const app = new Koa();
const request = require('axios');
const fs = require('fs');
const path = require('path')

let appId = ''
let secret = ''
let initCount = 10
const arr = []

app.use(async ctx => {
  async function getAccessToken () {
    let tokenUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${secret}`
    const res = await request.get(tokenUrl)
    return res.data.access_token
  }
  
  const accessToken = '16_slvci5OxS46v6blC6xHDPnahE3HHu-XKj-oghf0BDH_J6KHa4hAX9fBqlZpXZMiqYYmBTnGbv70yUCEkzl094CUuW3RGhMhHvkuu6Vw_iffl_MMHZuz0gCPPyCaTwJxvEguKDDkB90qiPxWXYCAgAEATXV' || await getAccessToken()
  async function getOpenid (arr, accessToken, nextOpenid) {
    const openidUrl = `https://api.weixin.qq.com/cgi-bin/user/get?access_token=${accessToken}&next_openid=${nextOpenid || ''}`
    const res = await request.get(openidUrl)
    arr = res.data.data ? arr.concat(res.data.data.openid) : arr
    return res.next_openid ? getOpenid(arr, accessToken, res.next_openid) : arr
  }
  let openids = await getOpenid(arr, accessToken)
  async function getUnioid(openid, accessToken) {
    const unionidUrl = `https://api.weixin.qq.com/cgi-bin/user/info?access_token=${accessToken}&openid=${openid}&lang=zh_CN`
    const res = await request.get(unionidUrl)
    const {unionid} = res.data
    return [unionid, openid].join('===')
  }

  openids = openids.splice(0, initCount)
  const all = openids.map((id) => {
    return getUnioid(id, accessToken)
  })
  async function getUnioinds () {
    const data = await Promise.all(all) 
    const _data = data.join('\n')
    const _path = path.join(__dirname, 'data.csv')
    fs.writeFile(_path, _data, function(err) {
      console.log(err)
    })
    return data.join('\n')
  }

  getUnioinds()
  ctx.body  = 'success'
});

app.listen(3000);