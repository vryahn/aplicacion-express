// Importamos las librerías necesarias
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

// Iniciamos Express
const app = express();

// Middleware para analizar JSON
const jsonParser = bodyParser.json();

// Abrimos conexión a SQLite
let db = new sqlite3.Database('./base.sqlite3', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Conectado a SQLite correctamente.');

    // Creamos la tabla "todos" si no existe
    db.run(`CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        todo TEXT NOT NULL,
        created_at INTEGER
    )`, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Tabla "todos" creada o ya existente.');
        }
    });
});

// Endpoint POST para agregar una nueva tarea ("agrega_todo")
app.post('/agrega_todo', jsonParser, (req, res) => {
    const { todo } = req.body;

    if (!todo) {
        res.status(400).json({ error: 'Campo "todo" requerido' });
        return;
    }

    const unixTimestamp = Math.floor(Date.now() / 1000);

    const stmt = db.prepare('INSERT INTO todos (todo, created_at) VALUES (?, ?)');

    stmt.run(todo, unixTimestamp, function (err) {
        if (err) {
            console.error("Error al insertar:", err.message);
            res.status(500).json({ error: 'Error al insertar en la base de datos' });
            return;
        } else {
            console.log("Registro insertado con éxito.");
            res.status(201).json({
                id: this.lastID,
                todo: todo,
                created_at: unixTimestamp
            });
        }
    });

    stmt.finalize();
});

// Mismo endpoint del ejercicio anterior pero para método GET: listar los todos
app.get('/agrega_todo', (req, res) => {
    const sql = `SELECT id, todo, created_at FROM todos ORDER BY created_at DESC`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Error al consultar:", err.message);
            res.status(500).json({ error: 'Error al consultar la base de datos' });
            return;
        }
        res.status(200).json(rows);
    });
});

// Endpoint GET de prueba en raíz
app.get('/', (req, res) => {
    res.status(200).json({ 'status': 'ok2' });
});

// Endpoint de login (no modificado)
app.post('/login', jsonParser, (req, res) => {
    console.log(req.body);
    res.status(200).json({ 'status': 'ok' });
});

// Servidor escucha en puerto 3000
const port = 3000;
app.listen(port, () => {
    console.log(`Aplicación corriendo en http://localhost:${port}`);
});
