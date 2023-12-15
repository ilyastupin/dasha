const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const fs = require('fs-extra')

const app = express()
const server = http.createServer(app)
const io = new Server(server)
let clientSocket = null

const PORT = process.env.PORT || 3000

io.on('connection', (socket) => {
  console.log('Client connected')
  clientSocket = socket

  socket.on('screenshot-taken', async () => {
    console.log('Screenshot taken')
  })
})

app.get('/take-screenshot', (req, res) => {
  if (clientSocket) {
    new Promise((resolve, reject) => {
      clientSocket.once('screenshot-taken', async () => {
        try {
          console.log('Screenshot taken')
          resolve()
        } catch (error) {
          console.error('Error handling screenshot-taken:', error)
          reject(error)
        }
      })
      clientSocket.emit('take-screenshot')
    })
      .then(() => {
        res.status(200).send('Screenshot taken')
      })
      .catch((error) => {
        res.status(500).send('Error processing screenshot: ' + error.message)
      })
    clientSocket.emit('take-screenshot')
  } else {
    res.status(500).send('Client not connected')
  }
})

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
