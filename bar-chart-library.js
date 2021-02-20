$(document).ready(function() {
  $( "button" ).click(function( event ) {
    let options = {
      width:0,
      height:100,
      barColour: "green"
    }
    drawBarChart(1,options,$("#barChartBox"));
  });
  //Uncomment this line if you suspect that the entire JS file isn't being loaded.
  //alert("bar-chart-library.js loaded!");
});


const drawBarChart = function (data, options, element) {
  //Expects an array of arrays for data, and object for options, and a DOM or jQuery element for element

  options["width"] = options["width"] || 100;
  options["height"] = options["height"] || 100;
  options["barColour"] = options["barColour"] || "fuschia";
  options["labelColour"] = options["labelColour"] || "marmalade";
  options["barSpacing"] = options["barSpacing"] || 10;
  options["xLabel"] = options["xLabel"] || "X Axis";
  options["yLabel"] = options["yLabel"] || "Y Axis";
  options["title"] = options["title"] || "My Untitled Chart";

    //The bar charts will be built out of a stack of divs within another div.
  element.append(`<div style = "border: 1px black dashed">I'm a new div, inserted by drawBarChart! My width is ${options.width}</div>`);
}
