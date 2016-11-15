CS 573: Assignment 5 - Visualizations And Multiple Views
===============================

Teammates:
* [Daniel Beckwith](https://github.com/dbeckwith)
* [Aditya Nivarthi](https://github.com/SIZMW)

## Description
This project demonstrates a visualization with multiple views on the same data, each of which is able to update and drill down into data based on points selected in other views.

Our data source comes from [here](http://www.transtats.bts.gov/DL_SelectFields.asp?Table_ID=236), which is from the U.S. Department of Transportation, Bureau of Transportation Statistics.

### Visualizations
#### Bar Chart
![Bar Chart](/img/bar-chart.png)

This chart shows the average arrival delay as bar heights, categorized by various airline companies that have had airplanes leave the airports in our data. Overall, we want to show the difference in delays across airlines, indicating which airlines have a tendency to arrive later than estimated.

Selecting a specific airport in the `Bubble Chart` will filter the data for average delay to airlines arriving to the selected airport.

Selecting a specific year in the `Point Chart` will filter the data for average delay to airlines and flights in the selected year.

### Bubble Chart On U.S. State Map
![Bubble Map](/img/bubble-map.png)

This chart shows the locations of the airports on the U.S. state map with a bubble. The size of the bubble for each airport will represent the average arrival delay of airplanes that have taken off from that airport. Overall, we want to show the average arrival delay of airplanes to the specific airport, giving a notion of which airports have a tendency of having flights landing later than expected.

Selecting a specific airline in the `Bar Chart` will show the bubble sizes of each airport to be the average arrival delay of that airline company to each of the airports where they had flights arriving.

Selecting a specific year in the `Point Chart` will filter the data for average delay to airlines and flights in the selected year.

### Point Chart Across Years
![Point Chart](/img/point-chart.png)

This chart shows the average arrival delay over the course of a specific year. Over the year, the chart shows the average arrival delay for each month in that year, which displays the progression of time and how the average arrival delay changes. Overall, we want to show the change in average arrival delay as time moves forward, either due to technological improvements or better coordination.

Selecting a specific airline in the `Bar Chart` will show the average arrival delay across the specific year for only that airline.

Selecting a specific airport in the `Bubble Chart` will show only the average arrival delay at that airport.

### Contributions
Daniel contributed most to the map visualization and interactions and the preprocessing for our data set.

Aditya contributed most to the bar graph visualization and interactions and the line graph visualization and interactions.

### Technical Achievements
One of the heaviest operations when doing interactions between views is having to change the other views based on selections. We spent time to make the update process easy by creating update functions for each of the visualizations. This made it faster and more efficient to actually update the data in the visualization, not just clearing the SVG and redrawing all the new data. It also enabled us to simply recalculate the new values instead of reloading the data with parameters from the selection, which saves times.

### Design Achievements


## Resources
* [Stanford interesting datasets](http://cjlab.stanford.edu/2015/09/30/lab-launch-and-data-sets/)
* [d3 time formatting](http://bl.ocks.org/zanarmstrong/ca0adb7e426c12c06a95)
* [d3 line chart example](https://bl.ocks.org/mbostock/3883245)

## Usage
The visualization can be seen [here](https://sizmw.github.io/05-MapsAndViews/).
