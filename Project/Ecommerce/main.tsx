
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./utils.css"; // Import our custom utility styles

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
