var http = require('http');
var express = require('express');
var colors = require('colors');
var bodyParser = require('body-parser');

var app = express();
app.use(express.static('./public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');   // NOVO: vamos usar EJS
app.set('views', './views');     // NOVO: os templates ficam na pasta views

// Passo 1: saudação, agora com EJS
app.get('/saudacao', function (requisicao, resposta) {
  var nome = requisicao.query.nome;
  resposta.render('saudacao', { nome: nome, metodo: 'GET' });
});

app.post('/saudacao', function (requisicao, resposta) {
  var nome = requisicao.body.nome;
  resposta.render('saudacao', { nome: nome, metodo: 'POST' });
});

// Passo 2: cadastro (o exemplo do slide 22)
app.get('/cadastro', function (requisicao, resposta) {
  var nome = requisicao.query.nome;
  var sobrenome = requisicao.query.sobrenome;
  var nascimento = requisicao.query.nascimento;
  var civil = requisicao.query.civil;

  resposta.render('resposta_cadastro', { nome, sobrenome, nascimento, civil });
});

// Passo 3: contagem com for (slide 26)
app.get('/contar', function (requisicao, resposta) {
  var tamanho = requisicao.query.tamanho;
  resposta.render('contagem', { tamanho });
});

// Exercicio Calculadora
app.get('/somar', function(requisicao, resposta) {
  var num1 = Number(requisicao.query.num1);
  var num2 = Number(requisicao.query.num2);
  var soma = num1 + num2;
  resposta.render('resp_calculadora', {num1, num2, soma});
});

// Exercício Tabuada
app.get('/tabuada', function(requisicao, resposta){
  var numero = Number(requisicao.query.numero);
  resposta.render('resp_tabuada', {numero});
});

// Exercício Login
app.post('/logar', function(requisicao, resposta){
  var user = requisicao.body.user;
  var senha = requisicao.body.senha;
  var liberado = (user == 'admin' && senha == '123');
  resposta.render('resp_login', {user, liberado});
});


var server = http.createServer(app);
server.listen(3000);

console.log("servidor rodando...".rainbow);