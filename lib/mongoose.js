const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/blog', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
}).then(() => {
  console.log('MongoDB is connected')
})

const userSchema = mongoose.Schema({
  id: { type: String, required: true, unique: true },
  pw: { type: String, required: true },
  name: { type: String },
  age: { type: Number, default: 18 },
  gender: { type: String, default: '아파치공격헬리콥터' },
  isMarried: { type: Boolean, default: false }
})
const User = mongoose.model('user', userSchema)

module.exports = {
  User
}
