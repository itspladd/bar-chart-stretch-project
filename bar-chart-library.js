$(document).ready(function() {
  let debugMode = true; //TODO: Make a better debug mode, possibly a box that can be checked on the main page, and then you click a button to reload charts instead of refreshing

  let options = {
    width: 600,
    height: 500,
    yDivs: 4,
    barSpacing: 30
  }

  let data = [
    {values: [50], label: "Barts", barColors: ["green"], labelColor: "none"},
    {values: [5, 20], label: "Carts", barColors: ["blue", "red"], labelColor:"none"},
    {values: [10, 50], label: "Parts", barColors: ["grey"], labelColor: "none"},
    {values: [40, 60], label: "Blarts", barColors: ["red"], labelColor: "none"},
    {values: [50], label: "Marts", barColors: ["green"], labelColor: "none"},
    {values: [10, 20], label: "Tarts", barColors: ["blue"], labelColor:"grey"},
    {values: [25, 50], label: "Darts", barColors: ["grey"], labelColor: "none"},
    {values: [40, 60], label: "Warts", barColors: ["red", "purple"], labelColor: "none"}
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
    {values: [int1, int2, ...], barColors: ["color1", "color2"], label: "label", labelColor: ["color1", "color2"]},
    {values: [int1, int2, ...], barColors: ["color1", "color2"], label: "label2", labelColor: ["color1", "color2"]},
    etc
  ]
  values: an array of numerical values representing each segment of a single bar. A single value will result in a single bar.
  labels: an array of labels that will be matched to each value in the values array.
  barColors: an array of strings representing colors that will be matched to each value in the values array.
  labelColor: and array of strings representing colors that will be used for each label in the labels array.

  ****OPTIONS****
  options = { width: number, height: number, ...}
  A single object specifying configuration options for the chart as a whole.
  All values are optional,
  width: the width of the overall chart container div, including Y-axis div. Other div dimensions are calculated based on this value.
  height: height of the overall chart container div, including X-axis and title divs. Other div dimensions are calculated based on this value.
  barSpacing: spacing in between each bar. Calculated based on available width after y-axis is inserted and number of bars.
  barBorder: border size for each bar. Can be 0.
  hideBarValues : boolean value for whether or not to display the value of each bar.
  barValueAlignment : where the values for a bar should be positioned if shown. Can be "flex-start", "center", or "flex-end"
  xLabel: label of the x-axis.
  yLabel: label of the y-axis.
  axisFont : font-family for the axes and their labels.
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
  const barAlignmentOptionStrings = {"top" : "flex-start", "middle" : "center", "bottom" : "flex-end"};

  //Set any blank options to a default value, or coerce any out-of-bounds options to their minimum.
  const width = options["width"] > minWidth ? options["width"] : minWidth;
  const height = options["height"] > minHeight ? options["height"] : minHeight;
  const barSpacing = options["barSpacing"] || 10;
  const barBorder = options["barBorder"] || 2;
  const hideBarValues = options["hideBarValues"]; //Automatically defaults to "false" if this options["hideBarValues"] doesn't exist.
  const barValueAlignment = options["barValueAlignment"] ? barAlignmentOptionStrings[options["barValueAlignment"]] : "center";
  const xLabel = options["xLabel"] || "X Axis";
  const yLabel = options["yLabel"] || "Y Axis";
  const axisFont = options["axisFont"] || "Helvetica";
  const yDivs = options["yDivs"] || 4;
  const title = options["title"] || "My Untitled Chart";
  const titleFont = options["titleFont"] || "Arial";
  const titleFontSize = options["titleFontSize"] || 30;
  const titleColor = options["titleCOlor"] || "black";

  //Style variables that aren't included in the options input
  const titlePadding = 10;
  const axisFontSize = 16;
  const axisPadding = 10;
  const axisLineWidth = 3;

  //Find the step size based on the biggest data bar and the number of divs.
  const yAxisStepSize = findStepSize(findMaxVal(data, debug), yDivs, debug);
  const maxChartValue = yAxisStepSize * yDivs;

  //In this chunk, we create all of the divs. All of them.
  let $chartContainerDiv = $("<div>", {"class" : "chart-container", "style" : `width: ${width}; height: ${height}`});
  let $titleDiv = $("<div>", {"class" : "title-container", "style" : `color : ${titleColor}; font-family : ${titleFont}; font-size:${titleFontSize}; padding:${titlePadding}`}).text(`${title}`);
  let $xAxisDiv = $("<div>", {"class" : "x-axis", "style" : `padding: ${axisPadding}`}).text(`${xLabel}`);
  let $yAxisDiv = $("<div>", {"class" : "y-axis", "style" : `padding: ${axisPadding}`}).text(`${yLabel}`);
  let $yAxisLabelDivs = [];
  let $yAxisStepDivs = [];
  for (i = yDivs; i >= 0; i--) {
    $yAxisLabelDivs.push($("<div>", {"class" : "y-axis-label", "style" : "text-align: right; padding-right: 5;"}).text(`${yAxisStepSize*i}`));
    //If we're on the last loop, don't put in the 0 div. We want the 0 label, but not the div itself.
    i !== 0 ? $yAxisStepDivs.push($("<div>", {"class" : "y-axis-step", "style" : "border-style: solid none none none; border-width: 1px;"})) : null;
  }
  let $xAxisLabelDivs = [];
  for (let bar of data) {
    $xAxisLabelDivs.push($("<div>", {"class" : "x-axis-label", "style" : `margin-top: 5px; background-color: ${bar.labelColor || "none"}`}).text(`${bar.label}`));
  }
  let $innerChartDiv = $("<div>", {"style" : `border-style: none none solid solid; border-width: ${axisLineWidth}; padding-left: ${.05 * width}; padding-right: ${.05 * width}`});
  //Note that here, we create all the bar divs and also a nested div to hold the value of the bar.
  let $barDivs = [];
  for (let bar of data) {
    let currentBar = []
    for (let i = 0; i < bar.values.length; i++) {
      currentBar.push($("<div>", {"class" : "data-bar",
        "style" : `background-color: ${bar.barColors[i] || bar.barColors[0]}; align-items: ${barValueAlignment}; border-style: solid solid none; border-width: ${barBorder}`
      }));
      currentBar[currentBar.length - 1].append($("<div>", {"class" : "data-bar-value"}).text(`${hideBarValues ? "" : bar.values[i]}`));
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
  "height" : (innerChartDimensions.height - axisLineWidth) / yDivs
  };

  //Now we actually position these divs so that we can access width() values when positioning the bars.
  setDimensionsAndOffset({ $element : $titleDiv, dimensions : titleDimensions, animation : [false, true, false, false]});
  setDimensionsAndOffset({ $element : $innerChartDiv, dimensions : innerChartDimensions });
  setDimensionsAndOffset({ $element : $xAxisDiv, dimensions : xAxisDimensions });
  setDimensionsAndOffset({ $element : $yAxisDiv, dimensions : yAxisDimensions });
  for (let i = yDivs; i >= 0; i--) {
    yAxisDivDimensions.yOffset = i * yAxisDivDimensions.height;
    yAxisLabelDimensions.yOffset = yAxisDivDimensions.yOffset - ($yAxisLabelDivs[i].outerHeight() / 2);
    setDimensionsAndOffset({ $element : $yAxisLabelDivs[i], dimensions : yAxisLabelDimensions, animation : [false, true, false, false] });
    i !== 4 ? setDimensionsAndOffset({ $element : $yAxisStepDivs[i], dimensions : yAxisDivDimensions, animation : [false, true, false, false] }) : null;
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

//The following implementation (the original) builds the bars from the top down - it finds the Y offset for the bar as a whole, then places the top segment, then the next, etc.
//Currently it's saved here for posterity, or if I need to reference it.
/**********************************************
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
      setDimensionsAndOffset({ $element : $barDivs[i][j], dimensions : barDimensions , animation : [false, false, true, true]});
      barDimensions.yOffset += barDimensions.height;
    }
    //Bar is placed! Now we place the label.
    setDimensionsAndOffset({ $element : $xAxisLabelDivs[i], dimensions : xAxisLabelDimensions, animation : [true, false, false, false]});
    //Once we've placed a whole bar, move the x offset over to the spot for the next bar (and label!).
    barDimensions.xOffset += barDimensions.width + barSpacing;
    xAxisLabelDimensions.xOffset += barDimensions.width + barSpacing;
  }
  ***********************************************/

  //This implementation builds the bars from the bottom up. It relies on bottom:0 being set in barchart.css.
  //TODO: move this into its own function.
  for (let i = 0; i < data.length; i++) {
    //Find the total value of the current bar.
    let barTotalAbsolute = data[i].values.reduce( (accumulator, currentValue) => accumulator + currentValue);
    //Convert that value to a pixel value based on the maximum value of the chart.
    let barTotalRelative = (barTotalAbsolute / maxChartValue) * $innerChartDiv.innerHeight();
    barDimensions.yOffset = 0;
    for (let j = data[i].values.length - 1; j >= 0; j--) {
      //
      barDimensions.height = ((data[i].values[j] / barTotalAbsolute) * barTotalRelative) - barBorder;
      setDimensionsAndOffset({ $element : $barDivs[i][j], dimensions : barDimensions , animation : [false, false, false, true], queueStr : "bars"});
      j > 0 ? $barDivs[i][j-1].css("bottom", barDimensions.height + barBorder) : null;
    }
    setDimensionsAndOffset({ $element : $xAxisLabelDivs[i], dimensions : xAxisLabelDimensions, animation : [true, false, false, false]});
    barDimensions.xOffset += barDimensions.width + barSpacing;
    xAxisLabelDimensions.xOffset += barDimensions.width + barSpacing;
  }
  $barDivs[0][0].dequeue("bars");
};

//Set or animate the dimensions and offset of the input element.
//The dimensions{} input can be a full set of dimensions or a single value from the dimensions.
//This allows us to (for example) animate the X value for a set of elements, then animate the height of those elements, without re-calculating the dimensions.
//At least, I'm pretty sure that should work. TODO: delete this line if it works.
const setDimensionsAndOffset = function ({ $element, dimensions, animation = [false, false, false, false], queueStr}) {
  //Check for nonexistent or empty $element and dimensions inputs.
  if (!$element) {
    console.log(Error('No $element given to setDimensionsAndOffset'));
    return false;
  }
  if (!dimensions) {
    console.log(Error('No dimensions object given to setDimensionsAndOffset'));
    return false;
  }
  if (!Object.values(dimensions).length) {
    console.log(Error('Empty dimensions object given to setDimensionsAndOffset'));
    return false;
  }

  if (animation[0]) {
    dimensions["xOffset"] ? $element.animate({"left" : dimensions["xOffset"]}) : null;
  } else {
    dimensions["xOffset"] ? $element.css("left", dimensions["xOffset"]) : null;
  }

  if (animation[1]) {
    dimensions["yOffset"] ? $element.animate({"top" : dimensions["yOffset"]}) : null;
  } else {
    dimensions["yOffset"] ? $element.css("top", dimensions["yOffset"]) : null;
  }
  dimensions["xOffset"] ? animation[0] ? $element.animate({"left" : dimensions["xOffset"]}) : $element.css("left", dimensions["xOffset"]) : null;

  if (animation[2]) {
    dimensions["width"] ? $element.animate({"width" : dimensions["width"]}) : null;
  } else {
    dimensions["width"] ? $element.outerWidth(dimensions["width"]) : null;
  }

  if (animation[3]) {
    dimensions["height"] ? $element.animate({ "height" : dimensions["height"] }) : null;
  } else {
    dimensions["height"] ? $element.outerHeight(dimensions["height"]) : null;
  }
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
