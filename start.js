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
	asin: { type: String, required: true },
	data: { type: String, required: true },
	modified: {type: Date, default: Date.now}
});
var ProductModel = mongoose.model('Product', Product);

app.get('/', function(req, res) {
	res.sendfile(__dirname + '/static/index.html');
});

app.get('/products', function(req, res) {
	return ProductModel.find(function(err, products) {
		if (!err) {
			return res.send(products);
		} else {
			return console.log(err);
		}
	});
});

app.post('/products', function (req, res){
  var product;
  console.log("POST: ");
  console.log(req.body);
  product = new ProductModel({
    asin: req.body.asin,
    data: req.body.data,
  });
  
  product.save(function (err) {
    if (!err) {
      return console.log("created");
    } else {
      return console.log(err);
    }
  });
  return res.send(product);
});

app.listen(3000);
console.log('listening on port 3000...');