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
import { User } from "./User";
import { SubCategory } from "./SubCategory";
import { ProductCategory } from "../../../../domain/enums/ProductCategory";
import { WeightUnit } from "../../../../domain/enums/WeightUnit";

@Entity({ name: "products" })
export class Product {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Index()
    @Column({ type: "uuid" })
    userId!: string;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user!: User;

    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Column({ type: "text", nullable: true })
    description?: string;

    @Index()
    @Column({ type: "enum", enum: ProductCategory })
    category!: ProductCategory;

    @Index()
    @Column({ type: "uuid", nullable: true })
    subCategoryId?: string;

    @ManyToOne(() => SubCategory, { onDelete: "SET NULL", nullable: true })
    @JoinColumn({ name: "subCategoryId" })
    subCategory?: SubCategory;

    @Column({ type: "integer" })
    price!: number;

    @Column({ type: "enum", enum: WeightUnit, default: WeightUnit.KILOGRAM })
    priceUnit!: WeightUnit;

    @Column({ type: "integer", default: 1 })
    priceUnitAmount!: number;

    @Column({ type: "integer" })
    stock!: number;

    @Column({ type: "enum", enum: WeightUnit, default: WeightUnit.KILOGRAM })
    stockUnit!: WeightUnit;

    @Column({ type: "varchar", length: 500 })
    imagePath!: string;

    @CreateDateColumn({ type: "timestamptz" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamptz" })
    updatedAt!: Date;
}

