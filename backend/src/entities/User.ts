// src/entities/User.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Receita } from "./Receita";
import { Despesa } from "./Despesa";
import { MetaFinanceira } from "./MetaFinanceira";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    username!: string;

    @Column()
    password!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @OneToMany(() => Receita, (receita) => receita.user)
    receitas!: Receita[];

    @OneToMany(() => Despesa, (despesa) => despesa.user)
    despesas!: Despesa[];

    @OneToMany(() => MetaFinanceira, (meta) => meta.user)
    metas!: MetaFinanceira[];
}

export interface AuthUser {
    id: number;
    username: string;
    userId: number;
}
