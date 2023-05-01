// code for detail graph and info box

//global constants for detail vis info box
const DetailDateFormat = d3.timeFormat("%-m/%-d/%Y");

// constants for plot design
const DetailFrameHeight = 375;
const DetailFrameWidth = 550; 
const DetailMargins = {left: 65, right: 25, top: 25, bottom: 25};

const DetailVisHeight = DetailFrameHeight - DetailMargins.top - DetailMargins.bottom;
const DetailVisWidth = DetailFrameWidth - DetailMargins.left - DetailMargins.right; 

//constants for indicator header
const ITextCPI = "CPI";
const ITextPPI = "PPI";
const ITextURate = "Unemployment Rate";
const ITextUClaims = "Unemployment Claims";
const ITextPayrolls = "Payrolls";

//constants for the indicator information
const InfoTextCPI = "The Consumer Price Index is a price index of a basket of goods and services paid by consumers. Percent changes in the price index measure the inflation rate between any two time periods. The most common inflation metric is the percent change from one year ago. It can also represent the buying habits of consumers. CPIs are based on prices for food, clothing, shelter, and fuels; transportation fares; and sales taxes. CPI can be used to recognize periods of inflation and deflation. Significant increases in the CPI within a short time frame might indicate a period of inflation, and significant decreases in CPI within a short time frame might indicate a period of deflation.";
const InfoTextPPI = "The Producer Price Index is a family of indexes that measures the average change over time in selling prices received by domestic producers of goods and services from the perspective of the seller. There are three main PPI classification structures: industry classification (a measure of changes in industry's net), commodity classification (organizes products and services by similarity or material composition, regardless of the industry classification), and Commodity-based Final Demand-Intermediate Demand (FD-ID) System (Commodity-based FD-ID price indexes regroup commodity indexes according to the type of buyer and the amount of physical processing the products have undergone).";
const InfoTextURate = "The unemployment rate represents the number of unemployed as a percentage of the labor force. Labor force data are restricted to people 16 years of age and older, who currently reside in 1 of the 50 states or the District of Columbia, who do not reside in institutions (e.g., penal and mental facilities, homes for the aged), and who are not on active duty in the Armed Forces. This rate is also defined as the U-3 measure of labor underutilization.";
const InfoTextUClaims = "An initial claim is a claim filed by an unemployed individual after a separation from an employer. The claim requests a determination of basic eligibility for the Unemployment Insurance program.";
const InfoTextPayrolls = "All Employees: Total Nonfarm, commonly known as Total Nonfarm Payroll, is a measure of the number of U.S. workers in the economy that excludes proprietors, private household employees, unpaid volunteers, farm employees, and the unincorporated self-employed. This measure accounts for approximately 80 percent of the workers who contribute to Gross Domestic Product (GDP). This measure provides useful insights into the current economic situation because it can represent the number of jobs added or lost in an economy. Increases in employment might indicate that businesses are hiring which might also suggest that businesses are growing.";

function MakeDetailVis(index) {
  // reading in the data
  d3.csv("data/NoNullsData.csv",
  function(d){
    return { DATE : d3.timeParse("%-m/%-d/%Y")(d.DATE), 
            Payrolls : +d.Payrolls,
            CPI : +d.CPI,
            UClaims : +d.UClaims,
            PPI : +d.PPI,
            URate : +d.URate}
  }
  ).then((data) => {

    // getting max values for indicators 
    const MaxPayroll = d3.max(data, (d) => { return d.Payrolls; });
    const MaxCPI = d3.max(data, (d) => { return d.CPI; });
    const MaxPPI = d3.max(data, (d) => { return d.PPI; });
    const MaxURate = d3.max(data, (d) => { return d.URate; });
    const MaxUClaims = d3.max(data, (d) => { return d.UClaims; });
    
    //getting dates and date range
    const dates = [];
    for (let obj of data) {
      dates.push(obj.DATE);
    }
    const domain = d3.extent(data, (d) => d.DATE);

    // setting x scale and axis (used regardless of indicator)
    const DetailXScale = d3.scaleTime() 
                      .domain(domain) 
                      .range([0, DetailVisWidth]); 

    // setting constants for each indicator
    const PayrollYScale = d3.scaleLinear() 
                      .domain([MaxPayroll, 0])  
                      .range([0, DetailVisHeight]); 
    
    const URateYScale = d3.scaleLinear() 
                      .domain([MaxURate, 0])  
                      .range([0, DetailVisHeight]); 
                      
    const UClaimsYScale = d3.scaleLinear() 
                      .domain([MaxUClaims, 0])  
                      .range([0, DetailVisHeight]); 
    
    const PPIYScale = d3.scaleLinear() 
                      .domain([MaxPPI, 0])  
                      .range([0, DetailVisHeight]); 

    const CPIYScale = d3.scaleLinear() 
                      .domain([MaxCPI, 0])  
                      .range([0, DetailVisHeight]); 

    //adding svg
    const DetailGraph = d3.select("#detailgraph")
                    .append("svg")
                      .attr("id", "detail")
                      .attr("height", DetailFrameHeight)
                      .attr("width", DetailFrameWidth)
                      .attr("class", "frame"); 

    // adding x axis
    DetailGraph.append("g") 
       .attr("transform", "translate(" + DetailMargins.left + 
         "," + (DetailVisHeight + DetailMargins.top) + ")") 
       .call(d3.axisBottom(DetailXScale).ticks(8)) 
       .attr("font-size", '10px'); 

    // check for payroll, plot if true
    if (index == 0) {
      const DetailLine = DetailGraph.append('path')
                                 .datum(data)
                                 .attr("d", d3.line()
                                     .x((d) => {return DetailMargins.left + DetailXScale(d.DATE)})
                                     .y((d) => {return PayrollYScale(d.Payrolls) + DetailMargins.top}))
                                 .attr("class", "Payroll");

      // add a DetailTooltip to the visualization
      const DetailDetailTooltip = d3.select("#detailgraph")
                        .append("div")
                        .attr("class", "tooltip")
                        .style("opacity", 0);                           
                        
      function mouseMove(event, d) {
        let currentClass = this.classList;
        let date = dateFormat(DetailXScale.invert(event.offsetX - DetailMargins.left));
        let value = Math.abs(PayrollYScale.invert(event.offsetY - DetailMargins.top));
      
        DetailDetailTooltip.html("Date: " + date + "</br>" + "Value: " + d3.format(",.0f")(value))
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 50) + "px")
                .style("background-color", "gray");
      };


      function mouseOver(event, d) {
        DetailDetailTooltip.style("opacity", 100);
      };


      function mouseLeave(event, d) {
        DetailDetailTooltip.style("opacity", 0);
      };

      DetailGraph.selectAll(".Payroll")
        .on("mouseover", mouseOver)
        .on("mousemove", mouseMove)
        .on("mouseleave", mouseLeave);
 

      // Add y axis to vis  
      const DetailYAxis = DetailGraph.append("g") 
                            .attr("transform", "translate(" + DetailMargins.left + 
                              "," + (DetailMargins.top) + ")") 
                            .call(d3.axisLeft(PayrollYScale).ticks(4))
                            .attr("font-size", '10px'); 

      // Add y axis labels to vis  
      DetailYAxis.append("text")
        .attr("class", "y-axis-label")
        .attr("x", - DetailVisHeight / 2)
        .attr("y", - DetailMargins.left / 2 - 20)
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text("Thousands of Persons");
    };

    // check for urate, plot if true
    if (index == 1) {
      const DetailLine = DetailGraph.append('path')
                                 .datum(data)
                                 .attr("d", d3.line()
                                     .x((d) => {return DetailMargins.left + DetailXScale(d.DATE)})
                                     .y((d) => {return URateYScale(d.URate) + DetailMargins.top}))
                                 .attr("class", "Unemployment_Rate"); 

      const DetailDetailTooltip = d3.select("#detailgraph")
                        .append("div")
                        .attr("class", "tooltip")
                        .style("opacity", 0);                           
                        
      function mouseMove(event, d) {
        let currentClass = this.classList;
        let date = dateFormat(DetailXScale.invert(event.offsetX - DetailMargins.left));
        let value = Math.abs(URateYScale.invert(event.offsetY - DetailMargins.top));
      
        DetailDetailTooltip.html("Date: " + date + "</br>" + "Value: " + d3.format("0.2%")(value / 100))
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 50) + "px")
                .style("background-color", "gray");
      };

      function mouseOver(event, d) {
        DetailDetailTooltip.style("opacity", 100);
      };

      function mouseLeave(event, d) {
        DetailDetailTooltip.style("opacity", 0);
      };

      DetailGraph.selectAll(".Unemployment_Rate")
        .on("mouseover", mouseOver)
        .on("mousemove", mouseMove)
        .on("mouseleave", mouseLeave);

      // Add y axis to vis  
      const DetailYAxis = DetailGraph.append("g") 
                            .attr("transform", "translate(" + DetailMargins.left + 
                              "," + (DetailMargins.top) + ")") 
                            .call(d3.axisLeft(URateYScale).ticks(4))
                            .attr("font-size", '10px');
      // Add y axis labels to vis  
      DetailYAxis.append("text")
            .attr("class", "y-axis-label")
            .attr("x", - DetailVisHeight / 2)
            .attr("y", - DetailMargins.left / 2 - 20)
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .text("Percent"); 
    };

    // check for cpi, plot if true
    if (index == 2) {
      const DetailLine = DetailGraph.append('path')
                                 .datum(data)
                                 .attr("d", d3.line()
                                     .x((d) => {return DetailMargins.left + DetailXScale(d.DATE)})
                                     .y((d) => {return CPIYScale(d.CPI) + DetailMargins.top}))
                                 .attr("class", "CPI"); 

      const DetailDetailTooltip = d3.select("#detailgraph")
                        .append("div")
                        .attr("class", "tooltip")
                        .style("opacity", 0);                           
                        
      function mouseMove(event, d) {
        let currentClass = this.classList;
        let date = dateFormat(DetailXScale.invert(event.offsetX - DetailMargins.left));
        let value = Math.abs(CPIYScale.invert(event.offsetY - DetailMargins.top));

        DetailDetailTooltip.html("Date: " + date + "</br>" + "Value: " + d3.format(",.0f")(value))
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 50) + "px")
                .style("background-color", "gray");
      };

      function mouseOver(event, d) {
        DetailDetailTooltip.style("opacity", 100);
      };


      function mouseLeave(event, d) {
        DetailDetailTooltip.style("opacity", 0);
      };

      DetailGraph.selectAll(".CPI")
        .on("mouseover", mouseOver)
        .on("mousemove", mouseMove)
        .on("mouseleave", mouseLeave);

      // Add y axis to vis  
      const DetailYAxis = DetailGraph.append("g") 
                            .attr("transform", "translate(" + DetailMargins.left + 
                              "," + (DetailMargins.top) + ")") 
                            .call(d3.axisLeft(CPIYScale).ticks(4))
                            .attr("font-size", '10px');
      // Add y axis labels to vis  
      DetailYAxis.append("text")
        .attr("class", "y-axis-label")
        .attr("x", - DetailVisHeight / 2)
        .attr("y", - DetailMargins.left / 2 - 20)
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text("Price Level");
    };

    // check for ppi, plot if true
    if (index == 3) {
      const DetailLine = DetailGraph.append('path')
                                 .datum(data)
                                 .attr("d", d3.line()
                                     .x((d) => {return DetailMargins.left + DetailXScale(d.DATE)})
                                     .y((d) => {return PPIYScale(d.PPI) + DetailMargins.top}))
                                 .attr("class", "PPI"); 

      const DetailTooltip = d3.select("#detailgraph")
                        .append("div")
                        .attr("class", "tooltip")
                        .style("opacity", 0);                           
                        
      function mouseMove(event, d) {
        let CurrentClass = this.classList;
        let date = dateFormat(DetailXScale.invert(event.offsetX - DetailMargins.left));
        let value = Math.abs(PPIYScale.invert(event.offsetY - DetailMargins.top));

        DetailTooltip.html("Date: " + date + "</br>" + "Value: " + d3.format(",.0f")(value))
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 50) + "px")
                .style("background-color", "gray");
      };

      function mouseOver(event, d) {
        DetailTooltip.style("opacity", 100);
      };

      function mouseLeave(event, d) {
        DetailTooltip.style("opacity", 0);
      };

      DetailGraph.selectAll(".PPI")
        .on("mouseover", mouseOver)
        .on("mousemove", mouseMove)
        .on("mouseleave", mouseLeave);

      // Add y axis to vis  
      const DetailYAxis = DetailGraph.append("g") 
                            .attr("transform", "translate(" + DetailMargins.left + 
                              "," + (DetailMargins.top) + ")") 
                            .call(d3.axisLeft(PPIYScale).ticks(4))
                            .attr("font-size", '10px'); 
      // Add y axis labels to vis  
      DetailYAxis.append("text")
        .attr("class", "y-axis-label")
        .attr("x", - DetailVisHeight / 2)
        .attr("y", - DetailMargins.left / 2 - 20)
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text("Price Level");
    };

    // check for uclaims, plot if true
    if (index == 4) {
      const DetailLine = DetailGraph.append('path')
                                 .datum(data)
                                 .attr("d", d3.line()
                                     .x((d) => {return DetailMargins.left + DetailXScale(d.DATE)})
                                     .y((d) => {return UClaimsYScale(d.UClaims) + DetailMargins.top}))
                                 .attr("class", "Unemployment_Claims"); 

      const DetailTooltip = d3.select("#detailgraph")
                        .append("div")
                        .attr("class", "tooltip")
                        .style("opacity", 0);                           
                        
      function mouseMove(event, d) {
        let CurrentClass = this.classList;
        let date = dateFormat(DetailXScale.invert(event.offsetX - DetailMargins.left));
        let value = Math.abs(UClaimsYScale.invert(event.offsetY - DetailMargins.top));
      

        DetailTooltip.html("Date: " + date + "</br>" + "Value: " + d3.format(",.0f")(value))
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 50) + "px")
                .style("background-color", "gray");
      };

      function mouseOver(event, d) {
        DetailTooltip.style("opacity", 100);
      };

      function mouseLeave(event, d) {
        DetailTooltip.style("opacity", 0);
      };

      DetailGraph.selectAll(".Unemployment_Claims")
        .on("mouseover", mouseOver)
        .on("mousemove", mouseMove)
        .on("mouseleave", mouseLeave);

      // Add y axis to vis  
      const DetailYAxis = DetailGraph.append("g") 
                            .attr("transform", "translate(" + DetailMargins.left + 
                              "," + (DetailMargins.top) + ")") 
                            .call(d3.axisLeft(UClaimsYScale).ticks(4))
                            .attr("font-size", '10px'); 
    
      // Add y axis labels to vis  
      DetailYAxis.append("text")
        .attr("class", "y-axis-label")
        .attr("x", - DetailVisHeight / 2)
        .attr("y", - DetailMargins.left / 2 - 20)
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text("Count");
    };
  });
};

// initialize detailvis with payrolls information
function IntialDetail() {
  
  //intialize info box with payrolls
  document.getElementById('indicatorinfotext').innerHTML = InfoTextPayrolls;

  //intialize visual with payrolls
  MakeDetailVis(0);
};

// create initial screen
IntialDetail();

// getting information from the change of the dropdown
function submitClicked() {
  // getting selected x value from drop down
  let indicator = document.getElementById("indicators");
  //getting selected indicator
  let selected_ind = indicator.options[indicator.selectedIndex].value;
  //getting selected index
  let selected_index = indicator.selectedIndex;

  //updating info box
  UpdateDetail(selected_index);

  //clearing the previous detail visual
  d3.selectAll("#detailgraph > *").remove(); 
  
  // rendering the chosen indicator
  MakeDetailVis(selected_index);
};

// altering the detailtextbox
function UpdateDetail(x) {

  // checking the given index and altering the contents of detailtextbox 
  if (x == 1) {
    document.getElementById('indicatorinfotext').innerHTML = InfoTextURate;
  };
  
  if (x == 2) {
    document.getElementById('indicatorinfotext').innerHTML = InfoTextCPI;
  } ;
  
  if (x == 3) {
    document.getElementById('indicatorinfotext').innerHTML = InfoTextPPI;
  }; 
  
  if (x == 4) {
    document.getElementById('indicatorinfotext').innerHTML = InfoTextUClaims;
  };
  
  if (x == 0) {
    document.getElementById('indicatorinfotext').innerHTML = InfoTextPayrolls;
  };

};

// Add event handler to button 
document.getElementById('selectedindicator').addEventListener('change', submitClicked);