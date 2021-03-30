module.exports=(wss,user)=>{
  wss.on('connection', wss=>{
    console.log(`链接建立`)
    wss.on('message', message=>{
      console.log('received: %s', message);
      wss.send( JSON.stringify(user))
    });
    wss.on('disconnect', ()=> {
      wss.close()
      console.log('已断开链接');
  });
    wss.on('close',()=>{
      console.log('Socket对象已关闭');
    })
  })
}