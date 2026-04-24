const http = require('http');

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>¡Hola Mundo desde Kubernetes! ☸️</h1>');
}).listen(3000, () => {
    console.log('Servidor corriendo en puerto 3000');
});