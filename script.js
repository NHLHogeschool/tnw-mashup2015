$(function(){
	var map = null;
	var geocoder = new google.maps.Geocoder();
	var venuesAdded = 0;
	var totalVenues = 0;
	window.eventsByVenue = {};

	function initialize() {
		var mapOptions = {
			center: { lat: 53.1995315, lng: 5.8108047},
			zoom: 14
		};
		map = new google.maps.Map(document.getElementById('map'), mapOptions);

		addVenues();
	}

	google.maps.event.addDomListener(window, 'load', initialize);

	function addVenues() {
		$.getJSON('venues.json', function(venues){
			totalVenues = venues.length;

			$.each(venues, function(idx){
				eventsByVenue[this['Organizer'].toUpperCase()] = {events: []};

				address = this['Straat'] + ' ' + this['Huisnr'] + ', ' + this['Woonplaats'];
				(function(venue){
					geocoder.geocode( { 'address': address }, function(results, status) {
						if (status == google.maps.GeocoderStatus.OK) {
							ll = results[0].geometry.location;
							marker = new google.maps.Marker(
								{
									position: ll,
									map: map,
									title: venue['Organizer'],
									animation: google.maps.Animation.DROP
								}
							);
							google.maps.event.addListener(marker, 'click', function() {
								renderEvents(venue['Organizer']);
							});
							eventsByVenue[venue['Organizer'].toUpperCase()].marker = marker;
						}
						venuesAdded += 1;
					})
				})(this);
			})

			addEvents();
		})
	}

	function addEvents() {
		if (totalVenues != venuesAdded) {
			setTimeout(addEvents, 500);
		} else {
			$.getJSON('events.json', function(events){
				$.each(events, function(idx){
					var venueKey = this['Organizer'].toUpperCase();
					if (Object.keys(eventsByVenue).indexOf(venueKey) > -1) {
						eventsByVenue[venueKey].events.push(this);
					}
				})
			})
		}
	}

	function renderEvents(title) {
		$('aside').remove();

		$sidebar = $('<aside/>').html('');
		$('body').append($sidebar);

		$sidebar.css({'margin-left': -$sidebar.width()}).animate({'margin-left': 0})

		events = eventsByVenue[title.toUpperCase()].events;
		$sidebar.append($('<h2/>').html('Evenementen in ' + title));
		$.each(events, function(idx){
			$event = $('<p/>');
			$event.append($('<h3/>').html(this['Title']));
			$event.append($('<time/>').html(this['BeginDateUtc']));
			$sidebar.append($event);
		});
	}
})