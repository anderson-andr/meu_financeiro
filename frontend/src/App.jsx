import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import Navbar from "./components/navBar/Navbar";
import Home from "./pages/home/Home";
import Relatorios from "./pages/relatorios/Relatorios";
import Receitas from "./pages/receitas/Receitas";
import Despesas from "./pages/despesas/Despesas";
import 'remixicon/fonts/remixicon.css'

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/receitas" element={<Receitas />} />
        <Route path="/despesas" element={<Despesas />} />
      </Routes>
    </Router>
  );
}

export default App;
