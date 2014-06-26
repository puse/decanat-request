var express = require('express');

var app = express();


app.use(express.static(__dirname));


app.get('/test', function(req, res){
    res.set('X-Test-Header', 'Header-Content');
    res.json({ 'test': 'passed' });
});

app.get('/testtext', function(req, res){
    res.set('X-Test-Header', 'Header-Content');
    res.send("test passed");
});

app.get('/test422', function(req, res){
    res.json(422, { email: 'invalid' });
});


app.listen(8081);

console.info('Test server running on 127.0.0.1:8081');
