const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req,res) =>{

    const filePath = path.join(__dirname,'public',req.url==='/' ? 'index.html' : req.url);
    
    const extname = path.extname(filePath);

    let contentType = 'text/html';

    switch(extname){
        case '.css':
            contentType = 'text/css';
        break;
        case '.js':
            contentType = 'application/javascript';
        break;
        case '.jpg':
        case '.jpeg':
            contentType = 'image/jpeg';
        break;
        case '.png':
            contentType = 'image/png';
        break;
        case '.svg':
            contentType = 'image/svg+xml';
        break;
        default:
            contentType = 'text/html'
        break;
    }

    fs.readFile(filePath,(err,content) =>{

        if(err){
            res.writeHead(404,{'content-type':'text/plain'});
            res.end('Archivo no encontrado');
        }else{
            res.writeHead(200,{'content-type':contentType});
            res.end(content);
        }
    });
});

server.listen(PORT,()=>{
    console.log(`Servidor en http://localhost:${PORT}`);
});
