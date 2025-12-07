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
    @Column({ name: "user_id", type: "uuid" })
    userId!: string;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @Column({ name: "refresh_token", type: "varchar", length: 255 })
    refreshToken!: string;

    @Column({ name: "device", type: "varchar", length: 100 })
    device!: string;

    @Column({ name: "ip_address", type: "varchar", length: 45 })
    ipAddress!: string;

    @Column({ name: "user_agent", type: "text" })
    userAgent!: string;

    @Column({ name: "revoked", type: "boolean", default: false })
    revoked!: boolean;

    @CreateDateColumn({ name: "created_at", type: "timestamptz" })
    createdAt!: Date;

    @Column({ name: "expires_at", type: "timestamptz" })
    expiresAt!: Date;
}
