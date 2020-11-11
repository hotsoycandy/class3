const express = require('express')
const crypto = require('crypto')
const { User } = require('./lib/mongoose')

const app = express()
// middleware
app.use(express.json())
app.use(express.urlencoded())
app.use(express.static('./public'))

app.post('/login', async (req, res) => {
  const { body: { id, pw } } = req
  // encrypted password
  const epw = crypto.createHash('sha512').update(id + 'digitech' + pw + '!^*(sd').digest('base64')
  const data = await User.find({ id, pw: epw })
  res.json(data)
})

app.post('/registry', (req, res) => {
  const { body: { id, pw, name } } = req
  const epw = crypto.createHash('sha512').update(id + 'digitech' + pw + '!^*(sd').digest('base64')
  User.create({ id, pw: epw, name }).catch(console.log)
  res.redirect('/')
})

app.get('/users', async (req, res) => {
  const data = await User.find({ })
  res.json(data)
})

const port = 8000
app.listen(port, () => {
  console.log(`server is running on port ${port}`)
})
