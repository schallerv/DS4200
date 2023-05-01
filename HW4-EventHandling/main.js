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

    // calculating the new x and new y
    let new_x = 100 + (30 * x);
    let new_y = 350 - (30 * y);

    // creating the newPoint and setting attributes
    const newPoint = document.createElementNS('http://www.w3.org/2000/svg', "circle");
    newPoint.setAttribute("cx", new_x);
    newPoint.setAttribute("cy", new_y);
    newPoint.setAttribute("r", '10px');
    newPoint.classList.add("point");
    
    // adding newPoint to the svg
    document.querySelector("svg").appendChild(newPoint);

    // after adding a new point it adds event listener to it
    setup_border()
}

// Add event handler to button 
document.getElementById("subButton").addEventListener('click', submitClicked);


function toggleBorder() {

    // toggles the border on an off for each time it is clicked 
    this.classList.toggle('borderPoint');

    // get the coordinantes of the point from the attributes
    let x_coord = (this.getAttribute("cx") - 100) / 30;
    let y_coord = (350 - this.getAttribute("cy")) / 30; 

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
