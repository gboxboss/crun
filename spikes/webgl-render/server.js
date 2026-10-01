const http=require('http'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'www');
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.geojson':'application/json','.pbf':'application/x-protobuf'};
const port=+process.argv[2]||8080;
http.createServer((req,res)=>{
  const p=path.join(root,decodeURIComponent(req.url.split('?')[0]));
  if(!p.startsWith(root)){res.writeHead(403);return res.end();}
  fs.readFile(p,(err,buf)=>{
    if(err){res.writeHead(404);return res.end();}
    res.writeHead(200,{'Content-Type':types[path.extname(p)]||'application/octet-stream','Cache-Control':'max-age=3600','Access-Control-Allow-Origin':'*'});
    res.end(buf);
  });
}).listen(port,'127.0.0.1',()=>console.log('listening '+port));
