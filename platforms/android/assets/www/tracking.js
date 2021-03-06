// Author UP693500 Web Technologies
// Improves on Logan Mortimer 2012 article https://tutsplus.com/authors/logan-mortimer

var route_id = '';      // Name/ID of the route
var watch_id = null;    // ID of the geolocation
var tracking_data = []; // Array containing GPS position objects

$("#startTracking_start").live('click', function(){

    // Enable geolocation plugin and begin watching position
    watch_id = navigator.geolocation.watchPosition(

        // sucessful watch
        function(position){
            tracking_data.push(position);
        },

        // Error log if watchPosition fails
        function(error){
            console.log(error);
        },

        // Set the watch delay (3 seconds) enables highest accuracy option
        { frequency: 3000, enableHighAccuracy: true });

    route_id = $("#route_id").val();

    $("#route_id").hide();
    // Displays "Tracking route x"
    $("#startTracking_status").html("Tracking route: <strong>" + route_id + "</strong>");
});
//Needed to store GeoPosition as a JSON array
function cloneAsObject(obj) {
    if (obj === null || !(obj instanceof Object)) {
        return obj;
    }
    var temp = (obj instanceof Array) ? [] : {};
    // ReSharper disable once MissingHasOwnPropertyInForeach
    for (var key in obj) {
        temp[key] = cloneAsObject(obj[key]);
    }
    return temp;
}

$("#startTracking_stop").live('click', function(){

  // Stop tracking the user
  navigator.geolocation.clearWatch(watch_id);

  // Save the tracking data
  window.localStorage.setItem(route_id, JSON.stringify(cloneAsObject(tracking_data)));

  //displays stopped tracking and updates the view.
  $("#startTracking_status").html("Stopped tracking route: <strong>" + route_id + "</strong>");

});

// Clear local storage for testing
$("#home_clearstorage_button").live('click', function(){
    window.localStorage.clear();
});
 // Dummy data to show theory
$("#home_seedgps_button").live('click', function(){
    window.localStorage.setItem('Sample block','[{"timestamp":1335700800000,"coords":{"heading":null,"altitude":null,"longitude":-1.806859,"accuracy":0,"latitude":50.731435,"speed":null,"altitudeAccuracy":null}},{"timestamp":1335800805000,"coords":{"heading":null,"altitude":null,"longitude":-1.808243,"accuracy":0,"latitude":50.732209,"speed":null,"altitudeAccuracy":null}},{"timestamp":1335700808000,"coords":{"heading":null,"altitude":null,"longitude":-1.809574,"accuracy":0,"latitude":50.731157,"speed":null,"altitudeAccuracy":null}},{"timestamp":1335900810000,"coords":{"heading":null,"altitude":null,"longitude":-1.807535,"accuracy":0,"latitude":50.730043,"speed":null,"altitudeAccuracy":null}},{"timestamp":1336000812000,"coords":{"heading":null,"altitude":null,"longitude":-1.806194,"accuracy":0,"latitude":50.731062,"speed":null,"altitudeAccuracy":null}},{"timestamp":1335700815000,"coords":{"heading":null,"altitude":null,"longitude":-1.806859,"accuracy":0,"latitude":50.731435,"speed":null,"altitudeAccuracy":null}}]');

});

// When the user views the history page
$('#history').live('pageshow', function () {

  // Count the number of entries in localStorage and display this information to the user
  tracks_recorded = window.localStorage.length;
  $("#tracks_recorded").html("<strong>" + tracks_recorded + "</strong> Route(s) recorded");

  // Empty the list of recorded tracks
  $("#history_tracklist").empty();

  // Iterate over all of the recorded tracks, populating the list
  for(i=0; i<tracks_recorded; i++){

    $("#history_tracklist").append("<li><a href='#track_info' data-ajax='false'>" + window.localStorage.key(i) + "</a></li>");
  }

  // Tell jQueryMobile to refresh the list
  $("#history_tracklist").listview('refresh');

});

$("#history_tracklist li a").live('click', function(){

  $("#track_info").attr("route_id", $(this).text());

});

// When the user views the Track Info page
$('#track_info').live('pageshow', function(){

  // Find the route_id of the route they are viewing
  var key = $(this).attr("route_id");

  // Update the Track Info page header to the route_id
  $("#track_info div[data-role=header] h1").text(key);

  // Get all the GPS data for the specific route
  var data = window.localStorage.getItem(key);

  // Turn the stringified GPS data back into a JS object
  data = JSON.parse(data);

function gps_distance(lat1, lon1, lat2, lon2)
{
  // http://www.movable-type.co.uk/scripts/latlong.html
    var R = 6371; // km
    var dLat = (lat2-lat1) * (Math.PI / 180);
    var dLon = (lon2-lon1) * (Math.PI / 180);
    var lat1 = lat1 * (Math.PI / 180);
    var lat2 = lat2 * (Math.PI / 180);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;

    return d;
}

// Calculate the total distance travelled
total_km = 0;

for(i = 0; i < data.length; i++){

    if(i == (data.length - 1)){
        break;
    }

    total_km += gps_distance(data[i].coords.latitude, data[i].coords.longitude, data[i+1].coords.latitude, data[i+1].coords.longitude);
}

total_km_rounded = total_km.toFixed(2);

// Calculate the total time taken for the track
start_time = new Date(data[0].timestamp).getTime();
end_time = new Date(data[data.length-1].timestamp).getTime();

total_time_ms = end_time - start_time;
total_time_s = total_time_ms / 1000;

final_time_m = Math.floor(total_time_s / 1000);
final_time_s = total_time_s - (final_time_m * 60);

// Display total distance and time
$("#track_info_info").html('Travelled <strong>' + total_km_rounded + '</strong> km in <strong>' + final_time_m + 'm</strong> and <strong>' + final_time_s + 's</strong>');

// Set the initial Lat and Long of the Google Map
var myLatLng = new google.maps.LatLng(data[0].coords.latitude, data[0].coords.longitude);

// Google Map options
var myOptions = {
  zoom: 15,
  center: myLatLng,
  mapTypeId: google.maps.MapTypeId.ROADMAP
};

// Create the Google Map, set options
var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

var trackCoords = [];

// Add each GPS entry to an array
for(i=0; i<data.length; i++){
    trackCoords.push(new google.maps.LatLng(data[i].coords.latitude, data[i].coords.longitude));
}

// Plot the GPS entries as a line on the Google Map
var trackPath = new google.maps.Polyline({
  path: trackCoords,
  strokeColor: "#0000FF",
  strokeOpacity: 1.0,
  strokeWeight: 2
});

// Apply the line to the map
trackPath.setMap(map);
});
