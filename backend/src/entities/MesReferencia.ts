import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Receita } from "./Receita";
import { Despesa } from "./Despesa";

@Entity()
export class MesReferencia {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    referencia!: string;

    @Column({ type: "int", nullable: true })
    mes!: number | null;

    @Column({ type: "int", nullable: true })
    ano!: number | null;

    @OneToMany(() => Receita, (receita) => receita.mesReferencia)
    receitas!: Receita[];

    @OneToMany(() => Despesa, (despesa) => despesa.mesReferencia)
    despesas!: Despesa[];
}
