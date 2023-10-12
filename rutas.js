const express = require('express')
const routes = express.Router()

routes.get('/', (req, res) => {
    req.getConnection((err, conn) => {
        if(err) return res.send(err)

        conn.query('SELECT * FROM productos', (err, rows) => {
            if(err) return res.send(err)

            res.json(rows)
        })
    })
})

routes.post('/', (req, res) => {
    req.getConnection((err, conn) => {
        const { idcliente, idproducto } = req.body;

        if (idcliente && idproducto !== null) {
            conn.query('INSERT INTO productos (idcliente, idproducto) VALUES (?, ?)', [idcliente, idproducto], (err, rows) => {
                if (err) return res.send(err);

                res.send('producto insertado');
            });
        } else {
            res.status(400).send('Missing or invalid data in the request body.');
        }
    })
})

routes.delete('/:idproducto', (req, res) => {
    req.getConnection((err, conn) => {
        if(err) return res.send(err)

        conn.query('DELETE FROM productos WHERE idproducto = ?', [req.params.idproducto], (err, rows) => {
            if(err) return res.send(err)

            res.send('producto eliminado')
        })
    })
})

module.exports = routes