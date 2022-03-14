import { isString, isNotEmpty, isNumber, IsNotEmpty, IsInt, ValidateIf} from 'class-validator'
import { Type} from 'class-transformer'

import { IProduct } from "src/common/interfaces/product.interface";

export class CreateProductDto implements IProduct {
    @IsNotEmpty({
        message:'product:name:empty'
    })
    name: string;

    @IsNotEmpty({
        message:'product:cost:empty'
    })
    @Type( ()=> Number)
    @IsInt({
        message:'product:cost:notint'
    })
    cost: number;

    @IsNotEmpty({
        message:'product:department:empty:'
    })
    department: string;

    @IsNotEmpty({
        message:'product:category:empty:'
    })
    category: string;
}
