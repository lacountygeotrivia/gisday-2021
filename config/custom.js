window.onFinalFinish = function()
{
	window._map
		.addLayer(L.esri.basemapLayer("DarkGray"))
		.addLayer(L.esri.basemapLayer("DarkGrayLabels"));
	$(".banner h1#title").text("LA County GIS Day Treasure Hunt");
	$(".banner a#logo img").attr("src", "config/logo.png");
	$("a#certificate").attr("href", "https://forms.office.com/g/8WPvjR3KcA");
}