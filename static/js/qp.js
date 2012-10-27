$(document).ready(function() {
	// Add new
	$('#create').click(function() {
		$.post('/products', {
			asin: $('#product-asin').val(),
			data: $('#product-data').val()
		}, function() {
			$('#add-new').modal('toggle');
			fetchAndRefreshTable();
		});
	});

	var fetchAndRefreshTable = function() {
		// List products
		$.get('/products', function(data) {
			var tableBody = '';
			for (var i=0; i<data.length; i++) {
				tableBody += '<tr>';
				tableBody += '<td>' + data[i].asin + '</td>';
				tableBody += '<td>' + data[i].data + '</td>'; // truncate and add ellipses
				tableBody += '<td>' + data[i].modified + '</td>';
				tableBody += '<td>';
				tableBody += '<button class="btn btn-success btn-small edit-asin">Edit</button>&nbsp;';
				tableBody += '<button class="btn btn-danger btn-small delete-asin">Delete</button></td>';
				tableBody += '</tr>';
			}

			if (tableBody === '') {
				$('#table-body').empty().append('<tr><td>...</td><td>...</td><td>...</td><td>...</td></tr>');
			} else {
            	$('#table-body').empty().append(tableBody);
			}
		});
	};

	fetchAndRefreshTable();
});