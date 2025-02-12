import "reflect-metadata";
import { DataSource } from "typeorm";
import { Receita } from "./entities/Receita";
import { Despesa } from "./entities/Despesa";
import { MesReferencia } from "./entities/MesReferencia";

export const AppDataSource = new DataSource({
    type: "mariadb",
    host: "127.0.0.1",
    port: 3306,
    username: "root",
    password: "db",
    database: "financeiro",
    synchronize: true,
    logging: false,
    entities: [Receita, MesReferencia, Despesa],
    migrations: [],
    subscribers: [],
});
// Em src/data-source.ts
export const initializeDatabase = async () => {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log("📦 Banco de dados conectado!");
        } else {
            console.log("⚠️ Banco de dados já estava conectado.");
        }
    } catch (error) {
        console.error("❌ Erro ao inicializar o banco de dados:", error);
    }
};

