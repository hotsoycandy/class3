const express = require('express')
const crypto = require('crypto')
const session = require('express-session')
const methodOverride = require('method-override')

require('./lib/mongoose')
const User = require('./models/User')
const Post = require('./models/Post')

const app = express()
// middleware
app.use(express.json())
app.use(express.urlencoded())
app.use(methodOverride('_method'))
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


app.get('/posts/:postId', async (req, res) => {
  const postId = req.params.postId
  const post = await Post.findOneAndUpdate({ _id: postId }, { $inc: { hit: 1 } }, { new: true })
  res.render('postDetail', { post, user: req.session.user })
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

// 원래는 페이지를 보여주는 API 이기 때문에 get으로 해야됨
app.put('/posts/:postId', async (req, res) => {
  const postId = req.params.postId
  const post = await Post.findOne({ _id: postId })
  res.render('updatePost', { post })
})

app.put('/posts/:postId/update', async (req, res) => {
  const postId = req.params.postId
  const { body: { title, content } } = req
  await Post.updateOne({ _id: postId }, { title, content })
  res.redirect(`/posts/${postId}`)
})

app.post('/posts/:postId/comments', async (req, res) => {
  const postId = req.params.postId
  const writer = req.session.user._id
  const { body: { content } } = req
  await Post.updateOne({ _id: postId }, { $push: { comments: { content, writer } } })
  res.redirect(`/posts/${postId}`)
})

app.delete('/posts/:postId/comments/:commentId', async (req, res) => {
  const { params: { postId, commentId } } = req

  await Post.updateOne({ _id: postId }, { $pull: { comments: { _id: commentId } } })

  res.redirect(`/posts/${postId}`)
})

app.delete('/posts/:postId', async (req, res) => {
  const postId = req.params.postId
  await Post.deleteOne({ _id: postId })
  res.redirect('/posts')
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
