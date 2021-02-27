$(document).ready(function() {
  let debugMode = true; //TODO: Make a better debug mode, possibly a box that can be checked on the main page, and then you click a button to reload charts instead of refreshing

  let options = {
    width: 600,
    height: 500,
    yDivs: 6,
    barSpacing: 30
  }

  let data = [
    {values: [100], label: "Barts", barColors: ["green"], labelColor: "none"},
    {values: [5], label: "Carts", barColors: ["blue", "red"], labelColor:"none"},
    {values: [10, 50], label: "Parts", barColors: ["grey"], labelColor: "none"},
    {values: [40, 60], label: "Blarts", barColors: ["red"], labelColor: "none"},
    {values: [50], label: "Marts", barColors: ["green"], labelColor: "none"},
    {values: [10, 20], label: "Tarts", barColors: ["blue"], labelColor:"none"},
    {values: [100], label: "Darts", barColors: ["grey"], labelColor: "none"},
    {values: [100], label: "Warts", barColors: ["red", "purple"], labelColor: "none"}
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
  options["width"] = options["width"] > minWidth ? options["width"] : minWidth;
  options["height"] = options["height"] > minHeight ? options["height"] : minHeight;
  options["barSpacing"] = options["barSpacing"] || 10;
  options["barBorder"] = options["barBorder"] || 2;
  options["hideBarValues"] = options["hideBarValues"]; //Automatically defaults to "false" if this options["hideBarValues"] doesn't exist.
  options["barValueAlignment"] = options["barValueAlignment"] ? barAlignmentOptionStrings[options["barValueAlignment"]] : "center";
  options["xLabel"] = options["xLabel"] || "X Axis";
  options["yLabel"] = options["yLabel"] || "Y Axis";
  options["axisFont"] = options["axisFont"] || "Helvetica";
  options["yDivs"] = options["yDivs"] || 4;
  options["title"] = options["title"] || "My Untitled Chart";
  options["titleFont"] = options["titleFont"] || "Arial";
  options["titleFontSize"] = options["titleFontSize"] || 30;
  options["titleColor"] = options["titleCOlor"] || "black";

  //Style variables that aren't included in the options input - adding them to the options object so it's easier to pass them down to helper functions later
  options["titlePadding"] = options["titlePadding"] || 10;
  options["axisFontSize"] = options["axisFontSize"] || 16;
  options["axisPadding"] = options["axisPadding"] || 10;
  options["axisLineWidth"] = options["axisLineWidth"] || 3;
  options["innerChartPadding"] = options["innerChartPadding"] || (.05 * options.width);
  options["fadeInOffset"] = options["fadeInOffset"] || 10;

  //Find the step size based on the biggest data bar and the number of divs.
  const yAxisStepSize = findStepSize(findMaxVal(data, debug), options.yDivs, debug);
  const maxChartValue = yAxisStepSize * options.yDivs;

  //Generate all the component divs of the chart.
  const $chartDivs = generateChartDivs(data, options, yAxisStepSize);

  //Insert all the divs into the page.
  insertDivs($chartDivs, element);

  //Make all the divs invisible.
  $chartDivs.container.children().animate({opacity : "0"}, 0);

  //Now let's work on sizing the divs.
  //First, calculate some values that will be used multiple times later
  const maxYLabelWidth = findYLabelMaxWidth($chartDivs.yAxisLabels, debug);
  const yAxisAndLabelWidth = maxYLabelWidth + $chartDivs.yAxis.outerHeight();

  //Dimensions are formed as follows: {xOffset, yOffset, width, height}
  //null indicates a dimension or position that will not be explicitly set.
  const dimensions = { };
  const titleDimensions = { "xOffset" : null,
    "yOffset" : ($chartDivs.container.innerHeight() - $chartDivs.title.outerHeight()),
    "width" : $chartDivs.container.innerWidth(),
    "height" : null
  };
  const xAxisDimensions = { "xOffset" : yAxisAndLabelWidth,
    "yOffset" : titleDimensions.yOffset - $chartDivs.xAxis.outerHeight(),
    "width" : $chartDivs.container.innerWidth() - yAxisAndLabelWidth,
    "height" : null
  };
  const innerChartDimensions = {"xOffset" : xAxisDimensions.xOffset,
    "yOffset" : null,
    "width" : xAxisDimensions.width,
    "height" : xAxisDimensions.yOffset - $chartDivs.xAxisLabels[0].outerHeight()
  };
  const yAxisDimensions = { "xOffset" : null,
  "yOffset" : innerChartDimensions.height,
  "width" : innerChartDimensions.height,
  "height" : null
  };
  const yAxisLabelDimensions = { "xOffset" : $chartDivs.yAxis.outerHeight(),
  "yOffset" : null,
  "width" : maxYLabelWidth,
  "height" : null
  };
  const yAxisDivDimensions = { "xOffset" : innerChartDimensions.xOffset,
  "yOffset" : -1 * (innerChartDimensions.height - options.axisLineWidth) / options.yDivs,
  "width" : innerChartDimensions.width,
  "height" : (innerChartDimensions.height - options.axisLineWidth) / options.yDivs
  };
  //The bar's x offset starts right next to the border (we have to do this calculation here since the inner chart has padding)
  const barDimensions = { "xOffset" : options.innerChartPadding,
  "bottom" : null,
  //Determine how wide each bar should be, given the number of bars, the spacing between them, and the amount of space inside the inner chart div.
  //Remember that the number of spaces will be equal to the number of bars minus one!
  "width" : (((innerChartDimensions.width - options.axisLineWidth - (options.innerChartPadding * 2)) - ((data.length - 1) * options.barSpacing)) / data.length) - options.barBorder * 2,
  "height" : null
  };
  //x axis labels should be centered on the bars, but the bars are positioned relative to the inner chart div, so we need to recalculate some things.
  //Start from the inner chart's x offset, add the border width (which is the difference between outerWidth and innerWidth), and then the offset we calculated for the bar.
  const xAxisLabelDimensions = { "xOffset" : innerChartDimensions.xOffset + options.axisLineWidth + (options.barSpacing / 2),
  "yOffset" : yAxisDimensions.yOffset,
  "width" : barDimensions.width + options.barSpacing,
  "height" : null
  };

  //One final position adjustment: everything that's going to fade in from the left needs to be scooted to the left by the proper amount.
  //The bars themselves don't need to be scooted, since they're contained inside the inner chart div.
  titleDimensions.xOffset -= options.fadeInOffset;
  innerChartDimensions.xOffset -= options.fadeInOffset;
  yAxisDimensions.xOffset -= options.fadeInOffset;
  yAxisLabelDimensions.xOffset -= options.fadeInOffset;
  xAxisLabelDimensions.xOffset -= options.fadeInOffset;

  //Positioning/animation order:
  //Inner chart appears fades in from left and "curtains" down
  //, title, and X/Y axes fade in from the left


  //At this point, nothing is visible. Let's get all our elements in position.
  setDimensionsAndOffset({ $element : $chartDivs.innerChart, dimensions : innerChartDimensions } );
  for (let i = options.yDivs; i >= 0; i--) {
    yAxisLabelDimensions.yOffset = (i * yAxisDivDimensions.height) - ($chartDivs.yAxisLabels[i].outerHeight() / 2);
    setDimensionsAndOffset( { $element : $chartDivs.yAxisLabels[i], dimensions : yAxisLabelDimensions } );
    //$yAxisStepDivs[] contains one less element than yDivs would indicate, so we need to skip that case or else we get an error.
    i !== options.yDivs ? setDimensionsAndOffset({ $element : $chartDivs.yAxisSteps[i], dimensions : yAxisDivDimensions }) : null;
  }
  setDimensionsAndOffset({ $element : $chartDivs.title, dimensions : titleDimensions });
  setDimensionsAndOffset({ $element : $chartDivs.yAxis, dimensions : yAxisDimensions });
  setDimensionsAndOffset({ $element : $chartDivs.xAxis, dimensions : xAxisDimensions });

  for (let i = 0; i < data.length; i++) {
    for (let j = data[i].values.length - 1; j >= 0; j--) {
      $chartDivs.bars[i][j].css("opacity", 1);
      setDimensionsAndOffset({ $element : $chartDivs.bars[i][j], dimensions : barDimensions});
    }
    setDimensionsAndOffset({ $element : $chartDivs.xAxisLabels[i], dimensions : xAxisLabelDimensions});
    barDimensions.xOffset += barDimensions.width + options.barSpacing + options.barBorder * 2;
    xAxisLabelDimensions.xOffset += barDimensions.width + options.barSpacing + options.barBorder * 2;
  }

  //Now we can animate them into their final positions!
  //First the inner chart (with the axis lines).
  //When it's complete, it calls the recursive animateYStepDivs function to animate the background sequentially.
  let animatingYDivs = $.Deferred();
  $chartDivs.innerChart.animate({ opacity : 1, left : `+=${options.fadeInOffset}` }, 400, function () {
    animateYStepDivs($chartDivs.yAxisSteps, yAxisDivDimensions, 0, animatingYDivs);
  } );
  $.when( animatingYDivs ).done( function() {
    $chartDivs.yAxis.animate({ opacity : 1, left: `+=${options.fadeInOffset}` });
    $chartDivs.xAxis.animate({ opacity : 1, left: `+=${options.fadeInOffset}` });
    $chartDivs.title.animate({ opacity : 1, left: `+=${options.fadeInOffset}` });
    for( let $label of $chartDivs.yAxisLabels ) {
      $label.animate({ opacity : 1, left: `+=${options.fadeInOffset}` });
    }
    for( let $label of $chartDivs.xAxisLabels ) {
      $label.animate({ opacity : 1, left: `+=${options.fadeInOffset}` });
    }

  });
  //Now the y axis steps...
/*   for (let i = 0; i < $yAxisStepDivs.length; i++) {
    yAxisDivDimensions.yOffset += yAxisDivDimensions.height;
    $yAxisStepDivs[i].animate({ top : yAxisDivDimensions.yOffset, opacity : 1 });
    setDimensionsAndOffset({ $element : $yAxisStepDivs[i], dimensions : yAxisDivDimensions });
  } */

/*   for (let i = 0; i < data.length; i++) {
    //Find the total value of the current bar.
    let barTotalAbsolute = data[i].values.reduce( (accumulator, currentValue) => accumulator + currentValue);
    //Convert that value to a pixel value based on the maximum value of the chart.
    let barTotalRelative = (barTotalAbsolute / maxChartValue) * $innerChartDiv.innerHeight();
    barDimensions.bottom = 0;
    for (let j = data[i].values.length - 1; j >= 0; j--) {
      barDimensions.height = ((data[i].values[j] / barTotalAbsolute) * barTotalRelative) - options.barBorder;
      setDimensionsAndOffset({ $element : $barDivs[i][j], dimensions : barDimensions});
      barDimensions.bottom += barDimensions.height + options.barBorder;
    }
    setDimensionsAndOffset({ $element : $xAxisLabelDivs[i], dimensions : xAxisLabelDimensions});
    barDimensions.xOffset += barDimensions.width + options.barSpacing + options.barBorder * 2;
    xAxisLabelDimensions.xOffset += barDimensions.width + options.barSpacing + options.barBorder * 2;
  } */

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
};

/********************************************************
Creates all chart divs and returns an object containing them.
********************************************************/
const generateChartDivs = function (data, options, yAxisStepSize) {
  let $divs = { };
  $divs["container"] = $("<div>", {"class" : "chart-container", "style" : `width: ${options.width}; height: ${options.height}`});
  $divs["title"] = $("<div>", {"class" : "title-container", "style" : `color : ${options.titleColor}; font-family : ${options.titleFont}; font-size:${options.titleFontSize}; padding:${options.titlePadding}`}).text(`${options.title}`);
  $divs["xAxis"] = $("<div>", {"class" : "x-axis", "style" : `padding: ${options.axisPadding}`}).text(`${options.xLabel}`);
  $divs["yAxis"] = $("<div>", {"class" : "y-axis", "style" : `padding: ${options.axisPadding}`}).text(`${options.yLabel}`);
  $divs["yAxisLabels"] = [];
  $divs["yAxisSteps"] = [];
  for (i = options.yDivs; i >= 0; i--) {
    $divs["yAxisLabels"].push($("<div>", {"class" : "y-axis-label", "style" : "text-align: center; padding-right: 5;"}).text(`${yAxisStepSize*i}`));
  }
  for (i = 0; i < options.yDivs; i++) {
    $divs["yAxisSteps"].push($("<div>", {"class" : "y-axis-step", "style" : `border-style: solid none none none; border-width: 1px; z-index: -${i}`}));
  }
  $divs["xAxisLabels"] = [];
  for (let bar of data) {
    $divs["xAxisLabels"].push($("<div>", {"class" : "x-axis-label", "style" : `margin-top: 5px; background-color: ${bar.labelColor || "none"}`}).text(`${bar.label}`));
  }
  $divs["innerChart"] = $("<div>", {"style" : `z-index: 1; border-style: none none solid solid; border-width: ${options.axisLineWidth}; padding-left: ${options.innerChartPadding}; padding-right: ${options.innerChartPadding}`});
  //Note that here, we create all the bar divs and also a nested div to hold the value of the bar.
  $divs["bars"] = [];
  for (let bar of data) {
    let currentBar = []
    for (let i = 0; i < bar.values.length; i++) {
      currentBar.push($("<div>", {"class" : "data-bar",
        "style" : `background-color: ${bar.barColors[i] || bar.barColors[0]}; align-items: ${options.barValueAlignment}; border-style: solid solid none; border-width: ${options.barBorder}`
      }));
      currentBar[currentBar.length - 1].append($("<div>", {"class" : "data-bar-value"}).text(`${options.hideBarValues ? "" : bar.values[i]}`));
    }
    $divs["bars"].push(currentBar);
  }

  return $divs;
}

/********************************************************
Inserts all divs into the target element.
********************************************************/
const insertDivs = function ($divs, target) {
  //$chartDivs.bars must be inserted separately since it's an array of arrays, which jQuery doesn't handle well.
  for (let div in $divs) {
    div !== "container" && div !== "bars" ? $divs.container.append($divs[`${div}`]) : null;
  }
  for (let bar of $divs.bars) {
    $divs.innerChart.append(bar);
  }

  target.append($divs.container);
}

/********************************************************
Set the dimensions of all divs.
********************************************************/
const initializeDimensions = function () {
  let dimensions = {};

  return dimensions;
}

/********************************************************
Set the dimensions and offset of the input element.
The dimensions{} input can be a full set of dimensions or a single value from the dimensions.
At least, I'm pretty sure that should work. TODO: delete this line if it works.
********************************************************/
const setDimensionsAndOffset = function ({ $element, dimensions }) {
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
    dimensions["xOffset"] ? $element.css("left", dimensions["xOffset"]) : null;
    dimensions["bottom"] ? $element.css({ "bottom" : dimensions["bottom"]}) : null;
    dimensions["yOffset"] ? $element.css("top", dimensions["yOffset"]) : null;
    dimensions["width"] ? $element.outerWidth(dimensions["width"]) : null;
    dimensions["height"] ? $element.outerHeight(dimensions["height"]) : null;
}

/********************************************************
//Recursive helper function to animate the y step divs in a sequential cascade from the top of the chart.
********************************************************/
const animateYStepDivs = function (yDivArray, dimensions, i, d1) {
  if (i < yDivArray.length) {
    dimensions.yOffset += dimensions.height;
    yDivArray[i+1] ? yDivArray[i+1].css("top", dimensions.yOffset) : null;
    yDivArray[i].animate({ top : dimensions.yOffset, opacity : 1 }, (500/yDivArray.length), "swing", function () { animateYStepDivs(yDivArray, dimensions, i+1, d1) });
  } else {
    return d1.resolve();
  }
}

/********************************************************
//Helper function to find the height of the largest bar (or set of bar segments)
********************************************************/
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

/********************************************************
//Helper function to find the widest label of the Y axis.
********************************************************/
const findYLabelMaxWidth = function(yLabels, debug = false) {
  let maxWidth = 0;
  for (let label of yLabels) {
    maxWidth = label.outerWidth() > maxWidth ? label.outerWidth() : maxWidth;
    debug ? console.log(`findYLabelMaxWidth: current max value is ${maxWidth}`) : null;
  }
  return maxWidth;
};

/********************************************************
//Helper function to find a nice-ish number for the step size of the chart,
//based on the maximum value of the chart and the number of division lines ("steps") you want.
********************************************************/
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
