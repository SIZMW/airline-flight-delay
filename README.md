Airline Flight Delay Visualization
===============================

Teammates:
* [Daniel Beckwith](https://github.com/dbeckwith)
* [Aditya Nivarthi](https://github.com/SIZMW)

## Description
This project demonstrates a visualization with multiple views on the same data, each of which is able to update and drill down into data based on points selected in other views. Our visualization shows different views on data about airplane arrival delay across different airports, airlines and months of the year.

### Dataset
Our data source comes from [here](http://www.transtats.bts.gov/DL_SelectFields.asp?Table_ID=236), which is from the U.S. Department of Transportation, Bureau of Transportation Statistics.

The columns we specifically extracted from this data are listed below:
* `FL_DATE`
* `UNIQUE_CARRIER`
* `ORIGIN_AIRPORT_ID`
* `ORIGIN_WAC`
* `DEST_AIRPORT_ID`
* `DEST_WAC`
* `DEP_DELAY`
* `ARR_DELAY`

### Visualizations
#### Bar Chart
![Bar Chart](/img/bar-chart.png)

This chart shows the average arrival delay as bar heights, categorized by various airline companies that have had airplanes leave the airports in our data. Overall, we want to show the difference in delays across airlines, indicating which airlines have a tendency to arrive later than estimated.

Selecting a specific airport in the `Bubble Chart` will filter the data for average delay to airlines arriving to the selected airport.

Selecting a specific month in the `Point Chart` will filter the data for average delay to airlines and flights in the selected month.

### Bubble Chart On U.S. State Map
![Bubble Map](/img/bubble-map.png)

This chart shows the locations of the airports on the U.S. state map with a bubble. The size of the bubble for each airport will represent the average arrival delay of airplanes that have taken off from that airport. Overall, we want to show the average arrival delay of airplanes to the specific airport, giving a notion of which airports have a tendency of having flights landing later than expected.

Selecting a specific airline in the `Bar Chart` will show the bubble sizes of each airport to be the average arrival delay of that airline company to each of the airports where they had flights arriving.

Selecting a specific month in the `Point Chart` will filter the data for average delay to airlines and flights in the selected month.

### Point Chart Across Months
![Point Chart](/img/point-chart.png)

This chart shows the average arrival delay over the course the months in a year. Over the months, the chart shows the average arrival delay, which displays the progression of time and how the average arrival delay changes. Overall, we want to show the change in average arrival delay as time moves forward, either due to technological improvements or better coordination.

Selecting a specific airline in the `Bar Chart` will show the average arrival delay across the specific year for only that airline.

Selecting a specific airport in the `Bubble Chart` will show only the average arrival delay at that airport.

## Resources
* [Stanford interesting datasets](http://cjlab.stanford.edu/2015/09/30/lab-launch-and-data-sets/)
* [d3 time formatting](http://bl.ocks.org/zanarmstrong/ca0adb7e426c12c06a95)
* [d3 line chart example](https://bl.ocks.org/mbostock/3883245)

## Usage
The visualization can be seen [here](https://sizmw.github.io/airline-flight-delay/).
