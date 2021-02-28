$(document).ready(function() {
  let debugMode = true; //TODO: Make a better debug mode, possibly a box that can be checked on the main page, and then you click a button to reload charts instead of refreshing

  let options = {
    width: 600,
    height: 500,
    yDivs: 4,
    barSpacing: 30,
    animation: true,
  }

  let data = [
    {values: [25, 25, 25, 25], label: "Barts", barColors: ["green"], labelColor: "none"},
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
  options["hideBarValues"] = options["hideBarValues"]; //Automatically defaults to "false" if options["hideBarValues"] doesn't exist.
  options["barValueAlignment"] = options["barValueAlignment"] ? barAlignmentOptionStrings[options["barValueAlignment"]] : "center";
  options["xLabel"] = options["xLabel"] || "X Axis";
  options["yLabel"] = options["yLabel"] || "Y Axis";
  options["axisFont"] = options["axisFont"] || "Helvetica";
  options["yDivs"] = options["yDivs"] || 4;
  options["title"] = options["title"] || "My Untitled Chart";
  options["titleFont"] = options["titleFont"] || "Arial";
  options["titleFontSize"] = options["titleFontSize"] || 30;
  options["titleColor"] = options["titleCOlor"] || "black";
  options["animation"] = options["animation"] === undefined ? true : options["animation"]; //Automatically defaults to "true" if options["noAnimation"] doesn't exist.

  //Style variables that aren't included in the options input - adding them to the options object so it's easier to pass them down to helper functions later
  options["titlePadding"] = options["titlePadding"] || 10;
  options["axisFontSize"] = options["axisFontSize"] || 16;
  options["axisPadding"] = options["axisPadding"] || 10;
  options["axisLineWidth"] = options["axisLineWidth"] || 3;
  options["innerChartPadding"] = options["innerChartPadding"] || (.05 * options.width);
  options["fadeInOffset"] = options["fadeInOffset"] || 10;

  //Find the step size based on the biggest data bar and the number of divs.
  const yAxisStepSize = findStepSize(findMaxVal(data, debug), options.yDivs, debug);

  //Generate all the component divs of the chart.
  const $chartDivs = generateChartDivs(data, options, yAxisStepSize);

  //Insert all the divs into the page.
  insertDivs($chartDivs, element);

  //Set all the initial dimensions, ignoring animation.
  const dimensions = initializeDimensions(data, options, $chartDivs, debug);

  //If we're animating, make some dimension adjustments and make everything invisible.
  options.animation ? adjustDimensionsForAnimation(dimensions, options) : null;
  options.animation ? $chartDivs.container.children().animate({opacity : "0"}, 0) : null;

  //Position every div with its current dimensions.
  positionDivs(data, options, $chartDivs, dimensions);

  //Now we can animate them into their final positions!
  options.animation ? animateChart($chartDivs, dimensions, options) : null;
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
      currentBar.push($("<div>", {
        "class" : "data-bar",
        "style" : `background-color: ${bar.barColors[i] || bar.barColors[0]};
          align-items: ${options.barValueAlignment};
          border-style: solid solid none;
          border-width: ${options.barBorder}`
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
const initializeDimensions = function (chartData, chartOptions, $divs, debug = false) {
  //First, calculate some values that will be used multiple times later
  const maxYLabelWidth = findYLabelMaxWidth($divs.yAxisLabels, debug);
  const yAxisAndLabelWidth = maxYLabelWidth + $divs.yAxis.outerHeight();

  //Dimensions are formed as follows: {xOffset, yOffset, width, height}
  //null indicates a dimension or position that will not be explicitly set.
  const dimensionsObject = { };
  dimensionsObject["title"] = { "xOffset" : null,
    "yOffset" : ($divs.container.innerHeight() - $divs.title.outerHeight()),
    "width" : $divs.container.innerWidth(),
    "height" : null
  };
  dimensionsObject["xAxis"] = { "xOffset" : yAxisAndLabelWidth,
    "yOffset" : dimensionsObject.title.yOffset - $divs.xAxis.outerHeight(),
    "width" : $divs.container.innerWidth() - yAxisAndLabelWidth,
    "height" : null
  };
  dimensionsObject["innerChart"] = {"xOffset" : dimensionsObject.xAxis.xOffset,
    "yOffset" : null,
    "width" : dimensionsObject.xAxis.width,
    "height" : dimensionsObject.xAxis.yOffset - $divs.xAxisLabels[0].outerHeight()
  };
  dimensionsObject["yAxis"] = { "xOffset" : null,
  "yOffset" : dimensionsObject.innerChart.height,
  "width" : dimensionsObject.innerChart.height,
  "height" : null
  };
  dimensionsObject["yAxisLabels"] = [];
  dimensionsObject["yAxisDivs"] = [];
  dimensionsObject["xAxisLabels"] = [];
  dimensionsObject["bars"] = [[]];

  //Generate the dimensions for y axis divs and y axis labels.
  const yAxisDivHeight = (dimensionsObject.innerChart.height - chartOptions.axisLineWidth) / chartOptions.yDivs;
  for (let i = 0; i <= chartOptions.yDivs; i++) {
    dimensionsObject.yAxisLabels.push({ "xOffset" : $divs.yAxis.outerHeight(),
      "yOffset" : (i * yAxisDivHeight) - ($divs.yAxisLabels[i].outerHeight() / 2),
      "width" : maxYLabelWidth,
      "height" : null
    });
    i < chartOptions.yDivs ? dimensionsObject.yAxisDivs.push({ "xOffset" : dimensionsObject.innerChart.xOffset,
      "yOffset" : i * yAxisDivHeight,
      "width" : dimensionsObject.innerChart.width,
      "height" : yAxisDivHeight
    }) : null;
  }


  //Calculate some values we'll use later for dimensions and positioning.
  const maxChartValue = findStepSize(findMaxVal(chartData), chartOptions.yDivs) * chartOptions.yDivs;
  const barOffsetStart = chartOptions.innerChartPadding;
  const labelOffsetStart = (dimensionsObject.innerChart.xOffset + chartOptions.axisLineWidth + (chartOptions.barSpacing / 2));

  //Determine how wide each bar should be, given the number of bars, the spacing between them, and the amount of space inside the inner chart div.
  //Remember that the number of spaces will be equal to the number of bars minus one!
  let barWidth = (((dimensionsObject.innerChart.width - chartOptions.axisLineWidth - (chartOptions.innerChartPadding * 2)) - ((chartData.length - 1) * chartOptions.barSpacing)) / chartData.length)
  let barOffsetIncrement = barWidth + chartOptions.barSpacing;
  const labelWidth = barWidth + chartOptions.barSpacing;



  for( let i = 0; i < chartData.length; i++) {
    dimensionsObject.bars.push([])
    //Find the total value of the current bar.
    let barTotalAbsolute = chartData[i].values.reduce( (accumulator, currentValue) => accumulator + currentValue);
    //Convert that value to a pixel value based on the maximum value of the chart.
    let barTotalRelative = (barTotalAbsolute / maxChartValue) * (dimensionsObject.innerChart.height - chartOptions.axisLineWidth);

    dimensionsObject.xAxisLabels.push ({ "xOffset" : labelOffsetStart + (i * labelWidth),
      "yOffset" : dimensionsObject.yAxis.yOffset,
      "width" : labelWidth,
      "height" : null
    });
    for (let j = 0; j < chartData[i].values.length; j++) {
      dimensionsObject.bars[i].push({
        "xOffset" : barOffsetStart + (i * barOffsetIncrement),
        "width" : barWidth,
        "bottom" : j === 0 ? 0 : dimensionsObject.bars[i][j-1].bottom + dimensionsObject.bars[i][j-1].height,
        "height" : (chartData[i].values[j] / barTotalAbsolute) * barTotalRelative
      });


    }
  }

  return dimensionsObject;
}

/********************************************************
Adjusts dimensions for animating later.
********************************************************/
const adjustDimensionsForAnimation = function (dimensionsObject, chartOptions) {
  //For all the elements that fade in from the side, scoot them to their starting position.
  //The bar divs are contained within the innerChart div, so they'll move with it.
  dimensionsObject.title.xOffset -= chartOptions.fadeInOffset;
  dimensionsObject.innerChart.xOffset -= chartOptions.fadeInOffset;
  dimensionsObject.yAxis.xOffset -= chartOptions.fadeInOffset;
  for (let label of dimensionsObject.yAxisLabels) {
    label.xOffset -= chartOptions.fadeInOffset;
  }
  for (let label of dimensionsObject.xAxisLabels) {
    label.xOffset -= chartOptions.fadeInOffset;
  }

  //Since the y axis steps cascade in from the top, start their offset above the actual chart area.
  for (let div of dimensionsObject.yAxisDivs) {
    div.yOffset = -1 * (dimensionsObject.innerChart.height - chartOptions.axisLineWidth) / chartOptions.yDivs;
  }

  for (let i = 0; i < dimensionsObject.bars.length; i++) {
    for (let j = 0; j < dimensionsObject.bars[i].length; j++) {
      //For all the bars, we set a new key: targetHeight, which is the value they'll animate towards.
      //We have to compensate for the border manually, since we can't animate an "outerHeight" value.
      //We set the height to 0 afterwards, so that the bars will start at nothing and grow towards their proper height.
      dimensionsObject.bars[i][j]["targetHeight"] = dimensionsObject.bars[i][j].height - chartOptions.barBorder;
      dimensionsObject.bars[i][j].height = 0;
    }
  }
}

/********************************************************
Position all divs at the given dimensions.
********************************************************/
const positionDivs = function (data, options, $chartDivs, dimensions) {

  setElementDimensions($chartDivs.innerChart, dimensions.innerChart);
  for (let i = options.yDivs; i >= 0; i--) {
    setElementDimensions($chartDivs.yAxisLabels[i], dimensions.yAxisLabels[i]);
    //$yAxisStepDivs[] contains one less element than yDivs would indicate, so we need to skip that case or else we get an error.
    i !== options.yDivs ? setElementDimensions($chartDivs.yAxisSteps[i], dimensions.yAxisDivs[i]) : null;
  }
  setElementDimensions($chartDivs.title, dimensions.title);
  setElementDimensions($chartDivs.yAxis, dimensions.yAxis);
  setElementDimensions($chartDivs.xAxis, dimensions.xAxis);


  //Set all the positions of the bars and their labels.
  for (let i = 0; i < data.length; i++) {
    for (let j = data[i].values.length - 1; j >= 0; j--) {
      setElementDimensions($chartDivs.bars[i][j], dimensions.bars[i][j]);
    }
    setElementDimensions($chartDivs.xAxisLabels[i], dimensions.xAxisLabels[i]);
  }



/*   for (let i = 0; i < data.length; i++) {

    dimensions.bars.bottom = 0;
    for (let j = data[i].values.length - 1; j >= 0; j--) {
      setElementDimensions($chartDivs.bars[i][j], { height : dimensions.bars.height, bottom : dimensions.bars.bottom });

    }
  }
 */
}

/********************************************************
Animates the chart.
********************************************************/
const animateChart = function ($chartDivs, dimensions, options) {

  //Set up some flags to help our animations run sequentially.
  let animatingInnerChart = $.Deferred();
  let animatingYDivs = $.Deferred();
  let animatingCentralDivs = $.Deferred();
  let animatingBars = $.Deferred();
  $( ".data-bar").css("opacity", 0);
  $( ".data-bar-value").css("opacity", 0);
  $chartDivs.innerChart.animate({ opacity : 1, left : `+=${options.fadeInOffset}` }, 400, function () {
    animatingInnerChart.resolve();
  } );
  $.when( animatingInnerChart ).done( function() {
    console.log(`Animating y step divs...`);
    animateYStepDivs($chartDivs.yAxisSteps, dimensions.yAxisDivs, animatingYDivs, 0);
  });
  $.when( animatingYDivs ).done( function() {
    for( let $label of $chartDivs.yAxisLabels ) {
      $label.animate({ opacity : 1, left: `+=${options.fadeInOffset}` });
    }
    for( let $label of $chartDivs.xAxisLabels ) {
      $label.animate({ opacity : 1, left: `+=${options.fadeInOffset}` });
    }
    $chartDivs.xAxis.animate({ opacity : 1, left: `+=${options.fadeInOffset}` });
    $chartDivs.yAxis.animate({ opacity : 1, left: `+=${options.fadeInOffset}` });
    $chartDivs.title.animate({ opacity : 1, left: `+=${options.fadeInOffset}` }, function () { animatingCentralDivs.resolve() });
  });
  $.when( animatingCentralDivs ).done( function() {
    animateBars ($chartDivs.bars, dimensions.bars, animatingBars);
  });
  $.when( animatingBars ).done( function() {

  })
}

/********************************************************
Set the dimensions and offset of the input element.
The dimensions{} input can be a full set of dimensions or a single value from the dimensions.
At least, I'm pretty sure that should work. TODO: delete this line if it works.
********************************************************/
const setElementDimensions = function ($element, dimensions) {
  //Check for nonexistent or empty $element and dimensions inputs.
  if (!$element) {
    console.log(Error('No $element given to setElementDimensions'));
    return false;
  }
  if (!dimensions) {
    console.log(Error('No dimensions object given to setElementDimensions'));
    return false;
  }
  if (!Object.values(dimensions).length) {
    console.log(Error('Empty dimensions object given to setElementDimensions'));
    return false;
  }
    dimensions["xOffset"] ? $element.css("left", dimensions["xOffset"]) : null;
    dimensions["bottom"] ? $element.css({ "bottom" : dimensions["bottom"]}) : null;
    dimensions["yOffset"] ? $element.css("top", dimensions["yOffset"]) : null;
    dimensions["width"] ? $element.outerWidth(dimensions["width"]) : null;
    dimensions["height"] ? $element.outerHeight(dimensions["height"]) : null;
}

/********************************************************
Recursive helper function to animate the y step divs in a sequential cascade from the top of the chart.
********************************************************/
const animateYStepDivs = function ($yDivArray, dimensionsArray, completionFlag, i = 0) {
  if (i < $yDivArray.length) {$
    dimensionsArray[i].yOffset = (i * dimensionsArray[i].height);
    $yDivArray[i+1] ? $yDivArray[i+1].css("top", dimensionsArray[i].yOffset) : null;
    $yDivArray[i].animate({ top : dimensionsArray[i].yOffset, opacity : 1 },
      (500/$yDivArray.length),
      "swing",
      function () { animateYStepDivs($yDivArray, dimensionsArray, completionFlag, i+1) }
    );
  } else {
    return completionFlag.resolve();
  }
}

/********************************************************
Recursive helper function to animate the bars to their target height.
********************************************************/
const animateBars = function ($barsArray, barDimensionsArray, completionFlag, i = 0, j = 0) {
  if (i < $barsArray.length) {
    console.log(`animating bar ${i}`);
    if (j < $barsArray[i].length) {
      console.log(`animating segment ${j} of bar ${i}`);
      $barsArray[i][j].animate({ opacity : 1 }, 0);
      $barsArray[i][j].animate({ height: barDimensionsArray[i][j].targetHeight },
        400/$barsArray[i].length,
        function () { animateBars($barsArray, barDimensionsArray, completionFlag, i, j+1) }
      );
    } else {
      animateBars($barsArray, barDimensionsArray, completionFlag, i+1);
    }

  } else {
    return completionFlag.resolve();
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
