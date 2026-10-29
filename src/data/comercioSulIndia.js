// Comércio exterior da Região Sul (PR, SC, RS) com a Índia.
// Preencher só com dados oficiais (Comex Stat / MDIC), valores em US$ FOB.
// fluxo: "exportacao" (Sul vende para a Índia) ou "importacao" (Sul compra da Índia).
export const COMERCIO_SUL_INDIA = {
  fonte: "",
  atualizadoEm: "",
  // Total com a Índia e total do estado com o mundo (para a participação da Índia na pauta)
  // { ano, uf, fluxo, valorIndia, valorMundo }
  totais: [],
  // Principais produtos com a Índia: { ano, uf, fluxo, codigo, produto, valor }
  produtos: [],
  // Municípios com comércio com a Índia: { ano, uf, fluxo, cidade, valor }
  cidades: [],
};
