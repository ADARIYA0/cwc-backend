import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index
} from "typeorm";
import { Store } from "./Store";

@Entity({ name: "sub_categories" })
export class SubCategory {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Index()
    @Column({ type: "uuid" })
    storeId!: string;

    @ManyToOne(() => Store, { onDelete: "CASCADE" })
    @JoinColumn({ name: "storeId" })
    store!: Store;

    @Column({ type: "varchar", length: 100 })
    name!: string;

    @CreateDateColumn({ type: "timestamptz" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamptz" })
    updatedAt!: Date;
}
