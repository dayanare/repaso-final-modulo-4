// Servidor Express

// Para probar los ficheros estáticos del fronend, entrar en <http://localhost:4500/>
// Para probar el API, entrar en <http://localhost:4500/api/items>

// Imports

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Arracar el servidor

const server = express();

// Configuración del servidor

server.use(cors());
server.use(express.json({ limit: '25mb' }));

// Conexion a la base de datos

async function getConnection() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS,
    // <-- Pon aquí tu contraseña o en el fichero /.env en la carpeta raíz
    database: process.env.DB_NAME || 'Clase',
  });
  connection.connect();
  return connection;
}

// Poner a escuchar el servidor

const port = process.env.PORT || 4500;
server.listen(port, () => {
  console.log(`Ya se ha arrancado nuestro servidor: http://localhost:${port}/`);
});

// Endpoints

// GET /api/items

// obtener los gatos
server.get('/api/kittens/:user', async (req, res) => {
  const user = req.params.user;
  const select = 'select * from kitten where owner = ?';
  const conn = await getConnection();
  const [result] = await conn.query(select, user);
  console.log(result);
  conn.end();
  res.json({
    info: {
      count: result.length, //número de elementos del listado
    },
    results: result, //listado de gatitos
  });
});

// añadir un nuevo gato
server.post('/api/kittens/:user', async (req, res) => {
  const user = req.params.user;
  const newKitten = req.body;

  try {
    const insert =
      'INSERT INTO kitten (`owner`,url, name, race, `desc`) VALUES (?,?,?,?,?)';
    const conn = await getConnection();
    const [result] = await conn.query(insert, [
      user,
      newKitten.url,
      newKitten.name,
      newKitten.race,
      newKitten.desc,
    ]);
    conn.end();
    res.json({
      success: true, //Puede ser true o false
    });
  } catch (error) {
    res.json({
      success: false, //Puede ser true o false
      message: error,
    });
  }
});

// Modificar el gato --> update sql
server.put('/api/kittens/:user/:kitten_id', async (req, res) => {
  const user = req.params.user;
  const kittenId = req.params.kitten_id;
  const { urlFront, nameFront, raceFront, descFront } = req.body;
  try {
    const update =
      'UPDATE kitten SET url= ?, name= ?, race= ? , `desc`= ? WHERE id = ?';
    const conn = await getConnection();
    const [result] = await conn.query(update, [
      urlFront,
      nameFront,
      raceFront,
      descFront,
      kittenId,
    ]);
    conn.end();
    res.json({
      success: true,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error,
    });
  }
});

///eliminar un gato
server.delete('/api/kittens/:user/:kitten_id', async (req, res) => {
  const { user, kitten_id } = req.params;

  try {
    const deleteSql = 'Delete from kitten where id = ?  and owner = ?';
    const conn = await getConnection();
    const [result] = await conn.query(deleteSql, [kitten_id, user]);
    conn.end();
    res.json({
      success: true,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error,
    });
  }
});
