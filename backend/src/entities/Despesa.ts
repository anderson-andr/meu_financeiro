import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { MesReferencia } from "./MesReferencia";
import { User } from "./User";

export enum DespesaStatus {
    PREVISTO = "previsto",
    REALIZADO = "realizado"
}


@Entity()
export class Despesa {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => MesReferencia)
    mesReferencia!: MesReferencia; // Pode ser um ID ou um objeto
    
    @ManyToOne(() => User)
        user!: User; 

    @Column()
    descricao!: string;
    @Column()
    categoria!: string;

      @Column({
            type: "enum",
            enum: DespesaStatus,
            default: DespesaStatus.PREVISTO
        })
        status!: DespesaStatus;


        @Column("decimal", { nullable: true })
        valorPrevisto!: number;
    
        @Column("decimal", { nullable: true })
        valorRealizado!: number;

    @Column("date")
    data!: string;
}