const connectToMongo = require('./db');
const express = require('express')
var cors = require('cors')
require('dotenv').config()




connectToMongo();

const app = express()
const port = process.env.port

app.use(cors())

//middlwware(3:04)45
app.use(express.json())

//Available Routes

app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))




app.listen(port, () => {
  console.log(`iNoteBook Backend listening at http://localhost:${port}`)
})