import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DecryptPage from "./pages/DecryptPage";
import "./App.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/decrypt/:id" element={<DecryptPage />} />
    </Routes>
  );
}