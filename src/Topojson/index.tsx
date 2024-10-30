import * as d3 from "d3";
import { useEffect } from "react";

const Topojson = () => {
  useEffect(() => {
    async function fetchData() {
      let data = await d3.json(
        "https://gist.github.com/Kenzohfs/96b7b419f67139ae57ada5c9f57403c5"
      );
    }

    fetchData();
  }, []);

  return <>testes</>;
};

export default Topojson;
