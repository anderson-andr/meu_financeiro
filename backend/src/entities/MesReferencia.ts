import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Receita } from "./Receita"; // Ajuste se necessário
import { Despesa } from "./Despesa"; // Ajuste se necessário

@Entity()
export class MesReferencia {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    referencia!: string;  // Certifique-se de que a propriedade "referencia" está aqui

    // Relacionamento com a entidade Receita (One-to-Many)
    @OneToMany(() => Receita, (receita) => receita.mesReferencia)
    receitas!: Receita[];

    // Relacionamento com a entidade Despesa (One-to-Many)
    @OneToMany(() => Despesa, (despesa) => despesa.mesReferencia)
    despesas!: Despesa[];
}
