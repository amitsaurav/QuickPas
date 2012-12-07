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
        tableBody += '<button class="btn btn-success btn-small edit-asin">View/Edit</button>&nbsp;';
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

  var handleActionResponse= function (response) {
    $('.modal').modal('hide');
    if (response.msg && !response.success) {
      showErrorDialog(response.msg);
    }
    fetchAndRefreshTable();
  };

  var showErrorDialog = function(msg) {
    $('#error-message').html(msg);
    $('#on-error').modal('toggle');
  };

  var showEditDialog = function(product) {
    $('#add-modal-heading').text('Edit Product');
    $('#product-asin').val(product.asin).attr('readonly', 'true');
    $('#product-data').val(product.data);
    $('#product-owner').val(product.owner);
    $('#create').unbind('click').click(updateAsin);
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
      success: handleActionResponse,
      error: handleActionResponse
    });
  };

  var updateAsin = function () {
    var asin = $('#product-asin').val();
    $.ajax({
      url: '/products/' + asin,
      type: 'PUT',
      data: {
        data: $('#product-data').val(),
        owner: $('#product-owner').val()
      },
      success: handleActionResponse,
      error: handleActionResponse
    });
  };

  var addAsin = function () {
    var asin = $('#product-asin').val();
    $.ajax({
      url: '/products',
      type: 'POST',
      data: {
        asin: asin,
        data: $('#product-data').val(),
        owner: $('#product-owner').val()
      },
      success: handleActionResponse,
      error: handleActionResponse
    });
  };

  $('#add-new-product').click(function() {
    $('#add-modal-heading').text('Add Product');
    $('#product-asin').val('').removeAttr('readonly');
    $('#product-data').val('');
    $('#product-owner').val('');
    $('#create').unbind('click').click(addAsin);
    $('#add-new').modal('toggle');
  });

  fetchAndRefreshTable();
});