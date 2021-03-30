const koa=require(`koa`)
const route=require(`koa-route`)
const koaBody=require(`koa-body`)
const serve =require("koa-static");
const fs=require(`fs`)
const path=require(`path`);
const func=require(`./grown`)
const app=new koa()
app.use(koaBody({ multipart: true }));
const http=require("http")
const WebSocket = require('ws');
const WebSocketApi = require('./socket');//引入封装的ws模块
const { start } = require("repl");
const server = http.createServer(app.callback())
const wss = new WebSocket.Server({// 同一个端口监听不同的服务
    server
});
const main = serve(`web`)
app.use(main)
const logger = (ctx, next) => { //  日志打印
  console.log(ctx.request.method);
  console.log(ctx.request.body)
  try{
    next()}catch(e){ console.log(e.message) }
}
const isRepeat=name=>{   //注册查重
  var users=JSON.parse(fs.readFileSync(`userdata/username.json`).toString())
  for(user of users) {
    if(user.username==name){
      return true
    }
  }
  return false
}
const writeData=(data,path)=>{  //登录数据写入
  var users=JSON.parse(fs.readFileSync(path))
  users.push(data)
  fs.writeFile(path,JSON.stringify(users),err=>{
      if(err){throw err.message}
      console.log(`数据写入`)
  })
}
const addData=(name,data,path)=>{ //信息录入
  var datas=JSON.parse(fs.readFileSync(path))
  datas[name]=data
  fs.writeFile(path,JSON.stringify(datas),err=>{
    if(err){throw err.message}
    console.log(`${name}数据更新`)
  })
}
const isuser=u=>{  //登录者确认
  var users=JSON.parse(fs.readFileSync(`userdata/username.json`))
  for(user of users){
    if(user.username==u.username && user.password==u.password){
      return true
    }
  }
  return false
}
const old=name=>{ //是否有用户的基本数据
  var userdatas=JSON.parse(fs.readFileSync(`userdata/userdata.json`).toString())
    for(let i in userdatas ){
      if(i==name){
        return true
      }
    }
    return false
}

const rigist=async ctx=>{ //注册
  data=ctx.request.body
  if(data.username && data.username!=`undefined`
  && data.password && data.password!=`undefined`
  && data.password == data.passwordAgain
  && !isRepeat(data.username)){
    let user={username:data.username,password:data.password}
    writeData(user,`userdata/username.json`)
    ctx.response.redirect(`/操作成功.html`)
  }else{
    ctx.response.redirect(`/注册失败.html`)
  }
}
var name=''
const login=async ctx=>{  //登录
  var user=ctx.request.body
  if(isuser(user)){
    name=user.username
    if(old(name)){
      return ctx.response.redirect('/日程表.html')
    }
    return ctx.response.redirect('/getdata.html')
  }ctx.response.redirect('/登录失败.html')
}
const getdata=async (ctx)=>{  //获得基础信息
  userdata= ctx.request.body
  let data={base:[0,userdata.sex,userdata.age,userdata.height,userdata.weight,1.25,1.25,0,0,0]}
  data.base=data.base.map(item=>Number(item))
  data.base[0]=userdata.username
  addData(name,data,`userdata/userdata.json`)
  ctx.response.redirect(`/日程表.html`)
}
var isadd=0
const detail=async ctx=>{  //获得日程信息
  let userdata=ctx.request.body
  isadd=userdata.userset
  let actives=userdata.actives
  let starts=userdata.start
  let ends=userdata.end
  let excise=Number(userdata.excise)
  let eat=Number(userdata.eat)
  var userdatas=JSON.parse(fs.readFileSync(`userdata/userdata.json`).toString())
  let datas= userdatas[name]
  var data=[{agenda:{},eternal:"*"},{agenda:{},eternal:"1-5"}]
  if(!isadd){console.log(`无自定义日程`);data[1]=datas.agenda[1]}
  else{
    ename=userdata.ename
    setname=userdata.userset
    attr=userdata.attr
    us=userdata.us //start time
    ue=userdata.ue //end tiem
    nm=userdata.nm //影响值
    if(Array.isArray(setname)){
      us=us.map(item=>item.split(`:`).map(item=>Number(item)))
      ue=ue.map(item=>item.split(`:`).map(item=>Number(item)))
      ue=ue.map(item=>item[0]*60+item[1])
      for(let i=0;i<ename.length;i++){
        var st=us[i][0]*60+us[i][1]
        var last=ue[i]-st
        if((last/60)<0){last=24*60+last}
        data[1].agenda[ename[i]]={start:us[i],end:last,imp:Number(nm[i]),attr:attr[i],des:setname[i],value:0}
        data[0].agenda[ename[i]]={start:us[i],end:last,num:(ue[i]-st)/60}
      }
    }else{
      us=us.split(":").map(item=>Number(item))
      ue=ue.split(":").map(item=>Number(item))
      let uem=ue[0]*60+ue[1]
      let usm=us[0]*60+us[1]
      console.log(us,ue,uem,usm)
      var last=uem-usm
      if(last<0){last=24*60+last}
      data[1].agenda[ename]={start:us,end:last,imp:Number(nm),attr:attr,des:setname,value:0}
      data[0].agenda[ename]={start:us,end:last,num:last/60}
    }
  }
  let end=ends.map(item=>item.split(`:`).map(item=>Number(item)))
  end=end.map(item=>item[0]*60+item[1])
  let time=starts.map(item=>item.split(`:`).map(item=>Number(item)))
  for(let i=0;i<actives.length;i++){
    var st=time[i][0]*60+time[i][1]
    var l=end[i]-st
    if(l<0){l=24*60+l}
    var tem=''
    if(actives[i]=="exercise"){
      tem=excise
    }else if(actives[i]=="eat"){
      tem=eat
    }else{
      tem=l/60
    }
    data[0].agenda[actives[i]]={start:time[i],end:l,num:tem}
  }
  console.log(data[0].agenda)
  datas[`agenda`]=data
  addData(name,datas,`userdata/userdata.json`)
  ctx.response.redirect(`/showdata.html`)
}
const userset=async ctx=>{ //日程传前台
  var userdatas=JSON.parse(fs.readFileSync(`userdata/userdata.json`))
  var userdata=userdatas[name]
  if(!userdata.agenda){return}
  ctx.response.body=userdata.agenda
}
const showdata=async (ctx)=>{
  let issave=0
  issave=JSON.parse(ctx.request.query.issave)
  let day=Number(ctx.request.query.day)
  console.log(`存档？${issave}`)
  func.grow(ctx,name,day,issave)
  //WebSocketApi(wss,person)  //处理后台自动运行的持续更新
}
const memory=async ctx=>{
  let m=ctx.request.body.message
  ctx.response.body=`获得了记忆数据`

  var datas=JSON.parse(fs.readFileSync(`userdata/userdata.json`))
  let data=datas[name]
  data.base[10]=m
  fs.writeFile(`userdata/userdata.json`,JSON.stringify(datas),err=>{
    if(err){throw err.message}
    console.log(`${name}数据更新--增加了新的记忆`)
  })

}

app.use(logger)
app.use(route.post(`/api/rigist`,rigist))
app.use(route.post(`/api/login`,login))
app.use(route.post(`/api/getdata`,getdata))
app.use(route.post(`/api/detail`,detail))
app.use(route.post(`/api/postdata`,memory))
app.use(route.get(`/api/special`,userset))
app.use(route.get(`/api/showdata`,showdata))

console.log(`serve run in http://127.0.0.1:3000`)
server.listen(3000)
