$(document).ready(function() {
  let options = {
    width:99,
    height:100,
    barColour: "green"
  }

  let data = [
    {values: [1], labels: ["Barts"], barColors: ["green"], labelColors: ["blue"]}
  ];
  drawBarChart(data,options,$("#barChartBox"));

  $( "button" ).click(function( event ) {

  });
  //Uncomment this line if you suspect that the entire JS file isn't being loaded.
  //alert("bar-chart-library.js loaded!");
});


const drawBarChart = function (data, options, element) {
  //Expects an array of objects for data, and object for options, and a DOM or jQuery element for element
  //Structure of data input:
  /*data = [
    {values: [int1, int2, ...], labels: ["label1", "label2", ...], barColors: ["color1", "color2"], labelColors: ["color1", "color2"]},
    {values: [int1, int2, ...], labels: ["label1", "label2", ...], barColors: ["color1", "color2"], labelColors: ["color1", "color2"]},
    etc
  ]
  Each object is a single bar. The values array can have one or multiple values, which will be the number of sections in that bar.
  There
  */
  const minWidth = 500;
  const minHeight = 500;

  options["width"] = options["width"] > minWidth ? options["width"] : minWidth;
  options["height"] = options["height"] > minHeight ? options["height"] : minHeight;
  options["barSpacing"] = options["barSpacing"] || 10;
  options["xLabel"] = options["xLabel"] || "X Axis";
  options["yLabel"] = options["yLabel"] || "Y Axis";
  options["title"] = options["title"] || "My Untitled Chart";
  options["titleFont"] = options["titleFont"] || "Comic Sans";
  options["titleFontSize"] = options["titleFontSize"] || 14;

  //We'll set this programmatically later
  let titleHeight = 40;

  //The bar charts will be built out of a stack of divs within another div.
  element.append(`<div class = "chart-container" style = "width: ${options.width}px; height: ${options.height}px"></div>`);
  $( ".chart-container" ).append(`<div class="y-axis">${options.yLabel}</div>`);
  $( ".chart-container" ).append(`<div class="x-axis">${options.xLabel}</div>`);
  $( ".chart-container" ).append(`<div class="title-container">${options.title}</div>`);
}

const valueToBar = function () {

}
