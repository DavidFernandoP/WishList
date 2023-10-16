const express = require('express')
const axios = require('axios');
const routes = express.Router()

routes.get('/lista', (req, res) => {
    req.getConnection((err, conn) => {
        if(err) return res.send(err)

        conn.query('SELECT * FROM productos', (err, rows) => {
            if(err) return res.send(err)

            res.json(rows)
        })
    })
})

routes.post('/lista/insertar', (req, res) => {
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

routes.delete('/lista/eliminar/:idproducto', (req, res) => {
    req.getConnection((err, conn) => {
        if(err) return res.send(err)

        conn.query('DELETE FROM productos WHERE idproducto = ?', [req.params.idproducto], (err, rows) => {
            if(err) return res.send(err)

            res.send('producto eliminado')
        })
    })
})

routes.get('/lista/:idcliente', (req, res) => {
    const idcliente = req.params.idcliente;

    req.getConnection((err, conn) => {
        if (err) return res.send(err);

        conn.query('SELECT idproducto FROM productos WHERE idcliente = ?', [idcliente], (err, rows) => {
            if (err) return res.send(err);

            const idProductos = rows.map(row => row.idproducto);

            res.json(idProductos);
        });
    });
});
  
routes.get('/actualizar', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.send(err);
        conn.query('SELECT idproducto FROM productos', (err, rows) => {
            if (err) return res.send(err);

            const idproducto_vector = rows.map((row) => row.idproducto);

            const apiUrls = [
                'https://cards.thenexusbattles2.cloud/api/cartas/?size=1000&page=1&coleccion=Armas&onlyActives=true',
                'https://cards.thenexusbattles2.cloud/api/cartas/?size=1000&page=1&coleccion=Heroes&onlyActives=true',
                'https://cards.thenexusbattles2.cloud/api/cartas/?size=1000&page=1&coleccion=Armaduras&onlyActives=true',
                'https://cards.thenexusbattles2.cloud/api/cartas/?size=1000&page=1&coleccion=Epicas&onlyActives=true',
                'https://cards.thenexusbattles2.cloud/api/cartas/?size=1000&page=1&coleccion=Items&onlyActives=true',
            ];

            const apiPromises = apiUrls.map(apiUrl => axios.get(apiUrl).then(response => response.data));

            Promise.all(apiPromises)
                .then(apiResponses => {
                    const _id_vector = apiResponses
                        .map(apiResponse => apiResponse.map(item => item._id))
                        .flat();

                    const valoresAEliminar = idproducto_vector.filter(id => !_id_vector.includes(id));

                    if (valoresAEliminar.length > 0) {
                        conn.query('DELETE FROM productos WHERE idproducto IN (?)', [valoresAEliminar], (err, result) => {
                            if (err) return res.send(err);

                            console.log(`Se eliminaron ${result.affectedRows} registros.`);
                        });
                    } else {
                        console.log('No se encontraron registros para eliminar.');
                    }

                    res.json({
                        idproducto_vector,
                        _id_vector,
                    });
                })
                .catch((error) => {
                    console.error('Error al consumir las APIs:', error);
                    res.status(500).json({ error: 'Error al consumir las APIs' });
                });
        });
    });
});
  
module.exports = routes