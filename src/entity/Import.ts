import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import {
    IsDate,
    IsNotEmpty,
} from 'class-validator';
import { Staff } from './Staff';
import { Provider } from './Provider';
import { typeInvalidMessage } from '../utils/helper';
import { ImportDetail } from './ImportDetail';
import { AppDataSource } from '../dataSource';

@Entity('imports')
export class Import {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'datetime'})
    @IsDate({ message: typeInvalidMessage('Ngày nhập thuốc')})
    importDate: Date

    @ManyToOne(() => Staff, {eager: true})
    @JoinColumn()
    staff: Staff

    @ManyToOne(() => Provider, {eager: true})
    @JoinColumn()
    provider: Provider 

    @Column({ type: 'text', nullable: true })
    note!: string

    @Column()
    @CreateDateColumn()
    createdAt: Date

    @Column()
    @UpdateDateColumn()
    updatedAt: Date

    async getImportDetail() {
        const importDetailRepository = AppDataSource.getRepository(ImportDetail)
        const importDetails = await importDetailRepository.find({ where: { import: { id: this.id } } })
        return importDetails
    }
}