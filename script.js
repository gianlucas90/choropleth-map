const urlEducation =
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';

const urlCounties =
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';

const w = 1000;
const h = 650;
const padding = 100;

const dataColors = [
  '#D6EAF8',
  '#AED6F1',
  '#5DADE2',
  '#2471A3',
  '#1A5276',
  '#154360 ',
];

d3.json(urlCounties).then((data) => {
  const counties = topojson.feature(data, data.objects.counties).features;

  d3.json(urlEducation).then((data) => {
    const eduData = data;

    const extent = d3.extent(eduData, (d) => d.bachelorsOrHigher);

    console.log(extent);

    const colorScale = d3.scaleQuantize().domain(extent).range(dataColors);

    ////////////////////////
    /////// MAIN MAP ///////
    ////////////////////////

    const canvas = d3.select('#map').attr('width', w).attr('height', h);

    const county = canvas
      .selectAll('path')
      .data(counties)
      .enter()
      .append('path')
      .attr('class', 'county')
      .attr('d', d3.geoPath())
      .attr('fill', (countyDataItem) => {
        const id = countyDataItem.id;
        const county = eduData.find((item) => item.fips === id);
        const percentage = county.bachelorsOrHigher;
        return colorScale(percentage);
      })
      .attr('data-fips', (countyDataItem) => countyDataItem.id)
      .attr('data-education', (countyDataItem) => {
        const id = countyDataItem.id;
        const county = eduData.find((item) => item.fips === id);
        const percentage = county.bachelorsOrHigher;
        return percentage;
      });

    ////////////////////////
    /////// TOOLTIP ////////
    ////////////////////////

    const tooltip = d3
      .select('body')
      .append('div')
      .attr('id', 'tooltip')
      .style('opacity', 0);

    county.on('mouseover', handleMouseOver).on('mouseout', handleMouseOut);

    ////////////////////////
    /////// HANDLERS ///////
    ////////////////////////

    function handleMouseOver(e, countyDataItem) {
      const id = countyDataItem.id;
      const county = eduData.find((item) => item.fips === id);
      tooltip.transition().duration(200).style('opacity', 1);
      tooltip
        .html(
          county.state +
            '-' +
            county.area_name +
            '<br/>' +
            county.bachelorsOrHigher +
            '%'
        )
        .style('left', e.x + 'px')
        .style('top', e.y + 'px');

      tooltip.attr('data-education', county.bachelorsOrHigher);
    }

    function handleMouseOut(e, d) {
      tooltip.transition().duration(500).style('opacity', 0);
    }

    function getTicks() {
      const span = (extent[1] - extent[0]) / dataColors.length;
      let tickValues = [];
      let i = extent[0];
      while (i < extent[1]) {
        tickValues.push(i);
        i += span;
      }
      return (tickValues = [...tickValues, extent[1]]);
    }
  });
});
