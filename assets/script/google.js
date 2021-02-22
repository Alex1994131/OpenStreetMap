$(document).ready(function() {
	var map;
	var infowindow;
	var myPlace = {lat: -23.698946, lng: 133.889220 };
	var radius = 200;
	var maxrows = 100;

	var radius_mile = (radius/1000).toFixed(2);

	var street_datum = new Array();
	var street_index = new Array();

	$("#latitude").val(myPlace.lat);
	$("#longitude").val(myPlace.lng);
	$("#radius").val(radius);
	$("#maxrows").val(maxrows);

	generate_table();

	var mapOptions = {
        center: [-23.698946, 133.889220],
        zoom: 17
    } 
    
    var map = new L.map('map', mapOptions);
    var layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    map.addLayer(layer);

    var marker=L.marker([-23.698946, 133.889220]).addTo(map);
	var popup = L.popup();

	var circle = L.circle([-23.698946, 133.889220], radius, {
		    color: 'red',
		    fillColor: '#f03',
		    fillOpacity: 0.2
	}).addTo(map);

	circle.on('mousedown', function () {
        map.on('mousemove', function (e) {
            circle.setLatLng(e.latlng);
            marker.setLatLng(e.latlng);

           	myPlace = e.latlng;
           	$("#latitude").val(myPlace.lat);
			$("#longitude").val(myPlace.lng);
        });
    });

    map.on('mouseup', function(){
        map.removeEventListener('mousemove');
    })

	$("#radius").on('change', function() {
		radius = $(this).val();
		radius = parseFloat(radius);
		circle.setRadius(radius);
	});

	$("#get_info").on('click', function() {
		var latitude = $('#latitude').val();
		var longitude = $('#longitude').val();
		radius = $("#radius").val();

		radius = parseInt(radius);
		maxrows = $("#maxrows").val();
		maxrows = parseInt(maxrows);

		radius_mile = (radius/1000).toFixed(2);
		

		myPlace = {
			lat: parseFloat(latitude), 
			lng: parseFloat(longitude)
		};

		circle.setLatLng(myPlace);
        marker.setLatLng(myPlace);

        map.setView(circle.getLatLng(),map.getZoom(),{animate: false})

		generate_table();
	});
	
	function generate_table() {

		$("#street_contents").empty();
		$('.progress_text').show()
		$(".progress_bar").html('<div class="spinner-border text-primary"></div>');

		var url = 'http://api.geonames.org/findNearbyStreetsOSM';
		var flag = $("#cloest_way_id").is(':checked');

		console.log(myPlace);
		
		$.ajax({
			type: "POST",
	        headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				"accept": "application/json"
	        },
	        data: {
	        	lat: myPlace.lat,
	        	lng: myPlace.lng,
	        	username: 'marc',
	        	radius: radius_mile,
	        	maxRows: maxrows
	        },
			url: url,
			success: function(response) {
				$('.progress_bar').empty();
	            $('.progress_text').hide();

				response = response.streetSegment;



				street_datum = new Array();
				street_index = new Array();
				var html = '';

				if(response != null) {
					if(flag == false) {
						for(var i = 0; i<response.length; i++) {
							var position = response[i].line;

							position = position.split(',').pop();
							var lat = position.split(' ')[0];
							var lng = position.split(' ')[1];

							var distance = response[i].distance * 1000;
							distance = distance.toFixed(0);

							html += '<div class="col-md-2"><div class="street_info">'+
									'<p class="street_distance">'+ distance +'M</p>'+
									'<div class="street_name">'+ response[i].name +'</div>'+
									'</div></div>';
						}

						$("#street_contents").html(html);	
					}
					else {
						for(var i = 0; i<response.length; i++) {
							if(street_index.indexOf(response[i].name) != -1) {
								continue;
							}
							else {
								street_index.push(response[i].name);
								street_datum.push(response[i]);
							}
						}

						for(var i=0; i<street_datum.length; i++) {
							var position = street_datum[i].line;

							position = position.split(',').pop();
							var lat = position.split(' ')[0];
							var lng = position.split(' ')[1];

							var distance = street_datum[i].distance * 1000;
							distance = distance.toFixed(0);

							html += '<div class="col-md-2"><div class="street_info">'+
									'<p class="street_distance">'+ distance +'M</p>'+
									'<div class="street_name">'+ street_datum[i].name +'</div>'+
									'</div></div>';
						}

						$("#street_contents").html(html);
					}
				}
			}
		}).done(function (response) {
			
		});
	}

	// function onMapClick(e) {
	// 	map.removeLayer(marker);
	// 	popup.setLatLng(e.latlng)
	//         .setContent("You clicked the map at " + e.latlng.toString())
	//         .openOn(map);

	//     marker=L.marker(e.latlng).addTo(map);
	// }

	//map.on('mouse', onMapClick);

	// var service;

	// function initMap() {
	// 	map = new google.maps.Map(document.getElementById('map'), {
      //      center: myPlace,
      //      zoom: 15
     	// });

	// 	$("#latitude").val(myPlace.lat);
	// 	$("#longitude").val(myPlace.lng);
	// 	$("#radius").val(radius);

	// 	getNearByPlaces(myPlace, radius);
	// }

	// function rad(x) {
	//   return x * Math.PI / 180;
	// };

	// function getNearByPlaces(pos, radius) {
	// 	let request = {
	//         location: pos,
	//         //rankBy: google.maps.places.RankBy.DISTANCE,
	//         radius : radius,
 //            type : [ 'restaurant' ]
 //      	};

	//     service = new google.maps.places.PlacesService(map);
	//     service.nearbySearch(request, nearbyCallback);
	// }

	// function nearbyCallback(results, status) {

	//     var html = '';
	//     $('#table_body').empty();

	//     if (status === google.maps.places.PlacesServiceStatus.OK) {
	//         for (var i = 0; i < results.length; i++) {

	// 			service.getDetails({
	// 	            placeId: results[i].place_id
	// 	        }, function (place, status) {
	// 	            if (status == google.maps.places.PlacesServiceStatus.OK) {
		             

	// 	            	var R = 6378137; // Earth’s mean radius in meter
	// 					var dLat = rad(place.geometry.location.lat() - myPlace.lat);
	// 					var dLong = rad(place.geometry.location.lng() - myPlace.lng);

	// 					var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(place.geometry.location.lat())) * Math.cos(rad(myPlace.lat)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
	// 					var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	// 					var d = R * c;

	// 					d = d.toFixed(0);


	// 	                var street_num = place.formatted_address;
	// 	                street_num = street_num.split(', ')[0];

	// 	                var html = '<tr><td>'+ street_num +'</td><td>'+place.geometry.location.lat()+'</td><td>'+ place.geometry.location.lng() +'</td><td>'+ d +'</td></tr>';	           
	// 	                $("#table_body").append(html);
	// 	            }
	// 	        });
	//         }
	//     }
	// }

	// function display_position() {
	// 	var latitude = $('#latitude').val();
	// 	var longitude = $('#longitude').val();
	// 	radius = $("#radius").val();

	// 	myPlace = {
	// 		lat: parseFloat(latitude), 
	// 		lng: parseFloat(longitude)
	// 	};

	// 	initMap();
	// }
});