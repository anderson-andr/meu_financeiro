// src/entities/User.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Receita } from "./Receita";
import { Despesa } from "./Despesa";

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
    receitas!: Receita[]; // Relacionamento com as receitas do usuário
    

    
    @OneToMany(() => Despesa, (despesa) => despesa.user)
    despesas!: Despesa[];
}


export interface AuthUser {
    id: string;
    username: string;
  }