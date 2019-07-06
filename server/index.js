const express = require('express')
const cors = require('cors');
const keys = require('./keys');

const server = express();
server.use(cors())
server.use(express.json())

const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});

pgClient.on('error', () => {console.log('Lost PG connection...')})

pgClient.query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch(err => {console.log(err)});


const redis = require('redis');
const client = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

const redisPublisher = client.duplicate();

server.get('/', (req, res, next) => {
    res.send('Hi!');
})

server.get('/values/all', async (req, res, next) => {
    try {
        const values = await pgClient.query('SELECT * FROM values');
        res.send(values.rows);
    } catch (error) {
        console.log(error)
    }
});

server.get('/values/current', async (req, res, next) => {
    try {
        client.hgetall('values', (err, values) => {
            res.send(values);
        })
    } catch (error) {
        console.log(error)
    }
})

server.post('/values', async (req, res, next) => {
    const index = req.body.index;
    if (parseInt(index) > 35) {
        return res.status(422).send('Index too high!')
    }
    client.hset('values', index, 'Nothing yet!')
    redisPublisher.publish('insert', index);
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);
    res.send('Working on it! ;)')
});


server.listen(5000, () => {console.log('Listening on port 5000...')})