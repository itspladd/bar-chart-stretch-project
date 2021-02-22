/* Options are as follows:
  width: the width of the overall chart container div, including Y-axis div. Other div dimensions are calculated based on this value.
  height: height of the overall chart container div, including X-axis and title divs. Other div dimensions are calculated based on this value.
  barSpacing: spacing in between each bar. Calculated based on available width after y-axis is inserted and number of bars.
  xLabel: label of the x-axis.
  yLabel: label of the y-axis.
  title: title of the chart.
  titleFont: font of chart title.
  titleFontSize: font size of chart title. title div height is calculated from this.
*/

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
  const minHeight = 400;

  options["width"] = options["width"] > minWidth ? options["width"] : minWidth;
  options["height"] = options["height"] > minHeight ? options["height"] : minHeight;
  options["barSpacing"] = options["barSpacing"] || 10;
  options["xLabel"] = options["xLabel"] || "X Axis";
  options["yLabel"] = options["yLabel"] || "Y Axis";
  options["title"] = options["title"] || "My Untitled Chart";
  options["titleFont"] = options["titleFont"] || "Comic Sans";
  options["titleFontSize"] = options["titleFontSize"] || 40;

  //Size variables that aren't included in options
  const titlePadding = 10;
  const titleWidth = options.width - (titlePadding*2);
  const titleOffsetY = options.height - options.titleFontSize - (titlePadding * 2);
  const axisFontSize = 16;
  const axisPadding = 10;
  const xAxisWidth = options.width - (axisPadding * 2);
  const xAxisOffsetY = titleOffsetY - axisFontSize - (axisPadding * 2);
  const yAxisOffsetY = xAxisOffsetY + 1;
  const yAxisWidth = xAxisOffsetY;

  //The bar charts will be built out of a stack of divs within another div.
  element.append(`<div class = "chart-container" style = "width: ${options.width}; height: ${options.height}px"></div>`);

  //Insert the y-axis. Height is based on height of chart bounds and
  $( ".chart-container" ).append(`<div class="y-axis" style = "top: ${yAxisOffsetY}; width: ${yAxisWidth}">${options.yLabel}</div>`);
  $( ".chart-container" ).append(`<div class="x-axis" style = "top: ${xAxisOffsetY}; width: ${xAxisWidth}; padding: ${axisPadding}">${options.xLabel}</div>`);
  $( ".chart-container" ).append(`<div class="title-container" style = "font-size:${options.titleFontSize}; padding:${titlePadding}; width: ${titleWidth}; height:${options.titleFontSize}; top:${titleOffsetY}" >${options.title}</div>`);
}

const valueToBar = function () {

}
