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
  ion: { type: String },
  modified: {type: Date, default: Date.now},
  owner: { type: String, required: true }
});
var ProductModel = mongoose.model('Product', Product);

var logAndReportMessage = function(msg, res, success) {
  console.log(msg);

  var response = {};
  if (success) {
    response.success = success;
  } else {
    response.success = false;
  }
  response.msg = msg;
  return res.send(response);
};

/* Home page */
app.get('/', function(req, res) {
  res.sendfile(__dirname + '/static/index.html');
});

/* Get all products */
app.get('/products', function(req, res) {
  return ProductModel.find(function(err, products) {
    if (!err) {
      console.log('Returning ' + products.length + ' products...');
      return res.send(products);
    } else {
      return logAndReportMessage('Error querying all products: ' + err, res);
    }
  });
});

/* Get a single product */
app.get('/products/:id', function (req, res){
  var dataString = 'data';
  if (req.query['ion'] == 1) {
    dataString += ' ion'
  }

  return ProductModel.find({ asin: req.params.id }, 'asin ' + dataString + ' owner modified', function (err, products) {
    if (!err && products.length == 1) {
      console.log('Returning 1 product with ASIN: ' + products[0].asin);
      return res.send(products[0]);
    } else {
      return logAndReportMessage('Error returning product for asin: ' + req.params.id + ': ' + err, res);
    }
  });
});

/* Add a product */
app.post('/products', function(req, res) {
  ProductModel.find({ asin: req.body.asin }, 'asin data owner', function (err, products) {
    var product = null;
    if (products.length != 0) {
      return logAndReportMessage('ASIN already exists! Cannot create new: ' + req.body.asin, res);
    }
    
    console.log("No products found, adding new asin: " + req.body.asin);
    product = new ProductModel({
      asin: req.body.asin,
      data: req.body.data,
      ion: req.body.ion,
      owner: req.body.owner
    });
    
    return product.save(function (err) {
      if (!err) {
        return logAndReportMessage('Created new product with asin: ' + req.body.asin, res, true);
      } else {
        return logAndReportMessage('Error creating asin: ' + req.body.asin + ': ' + err, res);
      }
    });
  });
});

/* Update a product */
app.put('/products/:id', function(req, res) {
  ProductModel.find({ asin: req.params.id }, 'asin data owner', function (err, products) {
    var product = null;
    if (products.length == 0) {
      return logAndReportMessage('ASIN not found!  Cannot edit: ' + req.params.id, res);
    } 

    console.log('ASIN found! Editing: ' + req.params.id);
    product = products[0];
    product.data = req.body.data;
    product.ion = req.body.ion;
    product.owner = req.body.owner;
    product.modified = new Date;
    
    return product.save(function (err) {
      if (!err) {
        return logAndReportMessage('Updated product with asin: ' + req.params.id, res, true);
      } else {
        return logAndReportMessage('Error updating asin: ' + req.params.id + ': ' + err, res);
      }
    });
  });
});

/* Delete a product */
app.delete('/products/:id', function (req, res){
  return ProductModel.find({ asin: req.params.id }, function (err, products) {
    if (products.length == 1) {
      return products[0].remove(function (err) {
        if (!err) {
          return logAndReportMessage('Deleted product with asin: ' + req.params.id, res, true);
        } else {
          return logAndReportMessage('Error deleting product with asin: ' + req.params.id + ': ' + err, res);
        }
      });  
    } else {
      return logAndReportMessage('Asin not found: ' + req.params.id, res);
    }
  });
});

app.listen(3000);
console.log('listening on port 3000...');