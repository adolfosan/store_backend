import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn} from 'typeorm'
import { IProduct } from "src/common/interfaces/product.interface";

@Entity()
export class Product implements IProduct {
    
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column({
        type:'text',
        nullable: false
    })
    name: string

    @Column({
        nullable: false
    })
    cost: number;

    @Column()
    department: string;

    @Column()
    category: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
};