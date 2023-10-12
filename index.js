const express = require('express')
const mysql = require('mysql2')
const myconn = require('express-myconnection')

const routes = require('./rutas')

const app = express()
app.set('port', process.env.PORT || 9000)
const dbOptions = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '123456',
    database: 'lista'
}

app.use(myconn(mysql, dbOptions, 'single'))
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Lista de deseos')
})
app.use('/api', routes)

//server running -----------------------
app.listen(app.get('port'), ()=>{
    console.log('server running on port', app.get('port'))
})