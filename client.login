// Basit HTTP sunucusu (Render port uyarısı için)
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot çalışıyor!');
});
server.listen(process.env.PORT || 10000);
