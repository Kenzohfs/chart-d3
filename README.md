## How was this made?

### Baixar GeoJSON
GeoJSON é um padrão de estrutura de JSON que é entendível para mapas, imagine como uma forma de entender o mapa em formato de texto.

Para consguir o GeoJSON de qualquer lugar do mundo (se disponível no site), acesse overpass.turbo

[overpass.turbo](http://overpass-turbo.eu/)

Exemplo de Jaraguá do Sul
![Overpass turbo JGS](./src/assets/docs/overpass-turbo.png)

```json
[out:json][timeout:25];
// Define a área de busca para Jaraguá do Sul pelo ID do local
area["name"="Jaraguá do Sul"]->.searchArea;

// Busca todas as relações com boundary=administrative e admin_level=10 (bairros) dentro da área definida
relation["boundary"="administrative"]["admin_level"="10"](area.searchArea);
out body;
>;
out skel qt;
```

### Convertendo GeoJSON para TopoJSON

