// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Perform a GET request to the query URL and console log data 
d3.json(queryUrl).then(function (data) {
    console.log(data);
    createFeatures(data.features);
});

// Function to determine marker size
function markerSize(magnitude) {
    return Math.sqrt(magnitude) * 15;
}

//  Function to determine marker color by depth
function colorDepth(depth) {
    let color = "";
    if (depth < 10) {
      color = "#4CAF50";
    }
    else if (depth < 30) {
      color = "#D4E157";
    }
    else if (depth < 50) {
      color = "#FFF176";
    }
    else if (depth < 70) {
        color = "#FFCC80";
    }
    else if (depth < 90) {
        color = "#EF6C00 ";
      }
    else {
      color = "#B71C1C";
    }
    return color;
}

function createFeatures(earthquakeData) {

// Each data point must have a tooltip with the Magnitude, the location and depth    
    function onEachFeature(feature, layer) {
      layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>Magnitude: ${feature.properties.mag}, Depth: ${feature.geometry.coordinates[2]}`);
    }
  

    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,

   
        pointToLayer: function(feature, latlng) {
          let radius = feature.properties.mag;
          let depth = feature.geometry.coordinates[2]
          
          return L.circleMarker(latlng, {
            stroke: true,            
            fillOpacity: 0.75,
            color: "black",
            fillColor: colorDepth(depth),
            radius: markerSize(radius),
            weight: 0.3
          });
        }
    });

    // Send earthquakes layer to the createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {

    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
  
    // Create a baseMaps object
    let baseMaps = {
      "Street Map": street,
      "Topographic Map": topo
    };
  
    // Create an overlay object to hold our overlay
    let overlayMaps = {
      Earthquakes: earthquakes
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load
    let myMap = L.map("map", {
      center: [
        41.00, 28.9784
      ],
      zoom: 3,
      layers: [street, earthquakes]
    });
  
  
    // Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

    // 
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend"); 
        let depth = [
            {min: -10, max: 10, color: "#4CAF50"},
            {min: 10, max: 30, color: "#D4E157"},
            {min: 30, max: 50, color: "#FFF176"},
            {min: 50, max: 70, color: "#FFCC80"},
            {min: 70, max: 90, color: "#EF6C00"},
            {min: 90, max: "+", color: "#B71C1C"}
        ];       

    // Add legend 
    let legendInfo = "<h3>Earthquake Depth</h3>" 
    div.innerHTML = legendInfo;

    for (let i = 0; i < depth.length; i++) {
        let depthItem = depth[i];
        let legendItem = `<i style="background:${depthItem.color}"></i> ${depthItem.min} - ${depthItem.max}<br>`;
        div.innerHTML += legendItem;
      }
      return div;
    };

    
    legend.addTo(myMap);
}