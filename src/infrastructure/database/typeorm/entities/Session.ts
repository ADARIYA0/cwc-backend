import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index
} from "typeorm";
import { User } from "./User";

@Entity({ name: "sessions" })
export class Session {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Index()
    @Column({ type: "uuid" })
    userId!: string;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user!: User;

    @Column({ type: "varchar", length: 255 })
    refreshToken!: string;

    @Column({ type: "varchar", length: 100 })
    device!: string;

    @Column({ type: "varchar", length: 45 })
    ipAddress!: string;

    @Column({ type: "text" })
    userAgent!: string;

    @Column({ type: "boolean", default: false })
    revoked!: boolean;

    @CreateDateColumn({ type: "timestamptz" })
    createdAt!: Date;

    @Column({ type: "timestamptz" })
    expiresAt!: Date;
}
