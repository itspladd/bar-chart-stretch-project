$(document).ready(function() {
  let debugMode = true; //TODO: Make a better debug mode, possibly a box that can be checked on the main page, and then you click a button to reload charts instead of refreshing

  let options = {
    width:99,
    height:100
  }

  let data = [
    {values: [5, 5], label: "Barts", barColors: ["green"], labelColors: ["black"]},
    {values: [10, 20], label: "Carts", barColors: ["blue"], labelColors:["red"]},
    {values: [50], label: "Parts", barColors: ["green"], labelColors: ["black"]},
    {values: [60, 40], label: "Blarts", barColors: ["green"], labelColors: ["black"]}
  ];
  drawBarChart(data,options,$("#barChartBox"), debugMode);

  $( "button" ).click(function( event ) {

  });
  //Uncomment this line if you suspect that the entire JS file isn't being loaded. Excluded from debug mode because I don't feel like closing the box every time I refresh the page.
  //alert("bar-chart-library.js loaded!");
});


const drawBarChart = function (data, options, element, debug = false) {
  /*Expects an array of objects for data, an object for options, and a DOM or jQuery element for element
  ****DATA****
  data = [
    {values: [int1, int2, ...], barColors: ["color1", "color2"], label: "label", labelColors: ["color1", "color2"]},
    {values: [int1, int2, ...], barColors: ["color1", "color2"], label: "label2", labelColors: ["color1", "color2"]},
    etc
  ]
  values: an array of numerical values representing each segment of a single bar. A single value will result in a single bar.
  labels: an array of labels that will be matched to each value in the values array.
  barColors: an array of strings representing colors that will be matched to each value in the values array.
  labelColors: and array of strings representing colors that will be used for each label in the labels array.

  ****OPTIONS****
  options = { width: number, height: number, ...}
  A single object specifying configuration options for the chart as a whole.
  All values are optional,
  width: the width of the overall chart container div, including Y-axis div. Other div dimensions are calculated based on this value.
  height: height of the overall chart container div, including X-axis and title divs. Other div dimensions are calculated based on this value.
  barSpacing: spacing in between each bar. Calculated based on available width after y-axis is inserted and number of bars.
  xLabel: label of the x-axis.
  yLabel: label of the y-axis.
  yDivs: number of lines above zero in the y-axis, including the top line. For instance, yDivs = 4 and 100 max value will give markers of 0, 25, 50, 75, 100
  title: title of the chart.
  titleFont: font of chart title.
  titleFontSize: font size of chart title. title div height is calculated from this.

  ****ELEMENT****
  TODO: Add documentation here if it's warranted.
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

  //Set any blank options to a default value, or coerce any out-of-bounds options to their minimum.
  const width = options["width"] > minWidth ? options["width"] : minWidth;
  const height = options["height"] > minHeight ? options["height"] : minHeight;
  const barSpacing = options["barSpacing"] || 10;
  const xLabel = options["xLabel"] || "X Axis";
  const yLabel = options["yLabel"] || "Y Axis";
  const yDivs = options["yDivs"] || 4;
  const title = options["title"] || "My Untitled Chart";
  const titleFont = options["titleFont"] || "Comic Sans";
  const titleFontSize = options["titleFontSize"] || 30;

  //Style variables that aren't included in the options input
  const titlePadding = 10;
  const axisFontSize = 16;
  const axisPadding = 10;

  //Style variables that are calculated from other values
  const titleWidth = width - (titlePadding*2);
  const titleOffsetY = height - titleFontSize - (titlePadding * 2);
  const xAxisWidth = width - (axisPadding * 2);
  const xAxisOffsetY = titleOffsetY - axisFontSize - (axisPadding * 2);
  const yAxisOffsetY = xAxisOffsetY + 1;
  const yAxisWidth = xAxisOffsetY - (axisPadding * 2);

  //Find the step size based on the biggest data bar and the number of divs.
  const yAxisStepSize = findStepSize(findMaxVal(data, debug), yDivs, debug);
  const yAxisLabelOffset = axisFontSize + (axisPadding * 2) + 4;

  //In this chunk, we create all of the divs. All of them.
  let $chartContainerDiv = $("<div>", {"class" : "chart-container", "style" : `width: ${width}; height: ${height}`});
  let $titleDiv = $("<div>", {"class" : "title-container", "style" : `font-size:${titleFontSize}; padding:${titlePadding}; top:${titleOffsetY}`}).text(`${title}`);
  let $xAxisDiv = $("<div>", {"class" : "x-axis", "style" : `top: ${xAxisOffsetY}; width: ${xAxisWidth}; padding: ${axisPadding}`}).text(`${xLabel}`);
  let $yAxisDiv = $("<div>", {"class" : "y-axis", "style" : `top: ${yAxisOffsetY}; width: ${yAxisWidth}; padding: ${axisPadding}`}).text(`${yLabel}`);
  let $yAxisLabelDivs = [];
  for (i = 0; i<= yDivs; i++) {
    $yAxisLabelDivs.push($("<div>", {"class" : "y-axis-label"}).text(`${yAxisStepSize*i}`));
  }
  let $xAxisLabelDivs = [];
  for (let bar of data) {
    $xAxisLabelDivs.push($("<div>", {"class" : "x-axis-label"}).text(`${bar.label}`));
  }
  let $innerChartDiv = $("<div>", {});
  let $barDivs = [];
  for (let bar of data) {
    let currentBar = []
    for (let value of bar.values) {
      currentBar.push($("<div>", {"class" : "data-bar"}).text(`${value}`));
    }
    $barDivs.push(currentBar);
  }

  //Put all the elements together.
  $chartContainerDiv.append($titleDiv, $xAxisDiv, $yAxisDiv, $yAxisLabelDivs, $xAxisLabelDivs, $innerChartDiv);
  for (let bar of $barDivs) {
    $chartContainerDiv.append(bar);
  }

  element.append($chartContainerDiv);

  //Give all divs a dashed border if we're in debug mode.
  debug ? $( "div" ).css({"border": "1px black dashed"}) : null;

  //Now let's work on sizing the divs. First we'll gather some information on sizes.


  $titleDiv.outerWidth($chartContainerDiv.innerWidth());


}

const findMaxVal = function(data, debug = false) {
  let maxVal = 0;
  //For every bar in the chart, find its sum and compare it to the previous maxVal. Save the new maxVal if our new one is higher.
  for (bar of data) {
    let currentSum = bar.values.reduce( (accumulator, currentValue) => accumulator + currentValue);
    maxVal = currentSum > maxVal ? currentSum : maxVal;
    debug ? console.log(`findMaxVal: current max value is ${maxVal}`) : null;
  }

  return maxVal;
}

//Helper function to find a nice-ish number for the step size of the chart, based on the maximum value of the chart and the number of division lines ("steps") you want.
const findStepSize = function (maxVal, numSteps, debug = false) {
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
    console.log(`finStepSize: maxVal is ${maxVal} and numSteps is ${numSteps}`);
    console.log(`finStepSize: Rough stepsize: ${stepSize}`);
    console.log(`finStepSize: stepSizePower is ${stepSizePower}`);
    console.log(`finStepSize: Dividing stepSize by ${stepSizeFactor} to get ${stepSize / stepSizeFactor} and rounding up...`);
    console.log(`finStepSize: Adjusted step size: ${adjustedStepSize}. With ${numSteps} divisions, chart will look like:`);
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
