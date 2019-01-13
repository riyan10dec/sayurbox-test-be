const Facade = require('../../lib/facade')
const fruitSchema = require('./schema')

class FruitFacade extends Facade {}

module.exports = new FruitFacade('Fruit', fruitSchema)
