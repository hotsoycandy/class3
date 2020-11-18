const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  id: { type: String, required: true, unique: true },
  pw: { type: String, required: true },
  name: { type: String },
  age: { type: Number, default: 18 },
  gender: { type: String, default: '아파치 공격 헬리콥터' },
  isMarried: { type: Boolean, default: true }
})
const User = mongoose.model('user', userSchema)

module.exports = User