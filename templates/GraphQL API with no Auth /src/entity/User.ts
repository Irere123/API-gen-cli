import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar" })
  username: string;

  @Column({ type: "text", unique: true })
  email: string;

  @CreateDateColumn({ type: "text" })
  createdAt: Date;

  @UpdateDateColumn({ type: "text" })
  updatedAt: Date;
}
