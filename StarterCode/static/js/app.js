// Variable for the url
const url = "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json";

// Function for dropdown with OTU ID
function dropDown(data) {
    let dataSet = d3.select("#selDataset");
    let options = dataSet.selectAll("option").data(data.metadata);
    options.enter().append('option')
      .text(function(d) { 
        return d.id; 
    }).attr('value', function(d) { return d.id; });
  }

// Function to format the data required for the plots
function formatData(data, ID) {

  // Filter the data to get only selected sample
  const selectedSample = data.samples.filter(function(d) {
    return d.id == ID;
  })[0];

  // Create a new empty list
  let newList = [];

  // For Loop to push in data
  for (let i = 0; i < selectedSample.otu_ids.length; i++) {
    newList.push({
      otu_id: `OTU ${selectedSample.otu_ids[i]}`,
      otu_id_num: selectedSample.otu_ids[i],
      sample_value: selectedSample.sample_values[i],
      otu_label: selectedSample.otu_labels[i]
    });
  }

  // Sort dictionaries for graphing
  let sorted_bar = [...newList].sort(function(a, b) {
    return b.sample_value - a.sample_value;
  }).slice(0, 10).reverse();

  // Sort dictionaries for bubble graph
  let sorted_bubble = [...newList].sort(function(a, b) {
    return a.otu_id_num - b.otu_id_num;
  });

  // Return the resulting sorted data
  return { 
    sorted_bar, sorted_bubble 
  };
}

// Function to initialize the page with default plots, metadata, and dropdown menu
function init(data) {

  // Format the data for the default plots
  let sorted = formatData(data, "940");

  // Set up the bar chart
  let bar = [{
    x: sorted.sorted_bar.map(dataPoint => dataPoint.sample_value),
    y: sorted.sorted_bar.map(dataPoint => dataPoint.otu_id), 
    text: sorted.sorted_bar.map(dataPoint => dataPoint.otu_label),
    type: 'bar',
    orientation: "h",}
   ];
  
  // Plot the bar chart in the 'bar' wrapper
  Plotly.newPlot("bar", bar);

  // Set up the bubble chart
  let bubble = [{
    x: sorted.sorted_bubble.map(dataPoint => dataPoint.otu_id_num),
    y: sorted.sorted_bubble.map(dataPoint => dataPoint.sample_value),
    text: sorted.sorted_bubble.map(dataPoint => dataPoint.otu_label),
    mode: 'markers', 
    marker: {
      size: sorted.sorted_bubble.map(dataPoint => dataPoint.sample_value),
      color: sorted.sorted_bubble.map(dataPoint => dataPoint.otu_id_num),
      sizeref: 1.75
    }
  }];

  // Plot the bubble chart
  Plotly.newPlot("bubble", bubble);

  
  //-------------METADATA-------------

  let metaData = data.metadata.filter(dataSet => dataSet.id == 940);

  //Metadata elements to the html
  let selectTag = d3.select("#sample-metadata");
  let pTags = selectTag.selectAll("p").data(metaData).enter();

  const keys = ['id', 'ethnicity', 'gender', 'age', 'location', 'bbtype', 'wfreq'];
  
  for (let i = 0; i < keys.length; i++) {
    pTags.append('p').attr('id', keys[i]).text(function(d) {
      return keys[i] + ': ' + d[keys[i]];
    });
  }

  // Set up the dropdown menu
  dropDown(data);
}

// Function to call when the dropdown value is changed
function optionChanged(selection) {
    
    // Call the url again to get the data, and define the full function to change everything
    d3.json(url).then(function(data) {
    
      // Get and format data for bar and bubble plots
      const { sorted_bar, sorted_bubble } = formatData(data, selection);
      
      // Restyle the bar chart
      Plotly.restyle("bar", {
        x: [sorted_bar.map(dataPoint => dataPoint.sample_value)],
        y: [sorted_bar.map(dataPoint => dataPoint.otu_id)],
        text: [sorted_bar.map(dataPoint => dataPoint.otu_label)]
      });
  
      // Restyle the bubble chart
      Plotly.restyle("bubble", {
        x: [sorted_bubble.map(dataPoint => dataPoint.otu_id_num)],
        y: [sorted_bubble.map(dataPoint => dataPoint.sample_value)],
        text: [sorted_bubble.map(dataPoint => dataPoint.otu_label)],
        'marker.size': [sorted_bubble.map(dataPoint => dataPoint.sample_value)],
        'marker.color': [sorted_bubble.map(dataPoint => dataPoint.otu_id_num)]
      });
  
      // Update the metadata fields
      const selectedMetaData = data.metadata.find(dataSet => dataSet.id == parseInt(selection));
      const keys = ['id', 'ethnicity', 'gender', 'age', 'location', 'bbtype', 'wfreq'];
      for (const key of keys) {
        d3.select(`#${key}`).text(`${key}: ${selectedMetaData[key]}`);
      }
    })
  }

// Fetch the data and performs the full function
d3.json(url).then(init);
