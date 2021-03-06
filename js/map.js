async function drawGeoMap() {

    let button
    
    // Load and transform data
    const geoData = await d3.json("data/counties.json")
    const countyData = topojson.feature(geoData, geoData.objects.counties).features
    const stateData = topojson.feature(geoData, geoData.objects.states).features

    // Vaccination data
    let data = await d3.json('https://raw.githubusercontent.com/simprisms/vaccination-data/main/data/cdc_data.json')

    data = data['vaccination_county_condensed_data']
    delete data.runid

    data = data.map(data => {
            data.FIPS = +data.FIPS
            return data
        })

        for(let i = 0; i < data.length; i++) {
            // for each vaccination data point, consider the .fips property
            // this provides the link with the SVG values, in the matching property of .id
            let fips = data[i].FIPS;
           
            // loop through the array of geometries for the counties (
            let geometries = countyData;
            for(let j = 0; j < geometries.length; j++) {
              // consider the id of each array item
              let id = geometries[j].id;
              // if the fips value matches the id counterpart
              if(fips === id) {
                // update the object with the SVG values with the properties of the matching object in the vaccination array
                geometries[j] = Object.assign({}, geometries[j], data[i]);
                // stop looping as to find the next match
                break;
              }
            }
          }
          
        

    // The state geodata doesn't have state names - create an array to reference this data for labels
    const stateNames = await d3.tsv('https://gist.githubusercontent.com/mbostock/4090846/raw/07e73f3c2d21558489604a0bc434b3a5cf41a867/us-state-names.tsv')
    
    let names = {}
    stateNames.forEach((d, i) => {
        names[d.id] = d.name
    })
    
    // Set up dimensions
    const width = 1000
    const dimensions = {
        width,
        height: 640,
        margins: {
            top: 10, 
            bottom: 10, 
            left: 10, 
            right: 10
        }
    }
    dimensions.boundedHeight = dimensions.height 
        - dimensions.margins.top
        - dimensions.margins.top
    dimensions.boundedWidth = dimensions.width 
        - dimensions.margins.left
        - dimensions.margins.right

    // Create wrapper
    const wrapper = d3.select("#map-area").append("svg")
        .attr("height", dimensions.height)
        .attr("width", dimensions.width)

    // Create bounds
    const bounds = wrapper.append('g')
        .style("transform", `translate(${dimensions.margins.left}px, ${dimensions.margins.top}px)`)
    
    // Create arrays for legend colors and text
    const increments = ['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100']
    // , "No data"
    const colors = ["#e6f3ec", "#cce8d9", "#b3dcc6", "#99d1b3", '#80c5a0', "#66b98d", "#4dae7a", "#33a267", "#1a9754", "#008b41", "#ffffff" ]

    // , "#cecfc8", "#ffffff"

    // Create legend
    const legendArea = d3.select('#legend').append("svg")
        .attr("width", dimensions.width)
        .attr("height", 50)
        
    let legendInner = legendArea.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${dimensions.width* 0.39}, 20)`)
        
    legendInner.append("text")
        .attr("class", 'legend-header')
        .attr("x", 250)
        .attr("y", -7)
        .attr("text-anchor", "middle")
        .attr("font-size","17px")
        .text("Percentage of total population vaccinated")

    increments.forEach((increment, i) => {
        const legendRow = legendInner.append("g")
            .attr("class", "legendRow")
            .attr("transform", `translate(${i * 50}, 5)`)

        legendRow.append("rect")
            .attr("height", 10)
            .attr("width", 50)
            .attr("fill", function() {
                while ( i < colors.length) {
                    return colors[i]
                    i++
                }
            })

        legendRow.append("text")
            .attr("class", "legend-nums")
            .attr("x", 0)
            .attr("y", 25)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("font-weight", 100)
            .text(function() {
                while (i < increments.length) {
                    return increments[i]
                    i++
                }
            })

        legendRow.append("rect")
            .attr("class", "legend-lines")
            .attr("height", "14px")
            .attr("width", "1.5px")
    })

    // / Update button based on whether it is selected
    $(".button").on('click', function () {
        var thisBtn = $(this)
        thisBtn.addClass('clicked').siblings().removeClass("clicked")
        return thisBtn
    })

    // Select data from button value
    $(".button").on("click", function () {
        button = $(this).val()

        $(".legend-header").text(function () {
            if (button == null) {
                return "Percentage of total population vaccinated"
            } else if (button == "Series_Complete_Pop_Pct") {
                return "Percentage of total population vaccinated"
            } else if (button == "Series_Complete_12PlusPop_Pct") {
                return "Percentage of 12+ vaccinated"
            } else if (button == "Series_Complete_18PlusPop_Pct") {
                return "Percentage of 18+ vaccinated"
            } else return "Percentage of 65+ vaccinated"
        })

    // Update map based on new data
        drawMapInner()
    })

    const dataAccessor = (item) => {
        let fips = item['id']
            let county = data.find(d => {
                return d['FIPS'] == fips
            })
    }

    // Data credit
    const dataCredit = bounds.append("text")
        .attr("y", dimensions.boundedHeight)
        .attr("x", dimensions.boundedWidth / 2 + dimensions.boundedWidth / 6)
        .attr("tet-anchor", "middle")
        .attr("font-size", "12px")
        .attr("opacity", "0.5")
        .attr("font-style", "italic")
        .text("Data: CDC | Note: Data for Texas and Hawaii is missing.")

    // Add tooltip
    let tip = d3.tip()
            .attr("class", "d3-tip")
            tip.html(d => {
                let figure = Number(100 - d.Completeness_pct).toFixed(1)
                if (d.Series_Complete_Pop_Pct != null) {
                    return `<p id="geo-name"><strong>${d.County}, ${d.StateName}</strong></p><p id="complete">${figure}% of vaccinations in ${d.StateName} did not  <br> specify a person's home county.</p><p class="figures">Total vaccinated: &nbsp;&nbsp;&nbsp;<strong>${d.Series_Complete_Pop_Pct}%</strong></p><p class="figures">12+ vaccinated: &nbsp;&nbsp;&nbsp;<strong>${d.Series_Complete_12PlusPop_Pct}%</strong></p><p class="figures">18+ vaccinated: &nbsp;&nbsp;&nbsp;<strong>${d.Series_Complete_18PlusPop_Pct}%</strong></p><p class="figures">65+ vaccinated: &nbsp;&nbsp;&nbsp;<strong>${d.Series_Complete_65PlusPop_Pct}%</strong></p>`
                } else {
                    return `<p id="geo-name"><strong>${d.County}, ${d.StateName}</strong></p><p class="figures">Total vaccinated: &nbsp;&nbsp;&nbsp;<strong>No data</strong></p><p class="figures">18+ vaccinated: &nbsp;&nbsp;&nbsp;<strong>No data</strong></p><p class="figures">65+ vaccinated: &nbsp;&nbsp;&nbsp;<strong>No data</strong></p>`
                } 
            })
            bounds.call(tip)


    function drawMapInner() {
        // Create geopath
        const path = d3.geoPath()

        // Add transition buttons
        const t = d3.transition()
            .duration(300)

        // Plot here
        // Bind data
        const paths = bounds.selectAll("path")
            .data(countyData)

        // Exit
        paths.exit().remove()

        // Merge 
        paths.enter()
            .append("path")
                .attr("d", path)
                .attr("class", "county")
                .attr("stroke", "#ffffff")
                .attr("stroke-width", "0.3px")
                // .on("mouseover", function (d) {
                //     // d3.select(this).classed("shaded", true)
                //     tip.show
                // })
                .on("mouseover", tip.show)
                .on("mouseleave", tip.hide)
                .merge(paths)
                .transition(t)
                .attr("fill", function(item) {
                    let fips = item['id']
                    let county = data.find(d => {
                        return d['FIPS'] == fips
                    })
                    if (county) {
                        if (button == null) {
                            percentage = county["Series_Complete_Pop_Pct"]
                        } else {
                            percentage = county[button]
                        }  
                        if (percentage == null) {
                            return "#cecfc8"
                        }
                        else if (percentage <= 10) {
                            return "#e6f3ec"
                        } else if (percentage <= 20) {
                            return "#cce8d9"
                        } else if (percentage <= 30) {
                            return "#b3dcc6"
                        } else if (percentage <= 40) {
                            return "#99d1b3"
                        } else if (percentage <= 50) {
                            return '#80c5a0'
                        } else if (percentage <= 60) {
                            return "#66b98d"
                        } else if (percentage <= 70) {
                            return "#4dae7a"
                        } else if (percentage <= 80) {
                            return "#33a267"
                        } else if (percentage <= 90) {
                            return "#1a9754"
                        } else return "#008b41"
                    } else return "#cecfc8"
                 })
             
                //  Adds state boundaries
                bounds.append("path")
                 .datum(topojson.mesh(geoData,geoData.objects.states, function(a, b) { return a !== b; }))
                    .attr("class", "states")
                    .attr("fill", "none")
                    .attr("stroke", "white")
                    .attr("stroke-width","1px")
                    .attr("stroke-linejoin", "round")
                    .attr("d", path)

                    // Add Texas
                    // bounds.append("g")
                    //     .selectAll("path")
                    //     .data(stateData)
                    //     .enter()
                    //     .append("svg:path")
                    //     .attr("d", path)
                    //     .attr("fill", function(d) {
                    //         if (d.id == 48) {
                    //             return "#cecfc8"
                    //         } else {
                    //             return "none"
                    //         }
                    //     })
                    
            }


    drawMapInner()

    // Add update indicator to page
    let formatDate = d3.timeFormat("%B %-d, %Y");
    let parseDate = d3.timeParse("%Y-%m-%d")

    const date = parseDate(data[0].Date)
    document.getElementById("update").innerText = `Updated: ${formatDate(date)}`
}   

drawGeoMap()

 // Adds state labels
                // bounds.append("g")
                //     .attr("class", "states-names")
                //     .selectAll("text")
                //     .data(stateData)
                //     .enter()
                //     .append("svg:text")
                //     .text(function(d){
                //         return names[d.id];
                //       })
                //     .attr("x", function(d){
                //         return path.centroid(d)[0];
                        
                //     })
                //     .attr("y", function(d){
                //         return  path.centroid(d)[1];
                //     })
                //     .attr("text-anchor","middle")
                //     .attr('fill', 'black');
                

