// Receita.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { MesReferencia } from "./MesReferencia";
import { User } from "./User";

export enum ReceitaStatus {
    PREVISTO = "previsto",
    REALIZADO = "realizado"
}

@Entity()
export class Receita {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => MesReferencia)
    mesReferencia!: MesReferencia; 
    
    @ManyToOne(() => User)
    user!: User; 
    @Column()
    descricao!: string;
    
    @Column()
    categoria!: string;


    @Column({
        type: "enum",
        enum: ReceitaStatus,
        default: ReceitaStatus.PREVISTO
    })
    status!: ReceitaStatus;

    @Column("decimal")
    valor!: number;

    @Column("date")
    data!: string;
}
