const express = require('express')
const crypto = require('crypto')
const session = require('express-session')
require('./lib/mongoose')
const User = require('./models/User')
const Post = require('./models/Post')

const app = express()
// middleware
app.use(express.json())
app.use(express.urlencoded())
app.use(express.static('./public'))
app.set('view engine', 'ejs')
app.use(session({
  secret: '($*YA)*@#12asd^%#',
  resave: false,
  saveUninitialized: true
}))

app.get('/', (req, res) => {
  res.render('main', { user: req.session.user })
})

app.get('/posts', async (req, res) => {
  const posts = await Post.find()
  res.render('posts', { posts, user: req.session.user })
})

app.get('/posts/create', (req, res) => {
  if (!req.session.user) return res.redirect('/')
  res.render('createPost')
})

app.get('/registry', (req, res) => {
  res.render('registry')
})

app.post('/posts', (req, res) => {
  // 로그인 안돼있을 때 메인으로 가는 코드
  if (!req.session.user) return res.redirect('/')

  const { body: { title, content } } = req
  // DB에 실제로 들어가는 코드
  Post.create({ title, content, writer: req.session.user._id })
  res.redirect('/posts')
})

app.post('/login', async (req, res) => {
  const { body: { id, pw } } = req
  // encrypted password
  const epw = crypto.createHash('sha512').update(id + 'digitech' + pw + '!^*(sd').digest('base64')
  const data = await User.findOne({ id, pw: epw })
  if (data) {
    req.session.user = data
    res.redirect('/')
  } else {
    res.send('로그인에 실패하셨습니다.')
  }
})

app.get('/logout', function (req, res) {
  delete req.session.user
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
