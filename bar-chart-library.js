$(document).ready(function() {
  $( "button" ).click(function( event ) {
    let options = {
      width:99,
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
  const minWidth = 500;
  const minHeight = 500;

  options["width"] = options["width"] > minWidth ? options["width"] : minWidth;
  options["height"] = options["height"] > minHeight ? options["height"] : minHeight;
  options["barColour"] = options["barColour"] || "fuschia";
  options["labelColour"] = options["labelColour"] || "marmalade";
  options["barSpacing"] = options["barSpacing"] || 10;
  options["xLabel"] = options["xLabel"] || "X Axis";
  options["yLabel"] = options["yLabel"] || "Y Axis";
  options["title"] = options["title"] || "My Untitled Chart";

    //The bar charts will be built out of a stack of divs within another div.
  element.append(`<div style = "border: 1px black dashed; margin: auto; width: ${options.width}px; height: ${options.height}px">I'm a new div, inserted by drawBarChart! My width value is ${options.width}</div>`);
}
