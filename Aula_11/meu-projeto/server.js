// ===== 1. Importar as bibliotecas =====
var express = require("express");
var mongodb = require("mongodb");

// ===== 2. Configurar o Express =====
var app = express();
app.use(express.static("public"));               // libera os .html da pasta public
app.use(express.urlencoded({ extended: true })); // permite ler req.body dos formulários
app.set("view engine", "ejs");                  // as páginas de resposta ficam em views

// ===== 3. Conectar ao MongoDB =====
const MongoClient = mongodb.MongoClient;
const uri = `mongodb+srv://anacarolinagrcia_db_user:aulaFullStack@cluster0.3zliwgb.mongodb.net/`; // a string do SEU banco (Atlas)
// Mongo instalado no seu PC? Use: `mongodb://127.0.0.1:27017`
const client = new MongoClient(uri, { useNewUrlParser: true });

// ===== 4. Abrir o banco e a collection =====
var dbo = client.db("exemplo_bd");          // abre (ou cria) o armário
var usuarios = dbo.collection("usuarios");  // abre (ou cria) a gaveta
var loja = client.db("loja");
var produtos = loja.collection("produtos");

// ===== 5. CREATE: cadastrar usuário =====
app.post("/cadastrar_usuario", function (req, resp) {
    // 1. Monta a "ficha" com o que veio do formulário
  var data = { db_nome: req.body.nome, db_login: req.body.login, db_senha: req.body.senha };

    // 2. Coloca a ficha na gaveta
  usuarios.insertOne(data, function (err) {
    // 3. Quando o banco termina, ele "liga de volta" aqui
    if (err) {
      console.log(err);
      resp.render("resposta_usuario.ejs", { resposta: "Erro ao cadastrar usuário!" });
    } else {
      resp.render("resposta_usuario.ejs", { resposta: "Usuário cadastrado com sucesso!" });
    }
  });
});

// ===== 6. READ: logar usuário =====
app.post("/logar_usuario", function (req, resp) {
    // 1. O FILTRO: "procure fichas com ESTE login E ESTA senha"
  var data = { db_login: req.body.login, db_senha: req.body.senha };

    // 2. Busca e transforma o resultado numa lista (array)
  usuarios.find(data).toArray(function (err, items) {
    console.log(items);
    if (err) {
      resp.render("resposta_usuario.ejs", { resposta: "Erro ao logar usuário!" });
    } else if (items.length == 0) {
      resp.render("resposta_usuario.ejs", { resposta: "Usuário/senha não encontrado!" });
    } else {
      resp.render("resposta_usuario.ejs", { resposta: "Usuário logado com sucesso!" });
    }
  });
});

app.post("/cadastrar_produto", function (req, resp) {
    // 1. Monta a "ficha" com o que veio do formulário
  var data = { codigo: req.body.codigo, descricao: req.body.descricao, valor: Number(req.body.valor) };

    // 2. Coloca a ficha na gaveta
  produtos.insertOne(data, function (err) {
    // 3. Quando o banco termina, ele "liga de volta" aqui
    if (err) {
      console.log(err);
      resp.render("resp_cad_prod.ejs", { resposta: "Erro ao cadastrar produto!" });
    } else {
      resp.render("resp_cad_prod.ejs", { resposta: "Produto cadastrado!" });
    }
  });
});

app.post("/buscar_produto", function (req, resp) {
    // 1. O FILTRO: "procure produtos com ESTA descrição"
  var data = { descricao: req.body.descricao };

    // 2. Busca e transforma o resultado numa lista (array)
  produtos.find(data).toArray(function (err, items) {
    console.log(items);
    if (err) {
      resp.render("resposta_buscapd.ejs", { resposta: "Erro ao buscar produto!" });
    } else if (items.length == 0) {
      resp.render("resposta_buscapd.ejs", { resposta: "Produto não encontrado!" });
    } else {
      resp.render("resposta_buscapd.ejs", { resposta: "Produto encontrado com sucesso!" });
    }
  });
});

// ===== READ: listar todos os produtos =====
app.get("/listar_produtos", function (req, resp) {
  // 1. Filtro vazio {} = "me traga TODOS os produtos"
  produtos.find({}).toArray(function (err, items) {
    console.log(items);
    if (err) {
      resp.render("resp_cad_prod.ejs", { resposta: "Erro ao listar produtos!" });
    } else {
      // 2. Manda a lista inteira para a página
      resp.render("lista_produtos.ejs", { items: items });
    }
  });
});

app.post("/atualizar_usuario", async function (req, resp) {
  try {
    // 1. QUEM: o usuário com este login E esta senha atual
    var filtro = { db_login: req.body.login, db_senha: req.body.senha };
    // 2. O QUE: troque SÓ a senha pela nova
    var newData = { $set: { db_senha: req.body.novasenha } };

    // 3. Espera o banco atualizar
    const result = await usuarios.updateOne(filtro, newData);
    console.log(result);

    if (result.matchedCount == 0) {
      resp.render("resposta_usuario", { resposta: "Usuário/senha atual não encontrado!" });
    } else {
      resp.render("resposta_usuario", { resposta: "Usuário atualizado com sucesso!" });
    }
  } catch (err) {
    console.error(err);
    resp.render("resposta_usuario", { resposta: "Erro ao atualizar usuário!" });
  }
});

app.post("/remover_usuario", async function (req, resp) {
  try {
    // 1. QUEM: o usuário com este login E esta senha
    var filtro = { db_login: req.body.login, db_senha: req.body.senha };

    // 2. Espera o banco apagar
    const result = await usuarios.deleteOne(filtro);
    console.log(result);

    if (result.deletedCount == 0) {
      resp.render("resposta_usuario", { resposta: "Usuário/senha não encontrado!" });
    } else {
      resp.render("resposta_usuario", { resposta: "Usuário removido com sucesso!" });
    }
  } catch (err) {
    console.error(err);
    resp.render("resposta_usuario", { resposta: "Erro ao remover usuário!" });
  }
});

app.get("/usuarios", function (req, resp) {
  usuarios.find({}).toArray(function (err, items) {
    resp.json(items);   // em vez de montar uma página, devolve os dados
  });
});

app.post("/atualizar_produto", async function (req, resp) {
  try {
    var filtro = { descricao: req.body.descricao };
    var newData = { $set: { valor: Number(req.body.novovalor) } };

    // 3. Espera o banco atualizar
    const result = await produtos.updateOne(filtro, newData);
    console.log(result);

    if (result.matchedCount == 0) {
      resp.render("resp_cad_prod.ejs", { resposta: "Produto não encontrado!" });
    } else {
      resp.render("resp_cad_prod.ejs", { resposta: "Produto atualizado!" });
    }
  } catch (err) {
    console.error(err);
    resp.render("resp_cad_prod", { resposta: "Erro ao atualizar produto!" });
  }
});

app.post("/remover_produto", async function (req, resp) {
  try {
    var filtro = { descricao: req.body.descricao };

    // 2. Espera o banco apagar
    const result = await produtos.deleteOne(filtro);
    console.log(result);

    if (result.deletedCount == 0) {
      resp.render("resp_cad_prod", { resposta: "Produto não encontrado!" });
    } else {
      resp.render("resp_cad_prod", { resposta: "Produto removido com sucesso!" });
    }
  } catch (err) {
    console.error(err);
    resp.render("resp_cad_prod", { resposta: "Erro ao remover produto!" });
  }
});

app.get("/api/produtos", function (req, resp) {
  produtos.find({}).toArray(function (err, items) {
    resp.json(items);   // em vez de montar uma página, devolve os dados
  });
});

// ===== 7. Ligar o servidor (sempre no final) =====
app.listen(80, function () {
  console.log("Servidor rodando em http://localhost");  // erro de permissão? troque por 3000
});