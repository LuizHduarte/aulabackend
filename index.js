const express = require('express')
const {Client} = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config')

const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

var conString = config.urlConnection;

var client = new Client(conString);

client.connect((err) =>{
    if(err){
        return console.error("Não foi possível conectar ao banco",err)
    }
    client.query("SELECT NOW()", (err, result) => {
        if(err){
            return console.error("Erro ao executar a querry",err);
        }
        console.log(result.rows[0]);
    })
});


app.get('/', (req, res) =>{
    console.log("Response Ok");
    res.send("Ok")
})

app.get('/usuarios', (req, res) =>{
    result = client.query("SELECT * from usuarios", (err,result) =>{
        if(err){
            return console.log(err)
        }
        return res.send(result.rows)
    })
})

app.get("/usuarios/:id", (req, res) => {
  try {
    client.query( 
        `SELECT * FROM Usuarios WHERE id = ${req.params.id}`,
        (err, result) => {
            if (err) {
                return console.error("Erro ao executar a qry de SELECT id", err);
            }
            res.send(result.rows);
            console.log(result);
        }
    );
  } catch (error) {
    console.log(error);
  }
});

app.post('/usuarios',(req,res) =>{
    const stringReq = `insert into usuarios (nome, email) values ('${req.body.name}', '${req.body.email}');`
    result = client.query(stringReq , (err,result) =>
    {
        if (err){
            return console.log(err)
        }
        return res.status(200)
    })
})

app.delete("/usuarios/:id", (req, res) => {
    try {
      const id = req.params.id;
      client.query(
          `DELETE FROM Usuarios WHERE id = ${id}`,
          (err, result) => {
          if (err) {
              return console.error("Erro ao executar a qry de DELETE", err);
          } else {
              if (result.rowCount == 0) {
                  res.status(400).json({ info: "Registro não encontrado." });
              } else {
                  res.status(200).json({ info: `Registro excluído. Código: ${id}` });
              }
          }
          //console.log(result);
        }
      );
    } catch (error) {
      console.log(error);
    }
  });

  app.put("/usuarios/:id", (req, res) => {
    try {
      console.log("Chamou update", req.body);
      const id = req.params.id;
      const { nome, email } = req.body;
      client.query(
        "UPDATE Usuarios SET nome=$1, email=$2 WHERE id =$3 ",
        [nome, email, id],
        function (err, result) {
          if (err) {
            return console.error("Erro ao executar a qry de UPDATE", err);
          } else {
            res.setHeader("id", id);
            res.status(202).json({ id: id });
            console.log(result);
          }
        }
      );
    } catch (erro) {
      console.error(erro);
    }
  });

app.listen(config.port, () =>{
    console.log("Ouvindo na porta " + config.port)
});

module.exports = app;