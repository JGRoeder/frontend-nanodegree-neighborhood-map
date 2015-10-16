# Neighborhood Map Project: Historic Places
This application uses the Google Maps API, Factual API and Flickr API to locate and map and display information on various landmarks, primarily those places listed on the NRHP ( National Register of Historic Places ) , but additionally some parks are memorial sites are listed.

## Usage
Just type a locality or municipality into the search bar. Please note, that larger areas, such as regions, states or territories are currently not likely to yield many ( if any ), results. So stick to cities and towns.

## Build
Assuming you have both npm and gulp installed, simply running `gulp build` in the project directory, should generate a /build directory from which the application can be run ( via index.html ).

## Note
As the NRHP ( National Register of Historic Places ) does not currently provide an API for accessing their records, so the app is currently displaying article results from the Wikipedia. Unfortunately, the article results are not always accurate or occasionally return results for list style pages. In order to remedy this, I will eventually be converting this app to use NRHP reference numbers which are available through downloadable data sets, and NRHP's own records as they become available digitally. For now these will have to do as placeholders.
