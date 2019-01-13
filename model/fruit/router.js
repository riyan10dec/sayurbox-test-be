const controller = require('./controller')
const Router = require('express').Router
const router = new Router()
router.route('/')
  .get((...args) => controller.find(...args))
  .post((...args) => controller.create(...args))

router.route('/:id')
  .put((...args) => controller.update(...args))
  .get((...args) => controller.findById(...args))
  .delete((...args) => controller.remove(...args))

router.route('/select')
  .post((...args) => controller.select(...args))

  router.route('/order')
  .post((...args) => controller.order(...args))
module.exports = router
