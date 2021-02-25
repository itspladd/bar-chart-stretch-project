$(document).ready(function() {
  let debugMode = true; //TODO: Make a better debug mode, possibly a box that can be checked on the main page, and then you click a button to reload charts instead of refreshing

  let options = {
    width: 600,
    height: 500,
    yDivs: 4
  }

  let data = [
    {values: [50], label: "Barts", barColors: ["green"], labelColors: ["black"]},
    {values: [10, 20], label: "Carts", barColors: ["blue"], labelColors:["red"]},
    {values: [10, 50], label: "Parts", barColors: ["grey"], labelColors: ["black"]},
    {values: [40, 60], label: "Blarts", barColors: ["red"], labelColors: ["black"]},
    {values: [50], label: "Barts", barColors: ["green"], labelColors: ["black"]},
    {values: [10, 20], label: "Carts", barColors: ["blue"], labelColors:["red"]},
    {values: [10, 50], label: "Parts", barColors: ["grey"], labelColors: ["black"]},
    {values: [40, 60], label: "Blarts", barColors: ["red"], labelColors: ["black"]}
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
  const minHeight = 500;

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
  const barBorderSize = 2;

  //Find the step size based on the biggest data bar and the number of divs.
  const yAxisStepSize = findStepSize(findMaxVal(data, debug), yDivs, debug);
  const maxChartValue = yAxisStepSize * yDivs;

  //In this chunk, we create all of the divs. All of them.
  let $chartContainerDiv = $("<div>", {"class" : "chart-container", "style" : `width: ${width}; height: ${height}`});
  let $titleDiv = $("<div>", {"class" : "title-container", "style" : `font-size:${titleFontSize}; padding:${titlePadding}`}).text(`${title}`);
  let $xAxisDiv = $("<div>", {"class" : "x-axis", "style" : `padding: ${axisPadding}`}).text(`${xLabel}`);
  let $yAxisDiv = $("<div>", {"class" : "y-axis", "style" : `padding: ${axisPadding}`}).text(`${yLabel}`);
  let $yAxisLabelDivs = [];
  let $yAxisStepDivs = [];
  for (i = yDivs; i >= 0; i--) {
    $yAxisLabelDivs.push($("<div>", {"class" : "y-axis-label", "style" : "text-align: right; padding-right: 5;"}).text(`${yAxisStepSize*i}`));
    //If we're on the last loop, don't put in the 0 div. We want the 0 label, but not the div itself.
    i !== 0 ? $yAxisStepDivs.push($("<div>", {"style" : "border-style: solid none none none; border-width: 1px; background: rgba(0, 0, 0, 0);"})) : null;
  }
  let $xAxisLabelDivs = [];
  for (let bar of data) {
    $xAxisLabelDivs.push($("<div>", {"class" : "x-axis-label"}).text(`${bar.label}`));
  }
  let $innerChartDiv = $("<div>", {"style" : `border-style: none none solid solid; padding-left: ${.05 * width}; padding-right: ${.05 * width}`});
  let $barDivs = [];
  for (let bar of data) {
    let currentBar = []
    for (let value of bar.values) {
      currentBar.push($("<div>", {"class" : "data-bar", "style" : `border-style: solid solid none solid; background-color: ${bar.barColors[0]}; border-color: black; border-width: ${barBorderSize};` }).text(`${value}`));
    }
    $barDivs.push(currentBar);
  }

  //Put all the elements into the page.
  $chartContainerDiv.append($titleDiv, $xAxisDiv, $yAxisDiv, $yAxisLabelDivs, $xAxisLabelDivs, $innerChartDiv, $yAxisStepDivs);
  for (let bar of $barDivs) {
    $innerChartDiv.append(bar);
  }
  element.append($chartContainerDiv);

  //Give all divs a dashed border if we're in debug mode.
  //debug ? $( "div" ).css({"border": "1px black dashed"}) : null;

  //Now let's work on sizing the divs.
  //First, calculate some values that will be used multiple times later
  const maxYLabelWidth = findYLabelMaxWidth($yAxisLabelDivs, debug);
  const yAxisAndLabelWidth = maxYLabelWidth + $yAxisDiv.outerHeight();

  //Dimensions are formed as follows: {xOffset, yOffset, width, height}
  //null indicates a dimension or position that will not be explicitly set.
  const titleDimensions = { "xOffset" : null,
    "yOffset" : ($chartContainerDiv.innerHeight() - $titleDiv.outerHeight()),
    "width" : $chartContainerDiv.innerWidth(),
    "height" : null
  };
  const xAxisDimensions = { "xOffset" : yAxisAndLabelWidth,
    "yOffset" : titleDimensions.yOffset - $xAxisDiv.outerHeight(),
    "width" : $chartContainerDiv.innerWidth() - yAxisAndLabelWidth,
    "height" : null
  };
  const innerChartDimensions = {"xOffset" : xAxisDimensions.xOffset,
    "yOffset" : null,
    "width" : xAxisDimensions.width,
    "height" : xAxisDimensions.yOffset - $xAxisLabelDivs[0].outerHeight()
  };
  const yAxisDimensions = { "xOffset" : null,
  "yOffset" : innerChartDimensions.height,
  "width" : innerChartDimensions.height,
  "height" : null
  };
  const yAxisLabelDimensions = { "xOffset" : $yAxisDiv.outerHeight(),
  "yOffset" : null,
  "width" : maxYLabelWidth,
  "height" : null
  };
  const yAxisDivDimensions = { "xOffset" : innerChartDimensions.xOffset,
  "yOffset" : null,
  "width" : innerChartDimensions.width,
  "height" : innerChartDimensions.height / yDivs
  };

  //Now we actually position these divs so that we can access width() values when positioning the bars.
  setDimensionsAndOffset({ $element : $titleDiv, dimensions : titleDimensions });
  setDimensionsAndOffset({ $element : $innerChartDiv, dimensions : innerChartDimensions });
  setDimensionsAndOffset({ $element : $xAxisDiv, dimensions : xAxisDimensions });
  setDimensionsAndOffset({ $element : $yAxisDiv, dimensions : yAxisDimensions });
  for (let i = yDivs; i >= 0; i--) {
    yAxisDivDimensions.yOffset = i * yAxisDivDimensions.height;
    yAxisLabelDimensions.yOffset = yAxisDivDimensions.yOffset - ($yAxisLabelDivs[i].outerHeight() / 2);
    setDimensionsAndOffset({ $element : $yAxisLabelDivs[i], dimensions : yAxisLabelDimensions });
    i !== 4 ? setDimensionsAndOffset({ $element : $yAxisStepDivs[i], dimensions : yAxisDivDimensions }) : null;
  }

  //The bar's x offset starts right next to the border (we have to do this calculation here since the inner chart has padding)
  const barDimensions = { "xOffset" : ($innerChartDiv.innerWidth() - $innerChartDiv.width()) / 2,
  "yOffset" : null,
  //Determine how wide each bar should be, given the number of bars, the spacing between them, and the amount of space inside the inner chart div.
  //Remember that the number of spaces will be equal to the number of bars minus one!
  "width" : ($innerChartDiv.width() - ((data.length - 1) * barSpacing)) / data.length,
  "height" : null
  };

  //x axis labels should be centered on the bars, but the bars are positioned relative to the inner chart div, so we need to recalculate some things.
  //Start from the inner chart's x offset, add the border width (which is the difference between outerWidth and innerWidth), and then the offset we calculated for the bar.
  const xAxisLabelDimensions = { "xOffset" : innerChartDimensions.xOffset + ($innerChartDiv.outerWidth() - $innerChartDiv.innerWidth()) + barDimensions.xOffset,
  "yOffset" : yAxisDimensions.yOffset,
  "width" : barDimensions.width,
  "height" : null
  };

  //This nested loop operates on every individual segment of each individual bar div.
  //Initial x offset is set to the padding value of the div, so we'll start placing divs at the far left side of the inner chart.
  for (let i = 0; i < data.length; i++) {
    //Find the total value of the current bar.
    let barTotalTrue = data[i].values.reduce( (accumulator, currentValue) => accumulator + currentValue);
    //Convert that value to a pixel value based on the maximum value of the chart.
    let barTotalRelative = (barTotalTrue / maxChartValue) * $innerChartDiv.innerHeight();

    //Find the starting y offset.
    barDimensions.yOffset = $innerChartDiv.innerHeight() - barTotalRelative;

    for (let j = 0; j < data[i].values.length; j++) {
      //Now for each individual segment, find the height of that segment: the percent of the total bar, times the relative height of the bar.
      barDimensions.height = (data[i].values[j] / barTotalTrue) * barTotalRelative;
      setDimensionsAndOffset({ $element : $barDivs[i][j], dimensions : barDimensions });
      barDimensions.yOffset += barDimensions.height;
    }
    //Bar is placed! Now we place the label.
    setDimensionsAndOffset({ $element : $xAxisLabelDivs[i], dimensions : xAxisLabelDimensions });
    //Once we've placed a whole bar, move the x offset over to the spot for the next bar (and label!).
    barDimensions.xOffset += barDimensions.width + barSpacing;
    xAxisLabelDimensions.xOffset += barDimensions.width + barSpacing;
  }
};

//Set the dimensions and offset of the input element.
const setDimensionsAndOffset = function ({ $element, dimensions, setOuter = true, animation = [false, false, false, false] }) {
  dimensions["xOffset"] ? $element.css("left", dimensions["xOffset"]) : null;
  dimensions["yOffset"] ? $element.css("top", Math.round(dimensions["yOffset"])) : null;
  dimensions["width"] ? setOuter ? $element.outerWidth(dimensions["width"]) : $element.innerWidth(dimensions["width"]) : null;
  dimensions["height"] ? setOuter ? $element.outerHeight(Math.ceil(dimensions["height"])) : $element.innerHeight(Math.ceil(dimensions["height"])) : null;
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
};

const findYLabelMaxWidth = function(yLabels, debug = false) {
  let maxWidth = 0;
  for (let label of yLabels) {
    maxWidth = label.outerWidth() > maxWidth ? label.outerWidth() : maxWidth;
    debug ? console.log(`findYLabelMaxWidth: current max value is ${maxWidth}`) : null;
  }
  return maxWidth;
};

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
};

const valueToBar = function () {

};

//Placeholder function to check the options object for invalid values.
const optionsValid = function (options) {
  return true;
};

const dataValid = function (data) {
  return true;
};

const elementValid = function (element) {
  return true;
};
