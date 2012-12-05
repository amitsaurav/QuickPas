var express = require('express');
var path = require('path');
var mongoose = require('mongoose');

var app = express();

mongoose.connect('mongodb://localhost/products');

app.configure(function() {
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, "static")));
  app.use(express.errorHandler({ dumpException: true, showStack: true }));
});

var Schema = mongoose.Schema;
var Product = new Schema({
  asin: { type: String, required: true, index: { unique: true, dropDups: true }},
  data: { type: String, required: true },
  modified: {type: Date, default: Date.now},
  owner: { type: String, required: true }
});
var ProductModel = mongoose.model('Product', Product);

/* Home page */
app.get('/', function(req, res) {
  res.sendfile(__dirname + '/static/index.html');
});

/* Get all products */
app.get('/products', function(req, res) {
  return ProductModel.find(function(err, products) {
    if (!err) {
      return res.send(products);
    } else {
      return console.log(err);
    }
  });
});

/* Get a single product */
app.get('/products/:id', function (req, res){
  return ProductModel.find({ asin: req.params.id }, 'asin data owner', function (err, products) {
    if (!err && products.length == 1) {
      console.log('Returning 1 product with ASIN: ' + products[0].asin);
      return res.send(products[0]);
    } else {
      return console.log(err);
    }
  });
});

/* Add or edit a product */
app.post('/products', function(req, res) {
  ProductModel.find({ asin: req.body.asin }, 'asin data', function (err, products) {
    var product = null;
    if (products.length == 0) {
      console.log("No products found, adding new...");
      product = new ProductModel({
        asin: req.body.asin,
        data: req.body.data,
        owner: req.body.owner
      });
    } else {
      console.log("No. of products found: " + products.length + ", updating...");
      product = products[0];
      product.asin = req.body.asin;
      product.data = req.body.data;
      product.owner = req.body.owner;
    }
    
    return product.save(function (err) {
      if (!err) {
        console.log("Done!");
        return res.send(product);
      } else {
        console.log(err);
        return res.send(err);
      }
    });
  });
});

/* Delete a product */
app.delete('/products/:id', function (req, res){
  return ProductModel.find({ asin: req.params.id }, function (err, products) {
    console.log("Found product: " + products.length);
    if (products.length == 1) {
      return products[0].remove(function (err) {
        if (!err) {
          console.log("removed");
          return res.send('');
        } else {
          console.log(err);
        }
      });  
    }
  });
});

app.listen(3000);
console.log('listening on port 3000...');