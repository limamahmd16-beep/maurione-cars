export default async function handler(req,res){
  if(req.method!=='POST'){
    res.status(405).json({ok:false});
    return;
  }
  let body=req.body;
  try{
    if(typeof body==='string')body=JSON.parse(body);
  }catch{}
  const safe={
    stage:String(body?.stage||'unknown').slice(0,80),
    code:String(body?.code||'').slice(0,120),
    message:String(body?.message||'').slice(0,240),
    anonymous:Boolean(body?.anonymous),
    hasUser:Boolean(body?.hasUser),
    guestMode:Boolean(body?.guestMode),
    time:new Date().toISOString(),
  };
  console.log('VISITOR_DIAGNOSTIC',JSON.stringify(safe));
  res.status(200).json({ok:true});
}
