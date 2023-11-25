import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    AfterInsert,
    AfterRemove,
    AfterUpdate,
} from 'typeorm';
import {
    IsNotEmpty,
    Max,
    MaxLength,
    Min,
} from 'class-validator';
import { TypeByUse } from './TypeByUse';
import { ColumnNumericTransformer } from '../global/classes/ColumnNumbericTransformer';
import { maxLengthErrorMessage, numberMaxMesssage, numberMinMesssage, requiredMessage } from '../utils/helper';
import DrugCategoryCache from '../cache/DrugCategoryCache';

@Entity('drug_categories')
export class DrugCategory {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true, length: 255 })
    @IsNotEmpty({ message: requiredMessage('Tên danh mục thuốc')})
    @MaxLength(255, { message: maxLengthErrorMessage('Tên danh mục thuốc', 255)})
    name: string

    @Column({ type: 'decimal', precision: 15, scale: 2, transformer: new ColumnNumericTransformer() })
    @IsNotEmpty()
    price: number 

    @Column({ length: 20 })
    @IsNotEmpty({ message: requiredMessage('Dạng thuốc')})
    @MaxLength(20, { message: maxLengthErrorMessage('Dạng thuốc', 20)})
    form: string
 
    @Column({ length: 20 })
    @IsNotEmpty({ message: requiredMessage('Đơn vị nhập')})
    @MaxLength(20, { message: maxLengthErrorMessage('Đơn vị nhập', 20)})
    unit: string

    @Column({ length: 20 })
    @IsNotEmpty({ message: requiredMessage('Đơn vị bán')})
    @MaxLength(20, { message: maxLengthErrorMessage('Đơn vị bán', 20)})
    minimalUnit: string

    @Column({ type: 'decimal', precision: 4, scale: 2, transformer: new ColumnNumericTransformer()})
    @Min(0, { message: numberMinMesssage('Thuế VAT', 0)})
    @Max(1, { message: numberMaxMesssage('Thuế VAT', 1)})
    @IsNotEmpty({ message: requiredMessage('Thuế VAT')})
    vat: number

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: new ColumnNumericTransformer() })
    @Min(0, { message: numberMinMesssage('Số lượng quy đổi', 0)})
    @IsNotEmpty({ message: requiredMessage('Số lượng quy đổi')})
    conversionQuantity: number
 
    @ManyToOne(() => TypeByUse, { eager: true })
    @IsNotEmpty({ message: requiredMessage('Công dụng thuốc')})
    @JoinColumn()
    type: TypeByUse

    @Column({ type: 'varchar', length: 255 })
    @IsNotEmpty({ message: requiredMessage('Hướng dẫn sử dụng thuốc')})
    @MaxLength(255, { message: maxLengthErrorMessage('Hướng dẫn sử dụng thuốc', 255)})
    instruction: string

    @Column({ type: 'varchar', length: 255 })
    @IsNotEmpty({ message: requiredMessage('Cách bảo quản thuốc')})
    @MaxLength(255, { message: maxLengthErrorMessage('Cách bảo quản thuốc', 255)})
    preserved: string
    
    @Column()
    @CreateDateColumn()
    createdAt: Date

    @Column()
    @UpdateDateColumn()
    updatedAt: Date

    quantity: number

    @AfterInsert()
    afterInsert() {
        DrugCategoryCache.setDrugCategories(null)
    }

    @AfterRemove()
    afterRemove() {
        DrugCategoryCache.setDrugCategories(null)
    }

    @AfterUpdate()
    afterUpdate() {
        DrugCategoryCache.setDrugCategories(null)
    }
}