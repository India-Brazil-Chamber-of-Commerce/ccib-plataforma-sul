// Comércio exterior da Região Sul (PR, SC, RS) com a Índia.
// Preencher só com dados oficiais (Comex Stat / MDIC), valores em US$ FOB.
// fluxo: "exportacao" (Sul vende para a Índia) ou "importacao" (Sul compra da Índia).
export const COMERCIO_SUL_INDIA = {
  fonte: "Comex Stat (MDIC)",
  atualizadoEm: "29/10/2026",
  // Anos com dados ainda incompletos no Comex Stat
  anosParciais: [2026],
  // Total com a Índia e total do estado com o mundo (para a participação da Índia na pauta)
  // { ano, uf, fluxo, valorIndia, valorMundo }
  totais: [
    // Paraná x Índia, 2006 a 2026 (planilha do Comex Stat de 29/10/2026)
    { ano: 2006, uf: "PR", fluxo: "exportacao", valorIndia: 57517607 },
    { ano: 2006, uf: "PR", fluxo: "importacao", valorIndia: 58841875 },
    { ano: 2007, uf: "PR", fluxo: "exportacao", valorIndia: 133075984 },
    { ano: 2007, uf: "PR", fluxo: "importacao", valorIndia: 92190620 },
    { ano: 2008, uf: "PR", fluxo: "exportacao", valorIndia: 99031201 },
    { ano: 2008, uf: "PR", fluxo: "importacao", valorIndia: 137839190 },
    { ano: 2009, uf: "PR", fluxo: "exportacao", valorIndia: 294010467 },
    { ano: 2009, uf: "PR", fluxo: "importacao", valorIndia: 114612128 },
    { ano: 2010, uf: "PR", fluxo: "exportacao", valorIndia: 238577342 },
    { ano: 2010, uf: "PR", fluxo: "importacao", valorIndia: 284981144 },
    { ano: 2011, uf: "PR", fluxo: "exportacao", valorIndia: 108586300 },
    { ano: 2011, uf: "PR", fluxo: "importacao", valorIndia: 283472968 },
    { ano: 2012, uf: "PR", fluxo: "exportacao", valorIndia: 291328602 },
    { ano: 2012, uf: "PR", fluxo: "importacao", valorIndia: 233109554 },
    { ano: 2013, uf: "PR", fluxo: "exportacao", valorIndia: 139827608 },
    { ano: 2013, uf: "PR", fluxo: "importacao", valorIndia: 247519224 },
    { ano: 2014, uf: "PR", fluxo: "exportacao", valorIndia: 239414930 },
    { ano: 2014, uf: "PR", fluxo: "importacao", valorIndia: 409902232 },
    { ano: 2015, uf: "PR", fluxo: "exportacao", valorIndia: 481437533 },
    { ano: 2015, uf: "PR", fluxo: "importacao", valorIndia: 175820272 },
    { ano: 2016, uf: "PR", fluxo: "exportacao", valorIndia: 294516036 },
    { ano: 2016, uf: "PR", fluxo: "importacao", valorIndia: 158369953 },
    { ano: 2017, uf: "PR", fluxo: "exportacao", valorIndia: 323781737 },
    { ano: 2017, uf: "PR", fluxo: "importacao", valorIndia: 182990551 },
    { ano: 2018, uf: "PR", fluxo: "exportacao", valorIndia: 377577637 },
    { ano: 2018, uf: "PR", fluxo: "importacao", valorIndia: 355469118 },
    { ano: 2019, uf: "PR", fluxo: "exportacao", valorIndia: 212428298 },
    { ano: 2019, uf: "PR", fluxo: "importacao", valorIndia: 487251668 },
    { ano: 2020, uf: "PR", fluxo: "exportacao", valorIndia: 203948443 },
    { ano: 2020, uf: "PR", fluxo: "importacao", valorIndia: 431824728 },
    { ano: 2021, uf: "PR", fluxo: "exportacao", valorIndia: 250265385 },
    { ano: 2021, uf: "PR", fluxo: "importacao", valorIndia: 519310831 },
    { ano: 2022, uf: "PR", fluxo: "exportacao", valorIndia: 751150347 },
    { ano: 2022, uf: "PR", fluxo: "importacao", valorIndia: 932303025 },
    { ano: 2023, uf: "PR", fluxo: "exportacao", valorIndia: 641183137 },
    { ano: 2023, uf: "PR", fluxo: "importacao", valorIndia: 555296134 },
    { ano: 2024, uf: "PR", fluxo: "exportacao", valorIndia: 439866225 },
    { ano: 2024, uf: "PR", fluxo: "importacao", valorIndia: 504257868 },
    { ano: 2025, uf: "PR", fluxo: "exportacao", valorIndia: 548897650 },
    { ano: 2025, uf: "PR", fluxo: "importacao", valorIndia: 538749008 },
    { ano: 2026, uf: "PR", fluxo: "exportacao", valorIndia: 773985051 },
    { ano: 2026, uf: "PR", fluxo: "importacao", valorIndia: 407632289 },
  ],
  // Principais produtos com a Índia: { ano, uf, fluxo, codigo, produto, valor }
  produtos: [],
  // Municípios com comércio com a Índia: { ano, uf, fluxo, cidade, valor }
  cidades: [],
};
