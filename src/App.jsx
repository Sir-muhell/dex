import React, { useState } from "react";
import "./App.css";

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Swap from "./Screens/Swap";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Swap />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
