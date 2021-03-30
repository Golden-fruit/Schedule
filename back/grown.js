const fs=require(`fs`);
const Character=require(`./character`)
 //取得对应数据，执行相关日程
 const grow=(ctx,name,d,issave=0)=>{
    var userdatas=JSON.parse(fs.readFileSync(`userdata/userdata.json`))
    var userdata=userdatas[name]
    console.log("基本数据:"+userdata.base)
    var user=new Character(...userdata.base)
    setTimeout(()=>{user.name=`疾风剑豪`},13000)
    setTimeout(()=>{user.name=`无鞘之刃`},19000)
    var special=userdata.agenda[1].agenda
    //添加特别事件
    for(let i in special) {
        let s=special[i]
        add_agenda(user,i,s.attr,s.imp,s.value)
    }

    console.log(`\n 初始人物值: 剑意值--${user.swords}; 体力--${(user.MaxStrength*0.8).toFixed(4)};
        精气--${(user.MaxPower*0.8).toFixed(4)}; 体重--${user.weight.toFixed(4)} \n`)
    user.remenbers(`\n 初始人物值: 剑意值--${user.swords}; 体力--${(user.MaxStrength*0.8).toFixed(4)};
        精气--${(user.MaxPower*0.8).toFixed(4)}; 体重--${Number(user.weight).toFixed(4)} \n`)
    for(let i=0;i<d;i++){
        user.daycount(userdata.agenda[0])
    }
    for(let i in special) {
        let s=special[i]
        s[`value`]=user[s.attr]
    }

    console.log(`\n 执行后人物值: 剑意值--${user.swords}; 体力--${(user.MaxStrength*0.8).toFixed(4)};
        精气--${(user.MaxPower*0.8).toFixed(4)}; 体重--${Number(user.weight).toFixed(4)} \n`)
    user.remenbers(`\n 执行后人物值: 剑意值--${user.swords}; 体力--${(user.MaxStrength*0.8).toFixed(4)};
    精气--${(user.MaxPower*0.8).toFixed(4)}; 体重--${Number(user.weight).toFixed(4)} \n`)
    if(issave){console.log(issave);save(userdata,user,userdatas,name)}
    ctx.response.body={first:`模型数据`,second:user}
    //return user
}
const add_agenda=(user,ename,ab,nm,v)=>{ //自定义日程 用户 事件代号 属性代号
    if(!eval(`user.`+ab)){
        var ab=eval(`user.`+ab)=v
    }
    user[ename]=(t)=>{
        var impact=nm*t
        eval(`user.`+ab+`+=${impact}`)
        console.log(`执行添加日程：${ename}`)
        user.remenbers(`执行添加日程：${ename}`)
    }
}
//执行后存储
const save=(userdata,user,userdatas,name)=>{
    var arres=[user.weight,user.MaxStrength,user.MaxPower,user.swords,user.minds,user.programs]
    for(let i=0;i<3;i++){
        var num=Number(arres[i])
        arres[i]=parseFloat(num.toFixed(4))
    }
    userdata.base.splice(4,arres.length,...arres)
    userdatas[name].base=userdata.base
    console.log(userdatas[name].base)
    userdatas=JSON.stringify(userdatas)
    fs.writeFile(`userdata/userdata.json`,userdatas,err=>{
        if(err){throw err}
                console.log(`重写文件-${name}`)
    })
}
var func={ grow,save,add_agenda }
module.exports=func

//错误日志: eval()解析错误时，提示 出现预期之外的')' 实际是存档中无数据