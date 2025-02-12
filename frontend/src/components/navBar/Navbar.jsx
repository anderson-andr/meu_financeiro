import { Link } from "react-router-dom";
import './navbar.css'

const Navbar = () => {
  return (
    <nav className="nav">
      <h1>Análise de Finanças Mensais</h1>
      <ul>
        <li><Link to="/">Início</Link></li>
        <li><Link to="/relatorios">Relatórios</Link></li>
        <li><Link to="/receitas">Receitas</Link></li>
        <li><Link to="/despesas">Despesas</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
