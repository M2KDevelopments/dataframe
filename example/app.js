import express from 'express';
import cors from 'cors';
import path from 'path';


const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => res.status(200).send('Health Check'))
app.get('/json', (req, res) => res.status(200).sendFile(path.join(process.cwd(), 'example', 'data.json')))
app.get('/sql', (req, res) => res.status(200).sendFile(path.join(process.cwd(), 'example', 'data.sql')))
app.get('/prisma', (req, res) => res.status(200).sendFile(path.join(process.cwd(), 'example', 'schema.prisma')))
app.get('/drizzle', (req, res) => res.status(200).sendFile(path.join(process.cwd(), 'example', 'drizzle.ts')))
app.get('/mongo', (req, res) => res.status(200).sendFile(path.join(process.cwd(), 'example', 'mongo.js')))


app.listen(3000, () => console.log('Running on 3000'))