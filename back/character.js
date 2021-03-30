const schedule = require('node-schedule');
class Character{
    constructor(name,gender,age,height,weight,
    MaxStrength=1.25,MaxPower=1.25,swords=0,minds=0,programs=0,
    memoryl=[{past:[`交给我了！休息吧！`,`我搞定了！！牛逼不？睡觉去了。哈哈今天也冥想一会...`],future:[`我需要你完成早起和作息的平常化`,
    `很好！你果然是个有价值的朋友！`]}]) {
        this.name=name
        this.gender=gender
        this.age=age
        this.height=height
        this.weight=weight
        this.MaxStrength=MaxStrength
        this.MaxPower=MaxPower
        this.swords=swords
        this.minds=minds
        this.programs=programs
        this.memoryl=memoryl //长期记忆 记录重要的短期记忆以便将来回溯 调用。
        this.strength=this.MaxStrength*0.8 //体力常态值 受到力气上限，持久、恢复等影响。生理参考值：肌肉数量
        this.power=this.MaxPower*0.8 //精力常态是缓慢消耗中的。精力 影响 头脑的清明程度、精力的旺盛程度，身体的唤醒程度  生理参考：脑中神经递质的恢复程度
    }
    status={awake:1,isbreak:0,active:1} //身体状态
    level={m:0,p:0,s:0} // m=心理学 p=编程 s=剑道
    consume=0   //累计消耗
    energy=0    //食物中获取的能量 支撑日常消耗
    emotion=50 //情绪的变化 影响工作效率  如何测定情绪。
    MaxPressure=1.25
    pressure=0.8 //压力 负面影响带来的消极情绪、长期重复性活动带来的机械性疲劳  生理参考：各部分器官的累计疲劳程度 如，眼，耳，脑
    memorys=[] //短期记忆  前台读取记忆 知晓变化
    sleep(t){
        if(this.status.awake==0){return}
        this.status.awake=0
        this.rest(1)
        if(this.age>=50){var st=4.5}else if(this.age>=33){var st=5}else if(this.age>=29){var st=5.5}
        else if(this.age>=16){var st=6}else if(this.age>=13){var st=7}else{var st=8.5} //不同年龄的人对睡眠的需求

        var s=setInterval(()=>{
            if(this.status.awake==1){return s.cancel()}
            this.power+=(1/(2*st));
            this.limit(`power`)
            this.pressure-=(1/(2*st))
            this.limit(`pressure`)
            this.status.awake=0;
        },1000*1800)
        if(t>st){
            var t=st
        }
        setTimeout(()=>{clearInterval(s);this.awake();console.log(`睡眠状态结束`)},t*1000*3600+1000) //超需求 睡眠会更疲惫
    }
    awake(){
        if(this.status.awake==1){return}
        this.status.awake=1
        var w=schedule.scheduleJob('30 30 * * * *',()=>{ //每小时的30:30触发
            if(this.status.awake==0){
                return w.cancel()
            }
            
            this.power-=1/18
            console.log(`剩余精力值: ${this.power}  当前时间` + new Date());
        }); 
    }
    exercise(extimes) {
        if(this.gender){
            var dayCal = 66 + (13.7*this.weight) + (5*this.height) - (6.8 * this.age)
            var g=1 //性别系数
        }else{
            var dayCal = 655 + (9.6*this.weight) + (1.8*this.height) - (4.7 * this.age)
            var g=0.8
        }
        for(let i=0;i<extimes;i++){
            this.consume=Math.floor(dayCal*(1.2+i*0.175))
        }
        var Δs=1*g/(30*this.weight*0.35)  //日增长肌肉量百分比
        this.MaxStrength+=extimes*Δs/5
        this.MaxStrength =  Number(this.MaxStrength.toFixed(4))
        console.log(`体力: +${(extimes*Δs/5).toFixed(4)} 增长比`)
        var Δw=(this.energy-this.consume)/7716  //7716千卡/千克脂肪  减去多少脂肪
        this.weight+=Number(Δw)
        this.weight=Number(this.weight.toFixed(4))
        console.log(`体重: ${Δw.toFixed(4)} 千克`)
        this.strength=this.strength*(5-extimes)/5  //锻炼消耗体力
        this.remenbers(`体力: +${(extimes*Δs/5).toFixed(4)} 增长比`,`体重: ${Δw.toFixed(4)} 千克`)
    }
    eat(food) {
        switch (food){
            case 0: this.energy = 0     //绝食
            break;
            case 1: this.energy = 320+430+600  //减肥餐
            break;
            case 2: this.energy = 360+810+600  //正常女性  男性较少
            break;
            case 3: this.energy = 510+840+700; //正常男性  女性较多
            break;
            case 4: this.energy = 580+960+800; //男性较多  女性吃货
            break;
            case 5: this.energy = 5000  //暴饮暴食
        }
        if(this.gender){
            console.log(`男性摄入: ${this.energy}`)
            this.remenbers(`男性摄入: ${this.energy}`)
        }
        if(!this.gender && food!=0){
            this.energy=this.energy*((0.1*food/4)+0.81)
            console.log(`女性摄入 ${this.energy}`)
            this.remenbers(`女性摄入 ${this.energy}`)
        }
    }
    amuse(t) {
        this.pressure-=t/3
        if(this.pressure<=0){this.pressure=0}
        console.log(`娱乐${t}小时`)
        this.remenbers(`娱乐${t}小时`)
    }
    meditation(t){
        let tm=t*60
        this.rest(t)
        this.power+=this.MaxPower*(tm/30)
        this.MaxPower+=tm/100000
        this.limit(`power`)
        console.log(`冥想${tm}分钟`)
        this.remenbers(`冥想${tm}分钟，精力: +${tm/100000}`)
    }
    rest(t){
        var tm=t*60
        this.strength=this.MaxStrength*(tm/60)*0.8
        console.log(`休息${tm}分钟`)
        this.limit(`strength`)
        this.remenbers(`休息${tm}分钟，体力: 恢复${tm/60}`)
    }
    mind(t){
        this.pressure+=t/12
        this.minds+=t
        console.log(`心学-修习增加至:`+this.minds)
        this.level.m=this.minds.toString().length-1
        this.remenbers(`心学-修习增加至:`+this.minds)
    }
    program(t){
        this.pressure+=t/15
        this.programs+=t
        console.log(`编程-修习增加至:`+this.programs)
        this.level.p=this.programs.toString().length-1
        this.remenbers(`编程-修习增加至:`+this.minds)
    }
    sword(){
        this.swords+=120
        this.level.s=(Math.floor(this.swords/400)).toString().length-1
        console.log(`剑道-修习增加至:${this.swords}`)
        this.remenbers(`剑道-修习增加至:${this.swords}`)
    }
    losePower(){
        this.MaxPower-=0.1
        console.log(`走丹--百日筑基中，越不走丹，成效益彰。 精力: -0.1`)
        this.remenbers(`走丹--凡练功,走漏者。 精力: -0.1`)
    }
    chose(e,n,t){
        return setTimeout(eval(`this.${e}(${n})`),t*1000*60)
    }
    rhythm(events){
        var time=`1 0 * * * `+events.eternal
        var agenda=events.agenda
        schedule.scheduleJob(time,() => {
            this.breakdown()
            if(this.status.isbreak==1){
                this.sleep(1)
                this.remenbers(`状态异常，陷入昏迷状态`)
                return console.log(`状态异常，陷入昏迷状态`)
            }
            var time=new Date()
            //var born = new Date("July 21, 1983 01:15:00")
            var hour=time.getHours()
            for(let i in agenda){
                var ts=agenda[i].start[0]
                var tm=agenda[i].start[1]
                var te=agenda[i].end
                var num=agenda[i].num
                var e=i
                if(hour==ts){
                    var m=schedule.scheduleJob(`5 * * * * *`,()=>{
                        var minutes=new Date().getMinutes()
                        if(minutes==tm){
                            this.remenbers(`时间: ${ts}点 活动: ${e}开始 `)
                            console.log(`时间: ${ts}点 活动: ${e}开始 `)
                            m.cancel()
                            this.chose(e,num,te)
                        }
                    })
                }
            }
        });
    }
    justdo(e,n){
        return eval(`this.${e}(${n})`)
    }
    daycount(e){
        var agenda=e.agenda
        for(let i in agenda){
            var num=agenda[i].num
            var e=i
            console.log(`代号: ${i} --- 计算活动: ${e} `)
            this.remenbers(`代号: ${i} --- 计算活动: ${e} `)
            this.justdo(e,num)
        }
    }
    remenbers(...m){
        this.memorys.push(...m)
    }
    remenberl(...m){
        this.memoryl.push(...m)
    }
    breakdown(){
        if(this.pressure==1 || this.power==0 || this.strength==0){
            this.status.isbreak=1
        }
    }
    check(){
        var BMI=this.weight/(Math.pow(this.height,2)/10000)
        var T=1.2*BMI+0.23*this.age-5.4-10.8*this.gender //体脂率
        T=T.toFixed(2)
        if(this.gender){var sex=1}else{ var sex=1.355 }
        console.log(`体脂率: ${T}%`)
        if(T>=25*sex){
            console.log(`肥胖`)
        }else if(T>=18*sex){
            console.log(`超重`)
        }else if(T>=14*sex){
            console.log(`健康`)
        }else if(T>=6*sex){
            console.log(`健壮`)
        }else if(T>=2*sex){
            console.log(`偏瘦`)
        }else{
            console.log(`超出测量范围`)
        }
    }
    feeling(){
        if(this.emotion<=50){
            this.status.active=0
        }else if (this.emotion==100){
            this.status.active=0
        }
        else{
            this.status.active=1
        }
    }
    showLevel(l){
        switch(l){
            case 0:
                console.log(`初学乍练`)
                break;
            case 1:
                console.log(`初窥门径`)
                break;
            case 2:
                console.log(`炉火纯青`)
                break;
            case 3:
                console.log(`融会贯通`)
                 break;
            case 4:
                console.log(`一代宗师`)
            }
    }
    limit(a){
        var a0=a.charAt(0).toUpperCase()+a.slice(1)
        var max=eval(`this.Max`+a0)
        if(eval(`this.`+a)>=max*0.8){
            eval(`this.${a}=${max*0.8}`)
        }else if(eval(`this.`+a)<0){
            return eval(`this.${a}=0`)
        }
    }
}

var agenda=[{"agenda":{"sleep":{"start":[0,35],"end":10,"num":"7"},eat:{}}}]
module.exports=Character
// 未实装长期记忆的能力、情绪值影响状态和效率。
//待添加--称号系统