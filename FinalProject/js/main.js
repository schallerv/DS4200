// constants for main visual design
const FrameHeight = 510;
const FrameWidth = 850; 
const MainMargins = {left: 75, right: 5, top: 25, bottom: 25};

const VisHeight = FrameHeight - MainMargins.top - MainMargins.bottom;
const VisWidth = FrameWidth - MainMargins.left - MainMargins.right; 

//constant for slider graph design
const SlideHeight = 115;
const SlideWidth = FrameWidth; 
const SlideMargins = {left: MainMargins.left, right: MainMargins.right, top: 10, bottom: 20};

const SlideVisHeight = SlideHeight - MainMargins.top - MainMargins.bottom;
const SlideVisWidth = SlideWidth - MainMargins.left - MainMargins.right; 

const formatDate = d3.timeParse("%-m/%-d/%Y");
const dateFormat = d3.timeFormat("%-m/%-d/%Y");

// creation function
function buildPlots() {
  // reading in the data
  d3.csv("data/NoNullsData.csv",
  function(d){
    return {DATE : formatDate(d.DATE), 
            Payrolls : +d.Payrolls,
            CPI : +d.CPI,
            UClaims : +d.UClaims,
            PPI : +d.PPI,
            URate : +d.URate}
  }
  ).then((data) => {

    // printing the first 10 lines of the data
    console.log("First 10 Lines of the Data:");
    console.log(data.slice(0, 10));

    // getting max values for indicators 
    const MaxPayroll = d3.max(data, (d) => { return d.Payrolls; });
    const MaxCPI = d3.max(data, (d) => { return d.CPI; });
    const MaxPPI = d3.max(data, (d) => { return d.PPI; });
    const MaxURate = d3.max(data, (d) => { return d.URate; });
    const MaxUClaims = d3.max(data, (d) => { return d.UClaims; });

    //creating list of all maximums
    const maxList = 
        {"Payroll" : MaxPayroll,
        "CPI" : MaxCPI,
        "PPI" : MaxPPI,
        "Unemployment_Claims" : MaxUClaims,
        "Unemployment_Rate" : MaxURate};

    // setting constants for legend on main viz   
    const Vis1Keys = ['CPI', 'PPI', "Unemployment Rate", "Unemployment Claims", "Payrolls"];
    const KeyColors = ["rgb(27, 139, 27)", "rgba(211, 23, 23, 0.824)", "rgb(237, 138, 0)", "Purple", "rgb(49, 49, 183)"];
    const spacing = [10, 60, 110, 250, 400];

    const domain = d3.extent(data, (d) => d.DATE);

    //setting scales
    const MainXScale = d3.scaleTime() 
                      .domain(domain) 
                      .range([0, VisWidth]); 

    const MainYScale = d3.scaleLinear() 
                      .domain([1, 0])  
                      .range([0, VisHeight]); 

    // setting up the graph
    const MainVisual = d3.select("#mainvis")
                  .append("svg")
                    .attr("id", "mvis")
                    .attr("height", FrameHeight)
                    .attr("width", FrameWidth)
                    .attr("class", "frame"); 

    // function for drawing recession years onto main visual
    function drawRecession(start, end) {
        const recessionBar = MainVisual.append("rect")
            .attr("x", MainMargins.left + (MainXScale((formatDate(start)))))
            .attr("y", MainMargins.top)
            .attr("height", VisHeight)
            .attr("width", ((MainXScale((formatDate(end)))) - (MainXScale((formatDate(start))))))
            .attr("class", 'recession_bar')
            .attr("start", start)
            .attr("end", end);
        return recessionBar;
    };
    
    /// add 1990, 2001, 2008, and 2020 recessions
    const Draw1990 = drawRecession("1/1/1990", "3/1/1991");        
    const Draw2001 = drawRecession("1/1/2001", "12/31/2001");
    const Draw2008 = drawRecession("12/1/2007", "6/1/2009");
    const Draw2020 = drawRecession("1/1/2020", "12/31/2020");

    // adding recession tooltip
    const TooltipBar = d3.select("#mainvis")
                        .append("div")
                        .attr("class", "tooltip")
                        .style("opacity", 0);

    function mouseMove_BAR(event, d) {
        const formatDate = d3.timeFormat("%-m/%-d/%Y");
        const start = d3.select(this).attr("start");
        const end = d3.select(this).attr("end");
        const formattedStart = formatDate(d3.timeParse("%-m/%-d/%Y")(start));
        const formattedEnd = formatDate(d3.timeParse("%-m/%-d/%Y")(end));

        TooltipBar.html("Recession Start: " + start + "</br>" + "Recession End: " + end)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 50) + "px")
                    .attr("class", "recession_tooltip");
    };

    function mouseOver_BAR(event, d) {
        TooltipBar.style("opacity", 1);
    };

    function mouseLeave_BAR(event, d) {
        TooltipBar.style("opacity", 0);
    };

    MainVisual.selectAll(".recession_bar")
        .on("mouseover", mouseOver_BAR)
        .on("mousemove", mouseMove_BAR)
        .on("mouseleave", mouseLeave_BAR);
    
    // plot payroll counts
    const payrolls = MainVisual.append('path')
                        .datum(data) // passed from .then  
                        .attr("d", d3.line()
                            .x((d) => {return MainMargins.left + MainXScale(d.DATE)})
                            .y((d) => {return MainYScale(d.Payrolls/MaxPayroll) + MainMargins.top}))
                        .attr("class", "Payroll"); 

    // plot unemployment rate
    const unemployment = MainVisual.append('path')
                        .datum(data) // passed from .then  
                        .attr("d", d3.line()
                            .x((d) => {return MainMargins.left + MainXScale(d.DATE)})
                            .y((d) => {return MainYScale(d.URate/MaxURate) + MainMargins.top}))
                        .attr("class", "Unemployment_Rate"); 
    
    // plot PPI
    const ppi = MainVisual.append('path')
                        .datum(data) // passed from .then  
                        .attr("d", d3.line()
                            .x((d) => {return MainMargins.left + MainXScale(d.DATE)})
                            .y((d) => {return MainYScale(d.PPI/MaxPPI) + MainMargins.top}))
                        .attr("class", "PPI"); 

    // plot CPI
    const cpi = MainVisual.append('path')
                        .datum(data) // passed from .then  
                        .attr("d", d3.line()
                            .x((d) => {return MainMargins.left + MainXScale(d.DATE)})
                            .y((d) => {return MainYScale(d.CPI/MaxCPI) + MainMargins.top}))
                        .attr("class", "CPI");

     // plot claims
     const claims = MainVisual.append('path')
                        .datum(data) // passed from .then  
                        .attr("d", d3.line()
                            .x((d) => {return MainMargins.left + MainXScale(d.DATE)})
                            .y((d) => {return MainYScale(d.UClaims/MaxUClaims) + MainMargins.top}))
                        .attr("class", "Unemployment_Claims");
                        
    // Add x axis to vis  
    const MainXAxis = MainVisual.append("g") 
        .attr("transform", "translate(" + MainMargins.left + 
              "," + (VisHeight + MainMargins.top) + ")") 
        .call(d3.axisBottom(MainXScale).ticks(8)) 
          .attr("font-size", '10px')
          .attr("font-weight", "bold"); 

    // Add y axis to vis  
    const MainYAxis = MainVisual.append("g") 
        .attr("transform", "translate(" + MainMargins.left + 
              "," + (MainMargins.top) + ")") 
        .call(d3.axisLeft(MainYScale).ticks(4).tickFormat(function(d) {
            return (d * 100) + "%"}))
          .attr("font-size", '10px')
          .attr("font-weight", "bold"); 
          
    // Add y axis label 
    MainYAxis.append("text")
    .attr("class", "y-axis-label")
    .attr("x", -VisHeight / 2)
    .attr("y", -MainMargins.left / 2 - 5)
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "middle")
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .text("% of Maximum");

    // dot for legend
    MainVisual.selectAll("mydots")
        .data(Vis1Keys)
        .enter()
        .append("circle")
        .attr("cx", function(d,i){ return MainMargins.left + spacing[i]})
        .attr("cy", MainMargins.top - 10) 
        .attr("r", 4)
        .style("fill", function(d,i){ return KeyColors[i]});

    // square for legend
    MainVisual.selectAll("myrect")
        .data(Vis1Keys)
        .enter()
        .append("rect")
        .attr("x", 540)
        .attr("y", MainMargins.top - 18)
        .attr("height", 15)
        .attr("width", 15)
        .attr("fill", "grey")
        .style("opacity", 0.5);

    // text for legend
    MainVisual.selectAll("mylabels")
        .data(Vis1Keys)
        .enter()
        .append("text")
        .attr("x", function(d,i){ return MainMargins.left + spacing[i] + 10})
        .attr("y", MainMargins.top - 10)
        .style("fill", function(d,i){ return KeyColors[i]})
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("font-weight", "bold")
        .style("alignment-baseline", "middle")
        .style("font-size","12px");

    // adding another label for the rectangle
    MainVisual.selectAll("mylabels")
        .data(Vis1Keys)
        .enter()
        .append("text")
        .attr("x", 540 + 20)
        .attr("y", MainMargins.top - 10)
        .style("fill", "grey")
        .text("Economic Recession")
        .attr("text-anchor", "left")
        .style("font-weight", "bold")
        .style("alignment-baseline", "middle")
        .style("font-size","12px");

    // add a tooltip to the visualization
    const TOOLTIP = d3.select("#mainvis")
                        .append("div")
                        .attr("class", "tooltip")
                        .style("opacity", 0);

    // add a tooltip to the main viz
    // function mouseMove(event, d) {
    //     let current_class = this.classList;
    //     let maximum_class = maxList[current_class];
    //     //setting values
    //     let y_value = event.pageY / VisHeight;
    //     let date = dateFormat(MainXScale.invert(event.offsetX - MainMargins.left));
    //     let value = (MainYScale.invert(event.offsetY - MainMargins.top));
    //     let value2 = value * maximum_class;
    //     let stroke_color = d3.select(this).style("stroke");
    //     // getting the class for the current object to be used in the tooltip
        
    //     // checking if the current class if unemployment rate because it needs to be formatted differently
    //     if (current_class == "Unemployment_Rate") { 

    //         TOOLTIP.html("Metric: " + current_class + "</br>" + "Date: " + date + "</br>" + "Value: " + d3.format(".2%")(value2))
    //                 .style("left", (event.pageX + 10) + "px")
    //                 .style("top", (event.pageY - 50) + "px")
    //                 .style("background-color", stroke_color);
                 
    //     } else {

    //         TOOLTIP.html("Metric: " + current_class + "</br>" + "Date: " + date + "</br>" + "Value: " + d3.format(",.0f")(value2))
    //                 .style("left", (event.pageX + 10) + "px")
    //                 .style("top", (event.pageY - 50) + "px")
    //                 .style("background-color", stroke_color);
    //     };
    // };

    function mouseMove(event, d) {
        let current_class = this.classList;
        let y_value = event.pageY / VisHeight;
        let date = dateFormat(MainXScale.invert(event.offsetX - MainMargins.left));
        let value = Math.abs(MainYScale.invert(event.offsetY - MainMargins.top));
        let stroke_color = d3.select(this).style("stroke");

        TOOLTIP.html("Metric: " + current_class + "</br>" + "Date: " + date + "</br>" + "Value: " + d3.format(".2%")(value))
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 50) + "px")
                .style("background-color", stroke_color);
    };

    function mouseOver(event, d) {
        TOOLTIP.style("opacity", 1);
    };

    function mouseLeave(event, d) {
        TOOLTIP.style("opacity", 0);
    };

    MainVisual.selectAll(".Unemployment_Claims")
        .on("mouseover", mouseOver)
        .on("mousemove", mouseMove)
        .on("mouseleave", mouseLeave);

    MainVisual.selectAll(".CPI")
        .on("mouseover", mouseOver)
        .on("mousemove", mouseMove)
        .on("mouseleave", mouseLeave);

    MainVisual.selectAll(".PPI")
        .on("mouseover", mouseOver)
        .on("mousemove", mouseMove)
        .on("mouseleave", mouseLeave);

    MainVisual.selectAll(".Unemployment_Rate")
        .on("mouseover", mouseOver)
        .on("mousemove", mouseMove)
        .on("mouseleave", mouseLeave);

    MainVisual.selectAll(".Payroll")
        .on("mouseover", mouseOver)
        .on("mousemove", mouseMove)
        .on("mouseleave", mouseLeave);

    // slider plotting

    // setting scales
    const SlideXScale = d3.scaleTime() 
                      .domain(domain) 
                      .range([0, SlideVisWidth]); 

    const SlideYScale = d3.scaleLinear() 
                      .domain([1, 0])  
                      .range([0, SlideVisHeight]); 

    // setting up the graph
    const SLIDE = d3.select("#slider")
                  .append("svg")
                    .attr("id", "slidegraph")
                    .attr("height", SlideHeight)
                    .attr("width", SlideWidth)
                    .attr("class", "frame"); 

    // plot payroll counts
    const s_payrolls = SLIDE.append('path')
                        .datum(data) // passed from .then  
                        .attr("d", d3.line()
                            .x((d) => {return SlideMargins.left + SlideXScale(d.DATE)})
                            .y((d) => {return SlideYScale(d.Payrolls/MaxPayroll) + SlideMargins.top}))
                        .attr("class", "slidepayroll"); 

    // plot unemployment rate
    const s_unemployment = SLIDE.append('path')
                        .datum(data) // passed from .then  
                        .attr("d", d3.line()
                            .x((d) => {return SlideMargins.left + SlideXScale(d.DATE)})
                            .y((d) => {return SlideYScale(d.URate/MaxURate) + SlideMargins.top}))
                        .attr("class", "slideurate"); 
    
    // plot PPI
    const s_ppi = SLIDE.append('path')
                        .datum(data) // passed from .then  
                        .attr("d", d3.line()
                            .x((d) => {return SlideMargins.left + SlideXScale(d.DATE)})
                            .y((d) => {return SlideYScale(d.PPI/MaxPPI) + SlideMargins.top}))
                        .attr("class", "slideppi"); 

    // plot CPI
    const s_cpi = SLIDE.append('path')
                        .datum(data) // passed from .then  
                        .attr("d", d3.line()
                            .x((d) => {return SlideMargins.left + SlideXScale(d.DATE)})
                            .y((d) => {return SlideYScale(d.CPI/MaxCPI) + SlideMargins.top}))
                        .attr("class", "slidecpi");

     // plot claims
     const s_claims = SLIDE.append('path')
                        .datum(data) // passed from .then  
                        .attr("d", d3.line()
                            .x((d) => {return SlideMargins.left + SlideXScale(d.DATE)})
                            .y((d) => {return SlideYScale(d.UClaims/MaxUClaims) + SlideMargins.top}))
                        .attr("class", "slideline");

    // add recession bars to the slider

    function drawRecessionSlider (start, end) {
        const SlideRecession = SLIDE.append("rect")
            .attr("x", SlideMargins.left + (SlideXScale((formatDate(start)))))
            .attr("y", SlideMargins.top)
            .attr("height", SlideVisHeight)
            .attr("width", ((SlideXScale((formatDate(end)))) - (SlideXScale((formatDate(start))))))
            .attr("class", 'recession_bar');
    }
    

    /// add 1990, 2001, 2008. 2020 recession
    const SLide1990 = drawRecessionSlider("1/1/1990", "3/1/1991");        
    const Slide2001 = drawRecessionSlider("1/1/2001", "12/31/2001");
    const Slide2008 = drawRecessionSlider("12/1/2007", "6/1/2009");
    const Slide2020 = drawRecessionSlider("1/1/2020", "12/31/2020");

    // Add x axis to vis  
    SLIDE.append("g") 
        .attr("transform", "translate(" + SlideMargins.left + 
              "," + (SlideVisHeight + SlideMargins.top) + ")") 
        .call(d3.axisBottom(SlideXScale).ticks(8)) 
          .attr("font-size", '10px')
          .attr("font-weight", "bold");

    // Add brushing
    // adding brushing
    d3.select("#slidegraph")
          .call( d3.brushX()                    
            .extent( [ [SlideMargins.left,0], [(SlideVisWidth + SlideMargins.left), (SlideVisHeight + SlideMargins.top)] ] )
            .on("start brush", updateMain)
          );
    
    function updateMain(event) {
        extent = event.selection  //get coordinates
        d3.selectAll("#mainvis > *").remove();
        renderMain(extent);
    }

    function renderMain(brush_coords){
        let x0 = brush_coords[0],
            x1 = brush_coords[1];
        
        const slideMin = SlideXScale.invert(x0 - SlideMargins.left).getTime();
        const slideMax = SlideXScale.invert(x1  - SlideMargins.left).getTime();

        // create new data set with only brushed dates
        let dataFilter1 = data.filter(function(row){
            return row['DATE'] >= slideMin});

        let dataFilter = dataFilter1.filter(function(row){
            return row['DATE'] <= slideMax});

        const domain = [slideMin, slideMax];
   
        //setting scales
        const MainXScale = d3.scaleTime() 
                            .domain(domain) 
                            .range([0, VisWidth]); 

        const MainYScale = d3.scaleLinear() 
                            .domain([1, 0])  
                            .range([0, VisHeight]); 
      
        // setting up the graph
        const MAIN = d3.select("#mainvis")
                        .append("svg")
                          .attr("id", "mvis")
                          .attr("height", FrameHeight)
                          .attr("width", FrameWidth)
                          .attr("class", "frame"); 

        // plot payroll counts
        const payrolls = MAIN.append('path')
            .datum(dataFilter) // passed from .then  
            .attr("d", d3.line()
                .x((d) => {return MainMargins.left + MainXScale(d.DATE)})
                .y((d) => {return MainYScale(d.Payrolls/MaxPayroll) + MainMargins.top}))
            .attr("class", "Payroll"); 

        // plot unemployment rate
        const unemployment = MAIN.append('path')
            .datum(dataFilter) // passed from .then  
            .attr("d", d3.line()
                .x((d) => {return MainMargins.left + MainXScale(d.DATE)})
                .y((d) => {return MainYScale(d.URate/MaxURate) + MainMargins.top}))
            .attr("class", "Unemployment_Rate"); 

        // plot PPI
        const ppi = MAIN.append('path')
            .datum(dataFilter) // passed from .then  
            .attr("d", d3.line()
                .x((d) => {return MainMargins.left + MainXScale(d.DATE)})
                .y((d) => {return MainYScale(d.PPI/MaxPPI) + MainMargins.top}))
            .attr("class", "PPI"); 

        // plot CPI
        const cpi = MAIN.append('path')
            .datum(dataFilter) // passed from .then  
            .attr("d", d3.line()
                .x((d) => {return MainMargins.left + MainXScale(d.DATE)})
                .y((d) => {return MainYScale(d.CPI/MaxCPI) + MainMargins.top}))
            .attr("class", "CPI");

        // plot claims
        const claims = MAIN.append('path')
            .datum(dataFilter) // passed from .then  
            .attr("d", d3.line()
                .x((d) => {return MainMargins.left + MainXScale(d.DATE)})
                .y((d) => {return MainYScale(d.UClaims/MaxUClaims) + MainMargins.top}))
            .attr("class", "Unemployment_Claims")
            .style("stroke_color", "purple");


        function RenderRecession(start, end) {
            if ((formatDate(start)) >= slideMin) {
                MAIN.append("rect")
                .attr("x", MainMargins.left + (MainXScale((formatDate(start)))))
                .attr("y", MainMargins.top)
                .attr("height", VisHeight)
                .attr("width", ((MainXScale((formatDate(end)))) - (MainXScale((formatDate(start))))))
                .attr("class", 'recession_bar')
                .attr("start", start)
                .attr("end", end); 
            }  
        };
    
    /// add 1990. 2001, 2008 and 2020 recessions
    const render1990 = RenderRecession("1/1/1990", "3/1/1991");        
    const render2001 = RenderRecession("1/1/2001", "12/31/2001");
    const render2008 = RenderRecession("12/1/2007", "6/1/2009");
    const render2020 = RenderRecession("1/1/2020", "12/31/2020");

    const TOOLTIP_BAR = d3.select("#mainvis")
                        .append("div")
                        .attr("class", "tooltip")
                        .style("opacity", 0);

    function mouseMove_BAR(event, d) {
        const formatDate = d3.timeFormat("%-m/%-d/%Y");

        const start = d3.select(this).attr("start");
        const end = d3.select(this).attr("end");
        const formattedStart = formatDate(d3.timeParse("%-m/%-d/%Y")(start));
        const formattedEnd = formatDate(d3.timeParse("%-m/%-d/%Y")(end));

        TOOLTIP_BAR.html("Recession Start: " + start + "</br>" + "Recession End: " + end)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 50) + "px")
                    .attr("class", "recession_tooltip");

    };

    function mouseOver_BAR(event, d) {
        TOOLTIP_BAR.style("opacity", 1);
    };


    function mouseLeave_BAR(event, d) {
        TOOLTIP_BAR.style("opacity", 0);
    };

    MAIN.selectAll(".recession_bar")
        .on("mouseover", mouseOver_BAR)
        .on("mousemove", mouseMove_BAR)
        .on("mouseleave", mouseLeave_BAR);
        
    // Add x axis to vis  
    const main_x_axis = MAIN.append("g") 
        .attr("transform", "translate(" + MainMargins.left + 
        "," + (VisHeight + MainMargins.top) + ")") 
        .call(d3.axisBottom(MainXScale).ticks(8)) 
        .attr("font-size", '10px')
        .style("font-weight", "bold"); 

    // Add y axis to vis  
    const main_y_axis = MAIN.append("g") 
        .attr("transform", "translate(" + MainMargins.left + 
        "," + (MainMargins.top) + ")") 
        .call(d3.axisLeft(MainYScale).ticks(4).tickFormat(function(d) {
        return (d * 100) + "%"}))
        .attr("font-size", '10px')
        .attr("font-weight", "bold");

    main_y_axis.append("text")
            .attr("class", "y-axis-label")
            .attr("x", -VisHeight / 2)
            .attr("y", -MainMargins.left / 2 - 5)
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .text("% of Maximum");
    

    // dot for legend
    MAIN.selectAll("mydots")
        .data(Vis1Keys)
        .enter()
        .append("circle")
        .attr("cx", function(d,i){ return MainMargins.left + spacing[i]})
        .attr("cy", MainMargins.top - 10) 
        .attr("r", 4)
        .style("fill", function(d,i){ return KeyColors[i]});

    // square for legend
    MAIN.selectAll("myrect")
        .data(Vis1Keys)
        .enter()
        .append("rect")
        .attr("x", 540)
        .attr("y", MainMargins.top - 18)
        .attr("height", 15)
        .attr("width", 15)
        .attr("fill", "grey")
        .style("opacity", 0.5);

    // text for legend
    MAIN.selectAll("mylabels")
        .data(Vis1Keys)
        .enter()
        .append("text")
        .attr("x", function(d,i){ return MainMargins.left + spacing[i] + 10})
        .attr("y", MainMargins.top - 10)
        .style("fill", function(d,i){ return KeyColors[i]})
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("font-weight", "bold")
        .style("alignment-baseline", "middle")
        .style("font-size","12px");

    // adding another label for the rectangle
    MAIN.selectAll("mylabels")
        .data(Vis1Keys)
        .enter()
        .append("text")
        .attr("x", 540 + 20)
        .attr("y", MainMargins.top - 10)
        .style("fill", "grey")
        .text("Economic Recession")
        .attr("text-anchor", "left")
        .style("font-weight", "bold")
        .style("alignment-baseline", "middle")
        .style("font-size","12px");
      
    // add a tooltip to the brushed main viz
    const MainTooltip = d3.select("#mainvis")
                        .append("div")
                        .attr("class", "tooltip")
                        .style("opacity", 0);
                        
    function mouseMove(event, d) {
        let current_class = this.classList;
        let y_value = event.pageY / VisHeight;
        let date = dateFormat(MainXScale.invert(event.offsetX - MainMargins.left));
        let value = Math.abs(MainYScale.invert(event.offsetY - MainMargins.top));
        let stroke_color = d3.select(this).style("stroke");

        MainTooltip.html("Metric: " + current_class + "</br>" + "Date: " + date + "</br>" + "Value: " + d3.format(".2%")(value))
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 50) + "px")
                .style("background-color", stroke_color);
    };

    function mouseOver(event, d) {
        MainTooltip.style("opacity", 100);
    };

    function mouseLeave(event, d) {
        MainTooltip.style("opacity", 0);
    };

    MAIN.selectAll(".Unemployment_Claims")
        .on("mouseover", mouseOver)
        .on("mousemove", mouseMove)
        .on("mouseleave", mouseLeave);

    MAIN.selectAll(".CPI")
        .on("mouseover", mouseOver)
        .on("mousemove", mouseMove)
        .on("mouseleave", mouseLeave);

    MAIN.selectAll(".PPI")
        .on("mouseover", mouseOver)
        .on("mousemove", mouseMove)
        .on("mouseleave", mouseLeave);

    MAIN.selectAll(".Unemployment_Rate")
        .on("mouseover", mouseOver)
        .on("mousemove", mouseMove)
        .on("mouseleave", mouseLeave);

    MAIN.selectAll(".Payroll")
        .on("mouseover", mouseOver)
        .on("mousemove", mouseMove)
        .on("mouseleave", mouseLeave);
    };
});
};

buildPlots();