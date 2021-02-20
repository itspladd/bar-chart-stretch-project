$(document).ready(function() {
  $( "button" ).click(function( event ) {

    drawBarChart(1,2,3);

  });
  //alert("JQuery loaded properly!");
});


const drawBarChart = function (data, options, element) {
  //Expects an array of arrays for data, and object for options, and a DOM or jQuery element for element
  //The bar charts will be built out of a stack of divs within another div.
  alert( "Wow! The chart is already done! That was so easy!" );

}
