
import app from "./app";
import { AppDataSource } from "./data-source";

AppDataSource.initialize().then(() => {
    console.log("Banco de dados conectado!");
    app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
}).catch(err => console.error("Erro ao conectar ao banco:", err));
