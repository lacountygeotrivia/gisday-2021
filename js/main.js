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
		
		

})();
