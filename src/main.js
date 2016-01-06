$(document).ready(function(){
	var mosaic = $('.mosaic').mosaicflow();
	
	console.log(window.location);
	var id = window.location.pathname.split('/')[1];
	loadKollage(id);

	function loadKollage (id) {
		if (!id) id = 'random';

		$.get("api/kollages/" + id, function( data ) {
			addKollageToMosaic(data);
			if (id == 'random') window.history.pushState(data, "Kollage", "/" + data._id)
		});
	}

	function addKollageToMosaic (kollage) {
		clearMosaic();
		$.each(kollage.albums, function (key, album) {
			$.each(album.images, function (imagekey, image) {
				mosaic.mosaicflow('add', $('<div class="mosaicflow__item"><i class="fa fa-close deleteImage hidden pointer show-edit" data-id="' + album._id + '" data-imageId="' + image._id +  '" /><img src="'+image.link+'"  width="'+image.width+'" height="'+image.height+'" alt="'+album.title+'" /></div">'));
			});
		})
		window.id = kollage._id;
	}

	function clearMosaic () {
		$('.mosaicflow__item').remove();
	}

	function enableMode (mode) {
		$(".show-" + mode).show();
		$(".hide-" + mode).hide();
	}
	function disableMode (mode) {
		$(".show-" + mode).hide();
		$(".hide-" + mode).show();
	}

	$(".mosaic").on('click', 'img', function (event) {
		event.preventDefault();

		window.originalScroll = $(window).scrollTop();

		enableMode("fullsize");
		$(".fullsizeImage").html($(this).clone());
	})

	$(".mosaic").on('click', '.deleteImage', function (event) {
		event.preventDefault();
		var elem = this;

		$.ajax({
		    url: '/api/albums/' + $(this).attr('data-id') + '/images/' + $(this).attr('data-imageId'),
		    type: 'DELETE',
		    success: function(result) {
		    	mosaic.mosaicflow('remove', elem.parent());
		    }
		});
	})

	$(".closeFullSize").click(function (event) {
		event.preventDefault();
		
		disableMode("fullsize")
		$(window).scrollTop(window.originalScroll);
	})

	$("#new").click(function (event) {
		event.preventDefault();

		var newKollage = $.post('/api/kollages', {});
		newKollage.done(function (data) {
			addKollageToMosaic(data);
			enableMode("edit");
			window.history.pushState(data, "Kollage", "/" + data._id)
		})
	})

	$("#share").click(function (event) {
		event.preventDefault();
		enableMode("share");
	})

	$("#sharebuttons a").click(function (event) {
		disableMode("share");
	})

	$("#edit").click(function (event) {
		event.preventDefault();

		enableMode("edit");
	})

	$("#doneEdit").click(function (event) {
		event.preventDefault();

		disableMode("edit");
	})

	$("#addLink").submit(function( event ) {
	 
	  // Stop form from submitting normally
	  event.preventDefault();
	 
	  // Get some values from elements on the page:
	  var $form = $( this ),
		albumUrl = $form.find( "input[name='url']" ).val();
	 
	  // Send the data using post
	  var posting = $.post( '/api/albums', { url: albumUrl, kollageId: window.id } );
	 
	  // Put the results in a div
	  posting.done(function (album) {
	    $.each(album.images, function (imagekey, image) {
			mosaic.mosaicflow('add', $('<div class="mosaicflow__item"><img src="'+image.link+'"  width="'+image.width+'" height="'+image.height+'" alt="'+album.title+'" /></div">'));
		});
	  });
	});
})