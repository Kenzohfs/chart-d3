import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { ToastContainer } from "react-toastify";

import jgs from "../assets/jgs-inverted.json";

import "react-toastify/dist/ReactToastify.css";
import "./styles.css";

const mapRatio = 0.5;
const margin = { top: 10, bottom: 10, left: 10, right: 10 };
const colorScale = ["#B9EDDD", "#87CBB9", "#569DAA", "#577D86"];

const Jaragua = () => {
  const vizRef = useRef<HTMLDivElement | null>(null);
  const colorGenerator = () =>
    // colorScale[Math.floor(Math.random() * colorScale.length)];
    "#B9EDDD";

  useEffect(() => {
    // [90, 180, -90, -180] - Se aparacer algo assim, quer dizer q o GeJSON precisa ser modificado apagando os Points que aparecem no final do arquivo.
    // jgs.features.forEach((x, i) =>
    //   console.log(x.properties.name + " " + d3.geoBounds(x))
    // );

    const updateDimensions = () => {
      if (!vizRef.current) return;
      const viz = vizRef.current;

      d3.select(viz).selectAll("*").remove();

      let width = parseInt(d3.select(viz).style("width"));
      let height = width * mapRatio;
      width -= margin.left + margin.right;

      const svg = d3
        .select(viz)
        .append("svg")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right);

      // const projection = d3
      //   .geoMercator()
      //   .translate([width / 2, height / 2])
      //   .scale(width);
      const projection = d3.geoMercator().fitSize([width, height], {
        type: "FeatureCollection",
        features: jgs.features as any,
      });

      // const projection = d3
      //   .geoMercator()
      //   .scale(1000) // ajuste o valor conforme necessário
      //   .center([-49.0667, -26.4855]) // centro do mapa, ex: [-49.0667, -26.4855] para Jaraguá do Sul
      //   .translate([width / 2, height / 2]);

      const pathGenerator = d3.geoPath().projection(projection);

      const g = svg
        .append("g")
        .attr("class", "center-container center-items us-state")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      g.append("g")
        .attr("id", "states")
        .selectAll("path")
        .data(jgs.features)
        .enter()
        .append("path")
        .attr("key", (feature: any) => feature.properties.name ?? "not found")
        .attr("d", pathGenerator as any)
        .attr("class", "state")
        .attr("fill", colorGenerator);
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return (
    <>
      <div ref={vizRef} className="viz"></div>
      <ToastContainer />
    </>
  );
};

export default Jaragua;
