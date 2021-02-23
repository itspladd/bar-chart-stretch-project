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
/* Data input is as follows:
  values: an array of numerical values representing each segment of a single bar. A single value will result in a single bar.
  labels: an array of labels that will be matched to each value in the values array.
  barColors: an array of strings representing colors that will be matched to each value in the values array.
  labelColors: and array of strings representing colors that will be used for each label in the labels array.
*/

$(document).ready(function() {
  let options = {
    width:99,
    height:100
  }

  let data = [
    {values: [50, 50], labels: ["Barts"], barColors: ["green"], labelColors: ["black"]},
    {values: [10, 20], labels: ["Blarts"], barColors: ["blue"], labelColors:["red"]}
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
  */

  //Check inputs for validity. TODO: Flesh these out.
  if (!dataValid(data)) {
    console.log("Error with data");
  }
  if (!optionsValid(options)) {
    console.log("Error with options");
  }
  if (!elementValid(element)) {
    console.log("Error with element");
  }

  const minWidth = 500;
  const minHeight = 400;

  options["width"] = options["width"] > minWidth ? options["width"] : minWidth;
  options["height"] = options["height"] > minHeight ? options["height"] : minHeight;
  options["barSpacing"] = options["barSpacing"] || 10;
  options["xLabel"] = options["xLabel"] || "X Axis";
  options["yLabel"] = options["yLabel"] || "Y Axis";
  options["title"] = options["title"] || "My Untitled Chart";
  options["titleFont"] = options["titleFont"] || "Comic Sans";
  options["titleFontSize"] = options["titleFontSize"] || 30;

  //Style variables that aren't included in options
  const titlePadding = 10;
  const axisFontSize = 16;
  const axisPadding = 10;

  //Style variables that are calculated from other values
  const titleWidth = options.width - (titlePadding*2);
  const titleOffsetY = options.height - options.titleFontSize - (titlePadding * 2);
  const xAxisWidth = options.width - (axisPadding * 2);
  const xAxisOffsetY = titleOffsetY - axisFontSize - (axisPadding * 2);
  const yAxisOffsetY = xAxisOffsetY + 1;
  const yAxisWidth = xAxisOffsetY - (axisPadding * 2);

  //This div is the container for all of this chart's elements.
  element.append(`<div class = "chart-container" style = "width: ${options.width}; height: ${options.height}px"></div>`);

  //Insert the axes and the title.
  $( ".chart-container" ).append(`<div class="y-axis" style = "top: ${yAxisOffsetY}; width: ${yAxisWidth}; padding: ${axisPadding}">${options.yLabel}</div>`);
  $( ".chart-container" ).append(`<div class="x-axis" style = "top: ${xAxisOffsetY}; width: ${xAxisWidth}; padding: ${axisPadding}">${options.xLabel}</div>`);
  $( ".chart-container" ).append(`<div class="title-container" style = "font-size:${options.titleFontSize}; padding:${titlePadding}; width: ${titleWidth}; height:${options.titleFontSize}; top:${titleOffsetY}">${options.title}</div>`);
}

const findStepSize = function (maxVal, numSteps, debug = false) {
  //Finds a nice-looking number for the top line of the chart, based on the number you give it and the number of division lines ("steps") you want.
  //Start by finding the rough size of the steps
  let stepSize = maxVal / numSteps;
  //Now find the power of 10 that this step falls into (i.e. 10 would be 1, 100 would be 2, 1000 would be 3)
  let stepSizePower = Math.ceil(Math.log10(stepSize)) -1;
  //If we end up with a 0, change it to a 1. Otherwise the stepSizeFactor will be a fraction.
  stepSizePower = stepSizePower === 0 ? 1 : stepSizePower;
  let stepSizeFactor = Math.pow(10, stepSizePower - 1);
  //Now we find a nicer-looking number by moving the decimal point to the left until we're left with a two-digit number.
  //Then we Math.ceil() that number and move the decimal point back.
  let adjustedStepSize = Math.ceil(stepSize / stepSizeFactor) * stepSizeFactor;

  if (debug) {
    console.log(`Rough stepsize: ${stepSize}`);
    console.log(`stepSizePower is ${stepSizePower}`);
    console.log(`Dividing stepSize by ${stepSizeFactor} to get ${stepSize / stepSizeFactor} and rounding up...`);
    console.log(`Adjusted step size: ${adjustedStepSize}. With ${numSteps} divisions, chart will look like:`);
    for(let i = numSteps; i >= 0; i--) {
      console.log(i * adjustedStepSize);
    }
  }
  return adjustedStepSize;
 }

const valueToBar = function () {

};

//Placeholder function to check the options object for invalid values.
const optionsValid = function (options) {
  return true;
}

const dataValid = function (data) {
  return true;
}

const elementValid = function (element) {
  return true;
}
