const express = require('express')
const crypto = require('crypto')
require('./lib/mongoose')
const User = require('./models/User')

const app = express()
// middleware
app.use(express.json())
app.use(express.urlencoded())
app.use(express.static('./public'))

let session = false
app.post('/login', async (req, res) => {
  const { body: { id, pw } } = req
  // encrypted password
  if (session) return res.send('로그인이 이미 되어있습니다!')
  const epw = crypto.createHash('sha512').update(id + 'digitech' + pw + '!^*(sd').digest('base64')
  const data = await User.find({ id, pw: epw })
  if (data.length) session = true
  res.json(data)
})

app.get('/logout', function (req, res) {
  session = false
  res.redirect('/')
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
