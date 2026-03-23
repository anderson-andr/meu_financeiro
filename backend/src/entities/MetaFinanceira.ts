import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
import { MetaAporte } from "./MetaAporte";

export enum MetaFinanceiraStatus {
    EM_ANDAMENTO = "em_andamento",
    CONCLUIDA = "concluida",
    CANCELADA = "cancelada",
}

@Entity()
export class MetaFinanceira {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, (user) => user.metas, { nullable: false, onDelete: "CASCADE" })
    user!: User;

    @Column()
    nome!: string;

    @Column({ type: "text", nullable: true })
    descricao?: string | null;

    @Column("decimal", { precision: 12, scale: 2 })
    valorObjetivo!: number;

    @Column("decimal", { precision: 12, scale: 2, default: 0 })
    valorInicial!: number;

    @Column({ type: "date" })
    dataInicio!: string;

    @Column({ type: "date" })
    dataLimite!: string;

    @Column({
        type: "enum",
        enum: MetaFinanceiraStatus,
        default: MetaFinanceiraStatus.EM_ANDAMENTO,
    })
    status!: MetaFinanceiraStatus;

    @OneToMany(() => MetaAporte, (aporte) => aporte.meta)
    aportes!: MetaAporte[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
