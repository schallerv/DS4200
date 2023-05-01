const FRAME_HEIGHT = 500;
const FRAME_WIDTH = 500; 
const MARGINS = {left: 50, right: 50, top: 50, bottom: 50};

const VIS_HEIGHT = FRAME_HEIGHT - MARGINS.top - MARGINS.bottom;
const VIS_WIDTH = FRAME_WIDTH - MARGINS.left - MARGINS.right; 

const X_SCALE = d3.scaleLinear() 
                      .domain([0, 10]) // padding
                      .range([0, VIS_WIDTH]); 

const Y_SCALE = d3.scaleLinear() 
                      .domain([(10), 0]) // padding  
                      .range([0, VIS_HEIGHT]); 

const SCATTER = d3.select("#vis-scatter")
                  .append("svg")
                    .attr("height", FRAME_HEIGHT)
                    .attr("width", FRAME_WIDTH)
                    .attr("class", "frame"); 

// read data and create plot
d3.csv("data/scatter-data.csv").then((data) => {

     // plot points
     SCATTER.selectAll("points")  
      .data(data) // passed from .then  
      .enter()       
      .append("circle")  
        .attr("cx", (d) => { return (X_SCALE(d.x) + MARGINS.left); }) 
        .attr("cy", (d) => { return (Y_SCALE(d.y) + MARGINS.bottom); }) 
        .attr("r", 10)
        .attr("class", "point"); 

    // Add x axis to vis  
    SCATTER.append("g") 
        .attr("transform", "translate(" + MARGINS.left + 
              "," + (VIS_HEIGHT + MARGINS.top) + ")") 
        .call(d3.axisBottom(X_SCALE).ticks(4)) 
          .attr("font-size", '20px'); 

    // Add y axis to vis  
    SCATTER.append("g") 
        .attr("transform", "translate(" + MARGINS.left + 
              "," + (MARGINS.top) + ")") 
        .call(d3.axisLeft(Y_SCALE).ticks(4)) 
          .attr("font-size", '20px'); 

    setup_border()
}); 


// read data and create plot
d3.csv("data/scatter-data.csv").then((data) => {

});

function submitClicked() {
    
    // getting selected x value from drop down
    let x_coord = document.getElementById("x");
    let selected_x = x_coord.options[x_coord.selectedIndex].value;

    // getting selected y value from drop down
    let y_coord = document.getElementById("y");
    let selected_y = y_coord.options[y_coord.selectedIndex].value;

    //calling function to add point
    addPoint(selected_x, selected_y);
}

function addPoint(x, y) {

    //add point
    SCATTER.append("circle")
            .attr("cx", (d) => { return (X_SCALE(x) + MARGINS.left); }) 
            .attr("cy", (d) => { return (Y_SCALE(y) + MARGINS.bottom); }) 
            .attr("r", 10)
            .attr("class", "point"); 

    // after adding a new point it adds event listener to it
    setup_border()
}

// Add event handler to button 
document.getElementById("subButton").addEventListener('click', submitClicked);


function toggleBorder() {

    // toggles the border on an off for each time it is clicked 
    this.classList.toggle('borderPoint');

    // get the coordinates of the point from the attributes
    let x_coord = Math.round((X_SCALE.invert(this.getAttribute("cx") - MARGINS.left)), 0);
    let y_coord = Math.round((Y_SCALE.invert(this.getAttribute("cy") - MARGINS.top)), 0); 

    // generate the text for display
    let text = "The coordinates of the last clicked point are (" + x_coord + "," + y_coord + ")";

    // add text to the coords div on the right
    document.getElementById('coords').innerHTML = text;
}

function setup_border() {
    
//  Add event handler to points  
    let pts = document.getElementsByClassName("point");

    for(i = 0; i < pts.length; i++) {
        pts[i].addEventListener("click", toggleBorder)}; 

}

// Set up the event listeners intially 
setup_border()


// Bar Chart 
const BAR = d3.select("#vis-bar")
                  .append("svg")
                    .attr("height", FRAME_HEIGHT)
                    .attr("width", FRAME_WIDTH)
                    .attr("class", "frame"); 


function build_interatctive_plot() {
    // read data and create plot
    d3.csv("data/bar-data.csv").then((data) => {

    // scale for X
    const X_SCALE2 = d3.scaleBand() 
                      .domain(["A", "B", "C", "D", "E", "F", "G"]) 
                      .range([0, 400])
                      .paddingInner(0.1)
                      .paddingOuter(0.30); 

    // sclae for Y
    const Y_SCALE2 = d3.scaleLinear() 
                      .domain([100, 0]) // max is 99 so some padding  
                      .range([0, VIS_WIDTH]); 

    // plot our points
    BAR.selectAll("bar")  
        .data(data) // passed from .then  
        .enter()     
        .append("rect")  
            .attr("x", (d) => { return ((X_SCALE2(d.category)) + MARGINS.left); }) 
            .attr("y", (d) => { return (Y_SCALE2(d.amount) + MARGINS.top); }) 
            .attr("width", X_SCALE2.bandwidth())
            .attr("height", (d) => { return VIS_HEIGHT - Y_SCALE2(d.amount); })
            .attr("class", "bar"); 

     // Tooltip
    const TOOLTIP = d3.select("#left")
                        .append("div")
                          .attr("class", "tooltip")
                          .style("opacity", 0); 

    // Define event handler functions for tooltips
    function handleMouseover(event, d) {
      // on mouseover, make opaque 
      TOOLTIP.style("opacity", 1);       
    }

    function handleMousemove(event, d) {
      // position the tooltip and fill in information 
      TOOLTIP.html("Category: " + d.category + "<br>Value: " + d.amount)
              .style("left", (event.pageX + 10) + "px") //add offset
                                                          // from mouse
              .style("top", (event.pageY - 50) + "px"); 
    }

    function handleMouseleave(event, d) {
      // on mouseleave, make transparant again 
      TOOLTIP.style("opacity", 0); 
    } 

    // Add event listeners
    BAR.selectAll(".bar")
          .on("mouseover", handleMouseover) //add event listeners
          .on("mousemove", handleMousemove)
          .on("mouseleave", handleMouseleave);  

     // Add an axis to the vis 
    BAR.append("g") 
        .attr("transform", "translate(" + MARGINS.left + 
                "," + (VIS_HEIGHT + MARGINS.top) + ")") 
        .call(d3.axisBottom(X_SCALE2))
          .attr("font-size", '20px'); 

    BAR.append("g") 
        .attr("transform", "translate(" + MARGINS.bottom + 
              "," + (VIS_WIDTH - 7 * MARGINS.left) + ")") 
        .call(d3.axisLeft(Y_SCALE2).ticks(4)) 
          .attr("font-size", '20px'); 
    });
}

// initalize bar plot
build_interatctive_plot()


