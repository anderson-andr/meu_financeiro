import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { MetaFinanceira } from "./MetaFinanceira";

@Entity()
export class MetaAporte {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => MetaFinanceira, (meta) => meta.aportes, { nullable: false, onDelete: "CASCADE" })
    meta!: MetaFinanceira;

    @Column("decimal", { precision: 12, scale: 2 })
    valor!: number;

    @Column({ type: "date" })
    data!: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    observacao?: string | null;

    @CreateDateColumn()
    createdAt!: Date;
}
