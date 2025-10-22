import Fastify from 'fastify'
import pkg from 'pg'

const { Pool } = pkg;

const pool = new Pool({
    user: 'local',
    host: 'localhost',
    database: 'receitas',
    password: '123',
    port: '5432'
})

const server = Fastify();

server.get('/usuarios', async (req, reply) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const allowedOrder = ['id', 'nome', 'email', 'telefone', 'ativo', 'data_criacao']
    const sort = allowedOrder.includes(req.query.sort) ? req.query.sort: 'id'
    const order = req.query.order === 'desc' ? 'DESC' : 'ASC';

    try {
        const resultado = await pool.query(`SELECT * FROM USUARIOS ORDER BY ${sort} ${order} LIMIT ${limit} OFFSET ${offset}`)
        const count = await pool.query("SELECT COUNT(*) FROM USUARIOS")
        reply.status(200).send({data: resultado.rows, count: parseInt(count.rows[0].count) })


    } catch (err) {
        reply.status(500).send({ error: err.message })
    }
})
server.post('/usuarios', async (req, reply) => {
    const { nome, senha, email, telefone } = req.body;

    try {
        const resultado =
            await pool.query('INSERT INTO USUARIOS (nome, senha, email, telefone) VALUES ($1, $2, $3, $4) RETURNING *', [nome, senha, email, telefone])
        reply.status(200).send(resultado.rows[0])
    } catch (e) {
        reply.status(500).send({ error: e.message })
    }
})
server.put('/usuarios/:id', async (req, reply) => {
    const { nome, senha, email, telefone } = req.body;
    const id = req.params.id;

    try {
        const resultado = await pool.query('UPDATE USUARIOS SET nome=$1, senha=$2, email=$3, telefone=$4 WHERE id=$5 RETURNING *', [nome, senha, email, telefone, id])
        reply.status(200).send(resultado.rows)
    } catch (e) {
        reply.status(500).send({ error: e.message })
    }
})

server.delete('/usuarios/:id', async (req, reply)=>{
    const id = req.params.id
    try {
        await pool.query('DELETE FROM USUARIOS WHERE id=$1',[id])
        reply.send({ massage: 'USUARIO FOI JOGAR NO VASCO'})
    } catch (feia) {
        reply.status(500).send({ error: feia.massage})        
    }
})
server.get('/categorias', async (req, reply) => {
    try {
        const resultado = await pool.query('SELECT * FROM CATEGORIAS')

        const count = await pool.query("SELECT COUNT(*) FROM CATEGORIAS")
        reply.status(200).send({data: resultado.rows, count: parseInt(count.rows[0].count) })
    } catch (err) {
        reply.status(500).send({ error: err.message })
    }
})
server.post('/categorias', async (req, reply) => {
    const { nome } = req.body;
    try {
        const resultado =
            await pool.query('INSERT INTO CATEGORIAS (NOME) VALUES ($1) RETURNING *', [nome])
        reply.status(200).send(resultado.rows)
    } catch (e) {
        reply.status(500).send({ error: e.message })
    }
})
server.put('/categorias/:id', async (req, reply) => {
    const { nome } = req.body;
    const id = req.params.id;

    try {
        const resultado = await pool.query('UPDATE USUARIOS SET nome=$1 WHERE id=$2 RETURNING *', [nome,id])
        reply.status(200).send(resultado.rows)
    } catch (e) {
        reply.status(500).send({ error: e.message })
    }
})
server.delete('/categorias/:id', async (req, reply)=>{
    const id = req.params.id
    try {
        await pool.query('DELETE FROM USUARIOS WHERE id=$1',[id])
        reply.send({ massage: 'categoria FOI JOGAR NO VASCO'})
    } catch (feia) {
        reply.status(500).send({ error: feia.massage})        
    }
})
server.get('/receitas', async(req, reply)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const allowedOrder = ['id', 'nome']
    const sort = allowedOrder.includes(req.query.sort) ? req.query.sort: 'id'
    const order = req.query.order === 'desc' ? 'DESC' : 'ASC';

    try {
        const resultado = await pool.query(`SELECT * FROM RECEITAS ORDER BY ${sort} ${order}
            LIMIT ${limit} OFFSET ${offset}`)

            const count = await pool.query("SELECT COUNT(*) FROM RECEITAS")
            reply.send({data: resultado.rows, count: parseInt(count.rows[0].count) })
    } catch (err) {
        reply.status(500).send({ error: err.message})    
    }
})
server.post('/receitas', async (req, reply) => {
    const { nome, modo_preparo, ingredientes, tempo_preparo_minutos, porcoes, usuario_id, categoria_id } = req.body;

    try {
        const resultado =
            await pool.query('INSERT INTO RECEITAS ( nome, modo_preparo, ingredientes, tempo_preparo_minutos, porcoes, usuario_id, categoria_id ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
                 [ nome, modo_preparo, ingredientes, tempo_preparo_minutos, porcoes, usuario_id, categoria_id ])
        reply.status(200).send(resultado.rows[0])
    } catch (e) {
        reply.status(500).send({ error: e.message })
    }
})

server.listen({
    port: 3000,
    host: '0.0.0.0'
})