(function () {

	"use strict";
	
	// defaults
	
	var HOME_LATLNG = L.latLng(29.534452, -40.843534);
	var HOME_LEVEL = 3;
	var MAX_ZOOM = 12;
	var MIN_ZOOM = 2;
	var SCALE_DENOMINATOR = 15053027;
	
	var _map;
	var _marker;
	var _records;
	var _prior = [];
	var _selected;
	
	$(document).ready(function() {

		// replace defaults with config variables if present
		
		if (window.HOME_LATLNG) {HOME_LATLNG = L.latLng(window.HOME_LATLNG.split(","));}
		if (window.HOME_LEVEL) {HOME_LEVEL = parseInt(window.HOME_LEVEL);}
		if (window.MAX_ZOOM) {MAX_ZOOM = parseInt(window.MAX_ZOOM);}
		if (window.MIN_ZOOM) {MIN_ZOOM = parseInt(window.MIN_ZOOM);} 
		if (window.SCALE_DENOMINATOR) {
			SCALE_DENOMINATOR = parseInt(window.SCALE_DENOMINATOR);
		}

		new SocialButtonBar();
		
		_map = new L.Map(
			"map", 
			{
				center: HOME_LATLNG,
				zoom: HOME_LEVEL,
				zoomControl: false, 
				attributionControl: false, 
				maxZoom: MAX_ZOOM, minZoom: MIN_ZOOM, 
				closePopupOnClick: false,
				worldCopyJump: true
			}
		)
			.addControl(L.control.attribution({position: 'topleft'}))
			.on("moveend", onMoveEnd);
			
		if (!L.Browser.mobile) {
			_map.addControl(L.control.zoom({position: "topright"}));
		}
		
		// toggle attribution visibility depending on window size

		function evalAttribution()
		{
			if ($(window).width() <= 800) {
				$('.leaflet-control-attribution').hide();
			} else {
				$('.leaflet-control-attribution').show();
			}
		}
		
		evalAttribution();
		
		$( window ).resize(function() {evalAttribution();});
		
		if (!L.Browser.mobile) {
			L.easyButton({
				states:[
					{
						icon: "fa fa-home",
						onClick: function(btn, map){_map.setView(HOME_LATLNG, HOME_LEVEL);},
						title: "Full extent"
					}
				],
				position: "topright"
			}).addTo(_map);
		}

		
		Papa.parse(
			"data", 
			{
				header: true,
				download: true,
				complete: function(data) {
					_records = $.map(
						data.data, 
						function(value, index){return new Record(value, index);}
					);
					finish();
				}
			}
		);

		function finish()
		{
			next();
			processPosition();
			$("#prompt > button").click(
				function(){$("html body").addClass("hint");_map.invalidateSize();}
			);
			$("button#button-next").click(function(){next();});
			$("html body").keydown(onKeyDown);
			$("#intro button").click(function(){$("#intro").hide();});
			
			/* 	hooks so that custom finish-up code can execute (minimally 
				to add the basemap)	*/

			window._map = _map;
			if (window.onFinalFinish) {
				window.onFinalFinish();		
			}
			
		}		


	});

	/***************************************************************************
	******************************** EVENTS ************************************
	***************************************************************************/

	function onKeyDown(event) {
		/* next on ctrl-alt-n */
		if (event.ctrlKey && event.altKey && event.which === 78 && _records.length) 
		{
			next();
		}
	}

	function onMoveEnd()
	{
		if (!$("html body").hasClass("reveal")) {
			processPosition();
		}
	}

	/***************************************************************************
	******************************** FUNCTIONS *********************************
	***************************************************************************/
	function next()
	{
		if (_records.length)
		{
			if (_selected) {
				_prior.push(_selected);
				_map.flyTo(_selected.getLatLng(), HOME_LEVEL);
			}
			_selected = _records.shift();
			reset();
		} else {
			// we have reached the end.
		}
	}
	
	function reset()
	{
		$("#prompt").removeClass("fadeIn");		
		$("#photo-credit").html(_selected.getImageAttribution());
		$("#prompt > div:nth-of-type(1)").html(_selected.getText());
		$("#hint").html(_selected.getHint());
		$("#exclamation > div:nth-of-type(1)").html(_selected.getExclamation());
		$("#portrait").css("background-image", "url('"+_selected.getImageURL()+"')");
		$("#message-panel").css("background-image", "url('"+_selected.getImageURL()+"')");
		$("html body").removeClass("reveal hint");
		if(_marker){_marker.remove();}
		_map.invalidateSize();
		processPosition();
		$("#prompt").addClass("fadeIn");
	}
	
	function processPosition()
	{
				
		var center = _map.getCenter();
		var distance = center.distanceTo(_selected.getLatLng());
		
		var green = parseInt(255*(1-distance/SCALE_DENOMINATOR));
		var red = parseInt(255*(distance/SCALE_DENOMINATOR));
		$("#square").css("background-color", "rgba("+red+","+green+",0,0.6)");
		
		if (boxToExtent().contains(_selected.getLatLng())) {
			if (_map.getZoom() >= _selected.getZoom()) {
				_marker = L.marker(_selected.getLatLng())
					.addTo(_map)
					.bindPopup(_selected.getTitle(),{closeButton: false})
					.openPopup();
				$("#square").removeClass("blinking");
				$("html body").addClass("reveal");
				if (_records.length) {
					$("#exclamation button").show();
					$("#exclamation button").focus();
					$("#exclamation a#certificate").hide();
				} else {
					$("#exclamation button").hide();
					$("#exclamation a#certificate").show();
					$("#exclamation a#certificate").focus();					
				}
			} else {
				$("#square").addClass("blinking");
				setTimeout(
					function(){
						_map.flyTo(_selected.getLatLng(), _selected.getZoom());
					},
					1000
				);
			}
		}
		
	}
	
	function boxToExtent()
	{
		var ll1 = _map.containerPointToLatLng(
			[
				$("#square").position().left-$("#square").width()/2, 
				$("#square").position().top-$("#square").height()/2
			]
		);
		var ll2 = _map.containerPointToLatLng(
			[
				$("#square").position().left+$("#square").width()/2, 
				$("#square").position().top+$("#square").height()/2
			]
		);
		return L.latLngBounds(ll1,ll2);
	}

})();