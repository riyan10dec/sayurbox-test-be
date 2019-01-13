const Router = require('express').Router
const router = new Router()

const fruit = require('./model/fruit/router')
const user = require('./model/user/router')

router.route('/').get((req, res) => {
  res.json({ message: 'Welcome to sayurbox-test-01 API!' })
})

router.use('/fruit', fruit)
router.use('/user', user)

module.exports = router
