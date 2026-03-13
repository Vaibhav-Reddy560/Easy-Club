console.log("Node is working");
const http = require('http');
const server = http.createServer((req, res) => {
    res.end('Hello');
});
server.listen(3002, () => console.log('Listening on 3002'));
setTimeout(() => process.exit(0), 5000);
