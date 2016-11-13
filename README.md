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
Daniel //TODO

Aditya //TODO

### Technical Achievements
//TODO

### Design Achievements
//TODO

## Resources
* [Stanford interesting datasets](http://cjlab.stanford.edu/2015/09/30/lab-launch-and-data-sets/)
* [jQuery find object by property](http://stackoverflow.com/questions/7364150/find-object-by-id-in-an-array-of-javascript-objects)

## Usage
The visualization can be seen [here](https://sizmw.github.io/05-MapsAndViews/).


