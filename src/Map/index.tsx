import "react-toastify/dist/ReactToastify.css";

import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";

import countyData from "../assets/counties.json";
import stateData from "../assets/states.json";

import "./styles.css";

const mapRatio = 0.5;

const margin = {
  top: 10,
  bottom: 10,
  left: 10,
  right: 10,
};

const colorScale = ["#B9EDDD", "#87CBB9", "#569DAA", "#577D86"];

const Map = () => {
  const vizRef = useRef<HTMLDivElement | null>(null);

  const colorGenerator = () => {
    return colorScale[Math.floor(Math.random() * 4)];
  };

  useEffect(() => {
    if (!vizRef.current) return; // Verifica se o contêiner existe

    const viz = vizRef.current;

    if (viz.childNodes.length > 0) return;

    let width = parseInt(d3.select(viz).style("width"));

    // const viz = document.querySelector(".viz");

    // if (viz && viz.childNodes.length > 0) return;

    // let width = parseInt(d3.select(".viz").style("width"));

    let height = width * mapRatio;
    let active = d3.select(null);

    width = width - margin.left - margin.right;

    const svg = d3
      // .select(".viz")
      .select(viz)
      .append("svg")
      .attr("class", "center-container")
      .attr("height", height + margin.top + margin.bottom)
      .attr("width", width + margin.left + margin.right);

    svg
      .append("rect")
      .attr("class", "background center-container")
      .attr("height", height + margin.top + margin.bottom)
      .attr("width", width + margin.left + margin.right);

    // Creating projection, it's best to use 'geoAlbersUsa' projection if you're rendering USA map and for other maps use 'geoMercator'.
    const projection = d3
      .geoAlbersUsa()
      .translate([width / 2, height / 2])
      .scale(width);

    // Creating path generator fromt the projecttion created above.
    const pathGenerator = d3.geoPath().projection(projection);

    // Creating the container
    const g = svg
      .append("g")
      .attr("class", "center-container center-items us-state")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    // Creating counties layer
    g.append("g")
      .attr("id", "counties")
      .selectAll("path")
      .data((countyData as any).features)
      .enter()
      .append("path")
      .attr("d", pathGenerator)
      .attr("key", (feature: any) => {
        return feature.properties.STATE + feature.properties.COUNTY;
      })
      .attr("class", "county-boundary")
      // @ts-ignore
      .attr("fill", (feature) => {
        // I could directly call colorGenerator instead of calling it in a arrow function, I've added it in that way so that you'd know we can send values from geo json into every step of the map creation.
        return colorGenerator();
      })
      .on("click", resetZoom);

    // Creating state layer on top of counties layer.
    g.append("g")
      .attr("id", "states")
      .selectAll("path")
      .data(stateData.features)
      .enter()
      .append("path")
      .attr("key", (feature: any) => {
        return feature.properties.NAME;
      })
      .attr("d", pathGenerator)
      .attr("class", "state")
      // Here's an example of what I was saying in my previous comment.
      .attr("fill", colorGenerator)
      .on("click", handleZoom);

    function handleZoom(_: any, stateFeature: any) {
      // Set the state backgroud to 'none' so that the counties can be displayed.
      active.classed("active", false);
      //@ts-ignore
      active = d3.select(this).classed("active", true);

      toast.info(`Selected state is ${stateFeature.properties.NAME}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      // Call to zoom in.
      zoomIn(stateFeature);
    }

    function zoomIn(currentState: any) {
      if (!currentState || !currentState.properties) {
        console.error("Invalid currentState:", currentState);
        return;
      }

      // Get bounding box values for the selected county.
      let bounds = pathGenerator.bounds(currentState);

      if (
        !bounds ||
        bounds.length !== 2 ||
        !Array.isArray(bounds[0]) ||
        !Array.isArray(bounds[1]) ||
        bounds[0].length !== 2 ||
        bounds[1].length !== 2 ||
        isNaN(bounds[0][0]) ||
        isNaN(bounds[0][1]) ||
        isNaN(bounds[1][0]) ||
        isNaN(bounds[1][1])
      ) {
        console.error("Invalid bounds:", bounds);
        return;
      }

      // Zoom In calculations
      let dx = bounds[1][0] - bounds[0][0];
      let dy = bounds[1][1] - bounds[0][1];

      let x = (bounds[0][0] + bounds[1][0]) / 2;
      let y = (bounds[0][1] + bounds[1][1]) / 2;

      let scale = 0.9 / Math.max(dx / width, dy / height);
      let translate = [width / 2 - scale * x, height / 2 - scale * y];

      // Updaing the css using D3
      g.transition()
        .duration(750)
        .style("stroke-width", 1.5 / scale + "px")
        .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
    }

    function resetZoom() {
      // Remove the active class so that state color will be restored and conuties will be hidden again.
      active.classed("active", false);
      active = d3.select(null);

      // Resetting the css using D3
      g.transition()
        .delay(100)
        .duration(750)
        .style("stroke-width", "1.5px")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    }
  }, []);

  return (
    <>
      <div ref={vizRef} className="viz"></div>
      <ToastContainer />
    </>
  );
};

export default Map;
