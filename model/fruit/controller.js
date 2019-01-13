const Controller = require('../../lib/controller')
const fruitFacade = require('./facade')

class FruitController extends Controller {
    select (req, res, next) {
        var items = req.body.items;
        var custID = req.body.customerID;
        this.findPromise({name: {$in:items.map(x=>x.name)}
        }).then((fruits)=>{
            // if (err)
            //     res.send(err);
            // if (fruits.length != items.length) {
            //     res.status(500).json({
            //         "message": ""
            //     })
            //     return
            // }
            var selectedFruit;
            for(var item in items){
                var x = this.findByMatchingProperties(fruits, {name: items[item].name});
                if(x.length == 0){
                    res.status(500).json({
                        "message": "Fruit "+items[item].name+" not valid"
                    });
                    return;
                }
                if(x[0].quantity< items[item].quantity){
                    res.status(500).json({
                        "message": "Quantity of "+ x[0].name +" not valid"
                    });
                    return;
                }
            }
            res.sendStatus(200);
        }).catch(err => {
            res.send(err);
        })
    }
    order (req, res, next) {
        var items = req.body.items;
        var custID = req.body.customerID;
        let session = null;
        this.findPromise({name: {$in:items.map(x=>x.name)}}, session)
        .then((fruits)=>{
            for(var item in items){
                var x = this.findByMatchingProperties(fruits, {name: items[item].name})
                if(x.length == 0){
                    res.status(500).json({
                        "message": "Fruit "+items[item].name+" not valid"
                    });
                    return;
                }
                if(x[0].quantity< items[item].quantity){
                    res.status(500).json({
                        "message": "Quantity of "+ x[0].name +" not valid"
                    });
                    return;
                }
            }
            for(var item in items){
                var updateCounter = 0;
                // Quantity still available
                // Update Fruit with quantity more than 0 condition
                // Based on mongo documentation, a write operation is atomic on the level of a single document
                var errorFlag = false;
                this.updatePromise({_id: x[0]._id, quantity: { $gt: 0 }}, 
                    { 
                        $set: { 
                            quantity: (x[0].quantity - items[item].quantity) 
                        } 
                    }
                )
                .then((obj)=>{
                    if(errorFlag) return;
                    if(obj == null || obj.quantity < 0){
                        // rollback another fruit transaction
                        for(var item in items){ 
                            var rolledBackItem = this.findByMatchingProperties(fruits, {name: items[item].name});
                            this.updatePromise({_id: rolledBackItem[0]._id}, 
                                { 
                                    $set: { 
                                        quantity: rolledBackItem[0].quantity
                                    } 
                                }
                            );
                        }

                        res.status(500).json({
                            "message": "Quantity of "+ x[0].name +" is not available"
                        });
                        errorFlag = true;
                        return;
                    }
                    if(updateCounter == (items.length - 1)){
                        res.sendStatus(200);
                        return;
                    }
                    updateCounter++;
                })
                .catch(err=> {
                    res.send(err);
                    return;
                })
            }
        }).catch(err => {
            res.send(err);
            return;
        })    
    }
    findByMatchingProperties(set, properties) {
        return set.filter(function (entry) {
            return Object.keys(properties).every(function (key) {
                return entry[key] === properties[key];
            });
        });
    }
    findPromise(param) {
        return new Promise((resolve, reject) => {
            fruitFacade.find(param,(err, fruit) => {
                if (err)
                    return reject(err);
                resolve(fruit);
            })
        })
    }
    findPromiseSession(param, session) {
        return new Promise((resolve, reject) => {
            fruitFacade.find(param, {session}, (err, fruit) => {
                if (err)
                    return reject(err);
                resolve(fruit);
            })
        })
    }
    updatePromise(param, update) {
        return new Promise((resolve, reject) => {
            fruitFacade.update(param, update,{new:true}, (err, fruit) => {
                if (err)
                    return reject(err);
                resolve(fruit);
            })
        })
    }
}

module.exports = new FruitController(fruitFacade)
