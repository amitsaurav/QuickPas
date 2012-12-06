$(document).ready(function() {

  var getTruncatedJson = function(productJson) {
    var jsonLengthToDisplay = 25;
    if (productJson.length <= jsonLengthToDisplay) {
      return productJson;
    } else {
      return productJson.substring(0, jsonLengthToDisplay) + '...';
    }
  };

  var fetchAndRefreshTable = function() {
    // List products
    $.get('/products', function(data) {
      var tableBody = '';
      for (var i=0; i<data.length; i++) {
        tableBody += '<tr>';
        tableBody += '<td>' + data[i].asin + '</td>';
        tableBody += '<td>' + getTruncatedJson(data[i].data) + '</td>';
        tableBody += '<td>' + data[i].modified + '</td>';
        tableBody += '<td>' + data[i].owner + '</td>';
        tableBody += '<td>';
        tableBody += '<button class="btn btn-primary btn-small view-asin">View JSON</button>&nbsp;';
        tableBody += '<button class="btn btn-success btn-small edit-asin">Edit</button>&nbsp;';
        tableBody += '<button class="btn btn-danger btn-small delete-asin">Delete</button></td>';
        tableBody += '</tr>';
      }

      if (tableBody === '') {
        $('#table-body').empty().append('<tr><td>...</td><td>...</td><td>...</td><td>...</td><td>...</td></tr>');
      } else {
        $('#table-body').empty().append(tableBody);
        $('.view-asin').click(viewAsin);
        $('.edit-asin').click(editAsin);
        $('.delete-asin').click(deleteAsin);
      }
    });
  };

  var handleActionResponse= function (response) {
    if (response.msg) {
      showErrorDialog(response.msg);
    }
    fetchAndRefreshTable();
  };

  var showErrorDialog = function(msg, heading) {
    if (typeof heading !== undefined) {
      $('#error-heading').html(heading);
    } else {
      $('#error-heading').html('Error');
    }
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
  
  var viewAsin = function () {
    var asin = $(this).parent().siblings(":first").text();
    $.ajax({
      type: 'GET',
      url: '/products/' + asin,
      success: function(data) {
        showErrorDialog(data.data, 'JSON');
      },
      error: showErrorDialog
    });
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
      success: handleActionResponse,
      error: handleActionResponse
    });
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
        handleActionResponse(product);
      },
      error: function(response) {
        $('#add-new').modal('toggle');
        handleActionResponse(response);
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