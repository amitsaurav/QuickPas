$(document).ready(function() {

  var fetchAndRefreshTable = function() {
    // List products
    $.get('/products', function(data) {
      var tableBody = '';
      for (var i=0; i<data.length; i++) {
        tableBody += '<tr>';
        tableBody += '<td>' + data[i].asin + '</td>';
        tableBody += '<td>' + data[i].data + '</td>'; // truncate and add ellipses
        tableBody += '<td>' + data[i].modified + '</td>';
        tableBody += '<td>' + data[i].owner + '</td>';
        tableBody += '<td>';
        tableBody += '<button class="btn btn-success btn-small edit-asin">Edit</button>&nbsp;';
        tableBody += '<button class="btn btn-danger btn-small delete-asin">Delete</button></td>';
        tableBody += '</tr>';
      }

      if (tableBody === '') {
        $('#table-body').empty().append('<tr><td>...</td><td>...</td><td>...</td><td>...</td><td>...</td></tr>');
      } else {
        $('#table-body').empty().append(tableBody);
        $('.edit-asin').click(editAsin);
        $('.delete-asin').click(deleteAsin);
      }
    });
  };

  var showErrorDialog = function(msg) {
    $('#error-message').html(msg);
    $('#on-error').modal('toggle');
  };

  var showEditDialog = function(product) {
    $('#add-modal-heading').text('Edit Product');
    $('#product-asin').val(product.asin);
    $('#product-data').val(product.data);
    $('#product-owner').val(product.owner);
    $('#add-new').modal('toggle');
  };
  
  var editAsin = function () {
    var asin = $(this).parent().siblings(":first").text();
    $.ajax({
      type: 'GET',
      url: '/products/' + asin,
      success: showEditDialog,
      error: showErrorDialog
    });
  };

  var deleteAsin = function() {
    var asin = $(this).parent().siblings(":first").text();
    $.ajax({
      type: 'DELETE',
      url: '/products/' + asin,
      success: fetchAndRefreshTable,
      error: showErrorDialog
    });
  };

  var getErrorMessage = function (errorObject) {
    var msg = '<ul>';
    for (err in errorObject) {
      msg += '<li>' + errorObject[err].message + '</li>';
    }
    msg += '</ul>';
    return msg;
  };

  $('#create').click(function() {
    var asin = $('#product-asin').val();
    $.ajax({
      url: '/products',
      type: 'POST',
      data: {
        asin: asin,
        data: $('#product-data').val(),
        owner: $('#product-owner').val()
      },
      success: function(product) {
        $('#add-new').modal('toggle');
        if (product.message && product.errors) {
          showErrorDialog('Encountered the following error: <br/>' + getErrorMessage(product.errors));
        } else {
          fetchAndRefreshTable();
        }
      },
      error: function() {
        $('#add-new').modal('toggle');
        showErrorDialog('There was an error adding product!');
      }
    });
  });

  $('#add-new-product').click(function() {
    $('#add-modal-heading').text('Add Product');
    $('#product-asin').val('');
    $('#product-data').val('');
    $('#product-owner').val('');

    $('#add-new').modal('toggle');
  });

  fetchAndRefreshTable();
});