$( document ).ready(function() {
	var $container = $('#container').imagesLoaded(function() {
		$container.isotope({
		itemSelector: '.dist-box',
		layoutMode: 'masonry'
	});
	});
	//init
	$('#filters').on( 'click', 'button', function(e) {
		e.preventDefault;
		$("html, body").animate({ scrollTop: $('#filters').offset().top });
		var filterValue = $(this).attr('data-filter');
		$container.isotope({ filter: filterValue });
		$('button.active').removeClass('active');
		$(this).addClass('active');
	});
});

// Set Root Folder
var root = "img/";


//Helper Functions

function getElement(element, name) {
	if (element !== undefined) {
		return '<p><strong>'+name+': </strong>' + element + '</p>'
	} else {
		return ''
	}
}



// Google Maps

	// Markers 
	var gmarkers = [];
	var locations = (function () {
    var json = null;
    	$.ajax({
	        'async': false,
	        'global': true,
	        'url': 'js/data.json',
	        'dataType': "json",
	        'success': function (data) {
	            json = data;
	        }
   		});
    return json;
	})();

	function setMarkers(map, locations) {

		var imagesSmall = {
            "producer" : root + "producer.png",
            "distributor" : root + "distributor.png",
            "cobb" : root + "cobbmarker.png",
        }
        var imagesLarge = {
        	"producer" : root + "producer-large.png",
            "distributor" : root + "distributor-large.png",
            "cobb" : root + "cobbmarker-large.png",
        }

		for (var i = 0, g = locations.length; i < g; i++) {
			facility = locations[i];
			myLatLng = new google.maps.LatLng(facility['lat'], facility['lng']);
			marker = new google.maps.Marker({
				position: myLatLng,
				map: map,
				icon: imagesSmall[facility.category],
				image: facility.img,
				title: facility.title,
				zIndex: facility.zIndex,
				address: facility.address,
				email: facility.email,
				category: facility.category,
				website: facility.website,
				tel: facility.tel,
				fax: facility.fax
			});
			marker.website = facility.website;
			marker.category = facility.category;
			gmarkers.push(marker);
		}

		// Change Marker Icon Size Based on Zoom Level

		google.maps.event.addListener(map, 'zoom_changed', function() {

		var size;
		if(map.getZoom() <= 6) {
		    size = "small"
		    }
		    else {
		   	size = "large"
		}

		    for(i=0; i< gmarkers.length; i++ ) {
		    	if(size == "small") {
		    		gmarkers[i].setIcon(imagesSmall[gmarkers[i].category])
		    	}
		    	if(size == "large") {
		    		gmarkers[i].setIcon(imagesLarge[gmarkers[i].category])
		    	}
		    }
		});



		var mcStyles = [
		{
			textColor: 'white',
			textSize: 14,
			url: 'img/marker-icon.png',
			height:50,
			width:50,
		
		},
		{
			textColor: 'white',
			url: 'img/marker-icon.png',
			height:50,
			width:50,
		},
		{
			textColor: 'white',
			url: 'img/marker-icon.png',
			height:50,
			width:50,
		}
		];
		var mcOptions = {
			gridSize: 35, 
			maxZoom: 15,
			styles: mcStyles
		};
		var markerCluster = new MarkerClusterer(map, gmarkers, mcOptions);
		markerCluster.setIgnoreHidden(true);

		// Info Windows	
		infowindow = new google.maps.InfoWindow({
			maxWidth:250
		});
		for (var i = 0; i < gmarkers.length; i++) {
			var marker = gmarkers[i];
			google.maps.event.addListener(marker, 'click', function () {
				if(this.website !== undefined) {
					var website = '<a href="' +this.website + '">'+this.website+'</a>';
				} else {
					var website = "N/A";
				}
				var email = getElement(this.email, "Email");
				var fax = getElement(this.fax, "Fax");
				content = 
					'<div class="info-window">'+
					'<img class="logo" src="' + root + this.image + '" />' +
					'<h5>' + this.title + '</h5>'+
					'<p>' + this.address + '</p>'+
					'<p><strong>Tel: </strong>' + this.tel + '</p>' +
					'<p><strong>Website: </strong>' + website + '</p>'+
					email+
					fax+
					'</div>';
				infowindow.setContent(content);
				infowindow.open(map, this);
			});
		};

	//Show the Markers
	function show(category) {
      for (var i=0; i<gmarkers.length; i++) {
        if (gmarkers[i].category === category) {
          gmarkers[i].setVisible(true);
        }
      }
      // Check the Checkbox
      $('#'+category+'box').prop('checked', true);
    }

    // Hide the Markers
    function hide(category) {
        for (var i=0; i<gmarkers.length; i++) {
        if (gmarkers[i].category === category) {
          gmarkers[i].setVisible(false);
        }
      }
      // Uncheck the Checkbox
      document.getElementById(category+"box").checked = false;
      // Close Info Window
      infowindow.close();
    }

    // Toggle On / Off 
    function boxclick(box,category) {
      if (box.checked) {
        show(category);
      } else {
        hide(category);
      }
    }

    // Redraw Markers after Filter Event
    $(document).click(function() {
    	markerCluster.repaint();
    }) 

    $("#map-filters").on('click', 'input', function() {
    	infowindow.close();
      	boxclick(this, $(this).attr('data-filter'));
    });

    // Show all markers by default  
	show("producer");
    show("distributor");
    show("cobb")


// Zoom on Address Click

function addMarkerListener(marker, index, zoomLevel) {
        google.maps.event.addListener(marker, 'click', function(event) {
          zoomIn(index, zoomLevel);
        });
}

 function zoomIn(index, zoomLevel) {
        map.setCenter(gmarkers[index].getPosition());
        map.setZoom(zoomLevel);
 }

 $("a.address").click(function(e) {
 	var id = this.id;
 	e.preventDefault;
 	google.maps.event.trigger(gmarkers[id], "click");
 	$("html, body").animate({ scrollTop: $('#map-filters').offset().top }, 200);	
 	show("producer");
 	show("distributor");
 	show("cobb");
 	$('input[type="checkbox"]').prop('checked', true);
 	zoomIn(id, 11);
 	
 })

};

// Initialize Google Maps

var map;

function initialize() {
        
    var mapOptions = {
        center: new google.maps.LatLng(30, 21.28),
        zoom: 2,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        scrollwheel: true,
        draggable: true,
        minZoom: 2,
        streetViewControl: false
    }
    map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    var infoWindow = new google.maps.InfoWindow();
      	
    setMarkers(map, locations);

    google.maps.event.addListener(map, 'click', function() {
	infowindow.close();
	});

	var styles = [
	  {
	    "featureType": "landscape",
	    "stylers": [
	      { "color": "#707070" }
	    ]
	  },{
	    "featureType": "water",
	    "stylers": [
	      { "color": "#8db5ce" }
	    ]
	  },{
	    "featureType": "poi",
	    "stylers": [
	      { "color": "#ababaa" },
	      { "visibility": "off" }
	    ]
	  }
	];

	map.setOptions({styles: styles});
    
    function draggable() {
	    if(map.getZoom() == 2) {
	    	map.setOptions({ center: new google.maps.LatLng(30, 21.28) })
	    } else {
	    	map.setOptions({ draggable: true })
	    }
	}
	google.maps.event.addListener(map, 'zoom_changed', draggable);
	
	function setCenter() {
		if($(window).width() <= 768) 
		{
			map.setOptions({ center: new google.maps.LatLng(39.833333, -98.583333)})
		}
		else {
			map.setOptions({ center: new google.maps.latLng(30, 21.28) })
		}
	}
	setCenter();
}

google.maps.event.addDomListener(window, 'load', initialize);


// Load Box Content from JSON

function getWebsite() {
	website = (el.website !== undefined) ? '<a href="http://' + el.website + '">' + el.website + '</a>' : "N/A";
}

var facilities = document.querySelectorAll(".distributors")[0];
function setDefaultImage () {
	if (locations[i].img == undefined) {
		locations[i].img = "cobb_logo.svg";
	} else {
		return locations[i].img
	}
		
};

var getCorporate = function() {
	if(el.category == "cobb") {
		return "Corporate"
	}
	else {
		return el.category.charAt(0).toUpperCase() + el.category.slice(1)
	}
}

for (var i=0, g = locations.length; i<g; i++) {
	setDefaultImage();
	var div = document.createElement("div");
	var el = locations[i];
	getWebsite();
	div.setAttribute("class", "four columns dist-box " + el.district + ' ' + el.category);
	facilities.appendChild(div);
	var email = getElement(el.email, "Email");
	var fax = getElement(el.fax, "Fax");
	var content = 
		'<div class="triangle">' + getCorporate() + '</div>' +
		'<img class="logo" src="' + root + el.img + '" />' +
		'<h5>' + el.title + '</h5>'+
		'<a class="address" id="'+i+'">' + el.address + '</a>'+
		'<p><strong>Tel: </strong>' + el.tel + '</p>' +
		'<p><strong>Website: </strong>' + website + '</p>' +
		email+
		fax + 
		'<div class="triangle-two">' + locations[i].category.charAt(0).toUpperCase() + locations[i].category.slice(1) + '</div>';
	$(div).append(content);
};
