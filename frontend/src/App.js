import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";


import EmployeePage from "./pages/EmployeePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route path="/employee" element={<EmployeePage />} />
      </Routes>
    </BrowserRouter>
  );
}