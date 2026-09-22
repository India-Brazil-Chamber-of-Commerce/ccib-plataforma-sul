import React from "react";
import { createRoot } from "react-dom/client";
import CCIBSulAssociados from "./ccib_sul_associados.jsx";

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <CCIBSulAssociados />
  </React.StrictMode>
);
