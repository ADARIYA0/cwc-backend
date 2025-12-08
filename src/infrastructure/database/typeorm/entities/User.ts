import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { UserAccountType } from "../../../../domain/enums/UserAccountType";

@Entity({ name: "users" })
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 255 })
    fullName!: string;

    @Index({ unique: true })
    @Column({ type: "varchar", length: 255, unique: true })
    email!: string;

    @Column({ type: "text" })
    password!: string;

    @Column({
        type: "varchar",
        length: 20,
        default: UserAccountType.PEMBELI
    })
    accountType!: UserAccountType;

    @CreateDateColumn({ type: "timestamptz" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamptz" })
    updatedAt!: Date;
}
