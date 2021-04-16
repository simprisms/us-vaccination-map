
// MAP - STATE VACCINATION PERCENTAGE

// Set up margins
const MARGINS = { TOP: 0, BOTTOM: 40, LEFT: 10, RIGHT: 10 };
const HEIGHT = 640 - MARGINS.TOP - MARGINS.BOTTOM
const WIDTH = 1000 - MARGINS.LEFT - MARGINS.RIGHT

// set up global variables
let countyData
let stateData
let vacData
let i = 0
let button
let percentage
let formatDate = d3.timeFormat("%B %-d, %Y");
let parseDate = d3.timeParse("%Y-%m-%d")
let totData
let countyName
let plusEighteen


const increments = ['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100', "No data"]
const colors = ["#e6f3ec", "#cce8d9", "#b3dcc6", "#99d1b3", '#80c5a0', "#66b98d", "#4dae7a", "#33a267", "#1a9754", "#008b41", "#ffffff", "#cecfc8", "#ffffff"]


// Create SVG
const svg = d3.select("#map-area").append("svg")
    .attr("height", HEIGHT + MARGINS.TOP + MARGINS.BOTTOM)
    .attr("width", WIDTH + MARGINS.LEFT + MARGINS.RIGHT)


const g = svg.append("g")
    .attr("transform", `translate(0, ${MARGINS.LEFT})`)


// Create legend 
const LegendArea = d3.select("#legend").append("svg")
    .attr("width", WIDTH)
    .attr("height", 50)

let legendInner = LegendArea.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${WIDTH * 0.19}, 20)`)

legendInner.append("text")
    .attr("class", "legend-header")
    .attr("x", 250)
    .attr("y", -7)
    .attr("text-anchor", "middle")
    .attr("font-size", "17px")
    .text("Percentage of total population vaccinated")

increments.forEach((increment, i) => {
    const legendRow = legendInner.append("g")
        .attr("class", "legendRow")
        .attr("transform", `translate(${i * 50}, 5)`)

    legendRow.append("rect")
        .attr("height", 10)
        .attr("width", 50)

        .attr("fill", function () {
            while (i < colors.length) {
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
        .text(function () {
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

// Data credit
const credit = g.append("text")
    .attr("class", "credit")
    .attr("x", WIDTH - 300)
    .attr("y", HEIGHT + 20)
    .attr("font-size", "12px")
    .attr("opacity", "0.5")
    .attr("font-style", "italic")
    .text("Data: CDC | Note: Data for Texas and Hawaii is missing.")

// Update button based on whether it is selected
$(".button").on('click', function () {
    var thisBtn = $(this)
    thisBtn.addClass('clicked').siblings().removeClass("clicked")
    return thisBtn
})

// Select data from button value
$(".button").on("click", function () {
    button = $(this).val()
    // Update map based on new data
    drawMap()
})

// Draw map
let drawMap = () => {

    // let cloned = _.clone(vacData)
    // let merged = _.merge(_.keyBy(cloned, 'FIPS'), _.keyBy(countyData, 'id'))
    // let values = _.values(merged)


    // add transiton
    const t = d3.transition()
        .duration(50)

    // Add app
    //Bind data
    const paths = g.selectAll("path")
        // replace values with countyData
        .data(countyData)

    //Exit
    paths.exit().remove()

    // Merge
    paths.enter()
        .append("path")
        .attr("d", d3.geoPath())
        .attr("class", "county")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", "0.5px")
        .on("mouseover", function (d) {
            d3.select(this).classed("shaded", true)
            tip.show()
        })
        .on("mouseout", function (d) {
            d3.select(this).classed("shaded", false)
            tip.hide()
        })
        .merge(paths)
        .transition(t)
        .attr("fill", (item) => {
            let fips = item['id']
            let county = vacData.find(d => {
                return d['FIPS'] === fips
            })
            if (button == null) {
                percentage = county["Series_Complete_Pop_Pct"]
            } else percentage = county[button]
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
        })
        .attr("tot_pop", item => {
            let fips = item['id']
            let county = vacData.find(d => {
                return d['FIPS'] === fips
            })
            let per = county["Series_Complete_Pop_Pct"]
            return per
        })
        .attr("eighteen", item => {
            let fips = item['id']
            let county = vacData.find(d => {
                return d['FIPS'] === fips
            })
            let eighteen = county["Series_Complete_18PlusPop_Pct"]
            return eighteen
        })
        .attr("sixtyfive", item => {
            let fips = item['id']
            let county = vacData.find(d => {
                return d['FIPS'] === fips
            })
            let sixtyfive = county["Series_Complete_65PlusPop_Pct"]
            return sixtyfive
        })
        .attr("county", item => {
            let fips = item['id']
            let county = vacData.find(d => {
                return d['FIPS'] === fips
            })
            let countyName = county["County"]
            return countyName
        })
        .attr("state", item => {
            let fips = item['id']
            let county = vacData.find(d => {
                return d['FIPS'] === fips
            })
            let state = county["StateName"]
            return state
        })
        .attr("completeness", item => {
            let fips = item['id']
            let county = vacData.find(d => {
                return d['FIPS'] === fips
            })
            let state = county["StateName"]
            return state
        })

        let tip = d3.tip()
        .attr("class", "d3-tip")
        .html(function() {
            
            let totPer = document.querySelectorAll(".county")
            $(totPer).on("mouseover", function() {
                 totData =  $(this).attr("tot_pop")
                 countyName = $(this).attr("county")
                 stateName = $(this).attr("state")
                 plusSixtyfive = $(this).attr("sixtyfive")
                 plusEighteen = $(this).attr("eighteen")})
                 
            if (totData != undefined) {
                return `<p id="geo-name"><strong>${countyName}, ${stateName}</strong></p><p class="figures">Total vaccinated: &nbsp;&nbsp;&nbsp;<strong>${totData}%</strong></p><p class="figures">18+ vaccinated: &nbsp;&nbsp;&nbsp;<strong>${plusEighteen}%</strong></p><p class="figures">65+ vaccinated: &nbsp;&nbsp;&nbsp;<strong>${plusSixtyfive}%</strong></p>`
            } else {
                return `<p id="geo-name"><strong>${countyName}, ${stateName}</strong></p><p class="figures">Total vaccinated: &nbsp;&nbsp;&nbsp;<strong>No data</strong></p><p class="figures">18+ vaccinated: &nbsp;&nbsp;&nbsp;<strong>No data</strong></p><p class="figures">65+ vaccinated: &nbsp;&nbsp;&nbsp;<strong>No data</strong></p>`
            } 
        })
    g.call(tip)


    // Change legend header when data updates
    $(".legend-header").text(function () {
        if (button == null) {
            return "Percentage of total population vaccinated"
        } else if (button == "Series_Complete_Pop_Pct") {
            return "Percentage of total population vaccinated"
        } else if (button == "Series_Complete_18PlusPop_Pct") {
            return "Percentage of 18+ vaccinated"
        } else return "Percentage of 65+ vaccinated"
    })

}

// Read in and transform data, call the drawMap function
d3.json("data/counties.json").then(
    (data, error) => {
        if (error) {
        } else {
            countyData = topojson.feature(data, data.objects.counties).features
            stateData = topojson.feature(data, data.objects.states).features
        }

        d3.json("https://raw.githubusercontent.com/simprisms/vaccination-data/main/data/cdc_data.json").then(
            (data, error) => {
                if (error) {
                    console.log(error);
                } else {
                    vacData = data['vaccination_county_condensed_data']

                    delete vacData.runid

                    vacData = vacData.map(data => {
                        data.FIPS = Number(data.FIPS)
                        return data

                    })

                    // Set update date on webpage
                    const date = parseDate(vacData[0].Date)
                    document.getElementById("update").innerText = `Updated: ${formatDate(date)}`
                    console.log(vacData)

                    drawMap()

                }
            }
        )
    }
)


// BAR CHART - VACCINATIONS PER DAY

const CHART_MARGINS = { TOP: 60, BOTTOM: 40, LEFT: 30, RIGHT: 10 };
const CHART_HEIGHT = 400 - CHART_MARGINS.TOP - CHART_MARGINS.BOTTOM
const CHART_WIDTH = 700 - CHART_MARGINS.LEFT - CHART_MARGINS.RIGHT

// Global variables
let usComplete
let x
let y
let avNest
let avLines

const chart = d3.select("#chart-area").append("svg")
    .attr("height", CHART_HEIGHT + CHART_MARGINS.TOP + CHART_MARGINS.BOTTOM)
    .attr("width", CHART_WIDTH + CHART_MARGINS.LEFT + CHART_MARGINS.RIGHT)

const gChart = chart.append('g')
    .attr("transform", `translate(${CHART_MARGINS.LEFT}, ${CHART_MARGINS.TOP})`)

// Tooltip
let formatTime = d3.timeFormat("%B %d");
let numberFormatter = d3.format(",.4r")

const chartTip = d3.tip()
    .attr("class", "d3-tip")
    .html(d => {
        let chartText = `<strong><p id="date">${formatTime(d.Date)}</strong></p><br>`
        chartText += `<p id="number">Vaccinations: ${numberFormatter(d.Administered_Daily)}</p>`
        return chartText
    })
gChart.call(chartTip)

const chartTitle = chart.append("text")
    .attr("class", "title-text")
    .attr("x", 15)
    .attr("y", 20)
    .text("New doses per day")

const chartSubtitle = chart.append("text")
    .attr("x", 15)
    .attr("y", 42)
    .attr("opacity", "0.6")
    .text("Rollout has accelerated since late February")

let drawChart = () => {

    const rects = gChart.selectAll("rect")
        .data(usComplete)

    rects.enter().append("rect")
        .attr("x", d => x(d.Date))
        .attr("y", d => y(d.Administered_Daily))
        .attr("width", "5px")
        .attr("height", d => CHART_HEIGHT - y(d.Administered_Daily))
        .attr("fill", "#99d1b3")
        // .transition(tChart)
        .on("mouseover", chartTip.show)
        .on("mouseout", chartTip.hide)

    // const avLineChart =  gChart.selectAll("path")
    //     .data(avNest)

    // avLineChart.enter().append("path")
    //     .attr("d",  avLines(avNest))
    //     .attr("fill", "none")
    //     .attr("stroke", "black")

    // const avLineChart = gChart.append("path")
    //     .attr("d", avLines(avNest.value))

}

d3.json("https://raw.githubusercontent.com/simprisms/vaccination-data/main/data/_us_historical.json").then((data, error) => {
    if (error) {
        console.log(error)
    } else {
        usComplete = data['vaccination_trends_data']

        delete usComplete.runid

        usComplete.map(data => {
            let parseTime = d3.timeParse("%Y-%m-%d")
            data.Date = parseTime(data.Date)
            return data
        })

        console.log(usComplete)

    }

    avLines = d3.line()
        .x(d => d.Date)
        .y(d => d.Administered_7_Day_Rolling_Average)


    avNest = d3.nest()
        .key(d => d.Date)
        .rollup(v => { return d3.mean(v, d => d.Administered_7_Day_Rolling_Average) })
        .entries(usComplete)

    avNest.map(d => {
        d.key = new Date(d.key)
    })

    console.log(avNest)

    x = d3.scaleTime()
        .domain([new Date(d3.min(usComplete, d => d.Date)), new Date(d3.max(usComplete, d => d.Date))])
        .range([0, CHART_WIDTH])

    y = d3.scaleLinear()
        .domain([0, d3.max(usComplete, d => d.Administered_Daily)])
        .range([CHART_HEIGHT, 0])

    const xAxis = d3.axisBottom(x)
        .ticks(5)
    gChart.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${CHART_HEIGHT})`)
        .call(xAxis)

    const yAxis = d3.axisLeft(y)
        .ticks(3)
        .tickFormat(d3.format(".1s"))
        .tickSize(-CHART_WIDTH)
    gChart.append("g")
        .attr("class", "y-axis")
        .call(yAxis)
        .select(".domain").remove()


    drawChart()
}
)
