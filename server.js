const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {

    if (req.url === '/api/saved' && req.method === 'GET') {
        fs.readFile('savedArticles.json', 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: 'Błąd odczytu pliku' }));
                return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(data);
        });

        return;
    }

    if (req.url === '/api/saved' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const newArticle = JSON.parse(body);

            fs.readFile('savedArticles.json', 'utf8', (err, data) => {
                let articles = [];

                if (!err && data) {
                    articles = JSON.parse(data);
                }

                articles.push(newArticle);

                fs.writeFile('savedArticles.json', JSON.stringify(articles, null, 2), err => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                        res.end(JSON.stringify({ error: 'Błąd zapisu pliku' }));
                        return;
                    }

                    res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({ message: 'Artykuł zapisany' }));
                });
            });
        });

        return;
    }

    let filePath = req.url === '/'
        ? path.join(__dirname, 'index.html')
        : path.join(__dirname, req.url);

    const ext = path.extname(filePath);

    let contentType = 'text/html; charset=utf-8';

    if (ext === '.css') contentType = 'text/css; charset=utf-8';
    if (ext === '.js') contentType = 'text/javascript; charset=utf-8';
    if (ext === '.json') contentType = 'application/json; charset=utf-8';
    if (ext === '.png') contentType = 'image/png';
    if (ext === '.ico') contentType = 'image/x-icon';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h1>404 - Nie znaleziono strony</h1>');
            return;
        }

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`Serwer działa: http://localhost:${PORT}`);
});