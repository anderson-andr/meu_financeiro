import { useNavigate } from "react-router-dom";
import './navbar.css'
import Button from '@mui/material/Button';


const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav className="nav">
      

      
      <ul>
        <li>
          <Button variant="contained" onClick={() => navigate("/")}>
            Início
          </Button>
        </li>
        <li><Button onClick={() => navigate("/relatorios")}>Relatórios</Button></li>
        <li><Button onClick={() => navigate("/receitas")}>Receitas</Button></li>
        <li><Button onClick={() => navigate("/despesas")}>Despesas</Button></li>
      </ul>
      
    </nav>
  );
};

export default Navbar;
