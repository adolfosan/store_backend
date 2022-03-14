import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from 'src/common/constants/database.constants';
import { Equal, Not, Repository, TypeORMError } from 'typeorm';
import { Product } from '../database/entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  paginate,
  Pagination,
  IPaginationOptions,  
} from 'nestjs-typeorm-paginate'
import TypeORMParser from 'src/common/interfaces/typeorm.query.interface';

@Injectable()
export class ProductService {

  constructor ( 
    @Inject( PRODUCT_REPOSITORY) private repository: Repository< Product>) {

  }

  async create(createProductDto: CreateProductDto): Promise< Product>{
    try {
      let r = await this.repository.save( createProductDto);
      return r;
    } catch (error) {
      console.log( error);
      throw  error;
    }
  }

  async filter(parser: TypeORMParser ): Promise< Pagination<Product>>{
    try {
      const queryBuilder = this.repository.createQueryBuilder('p');
      
      return  paginate<Product>( queryBuilder, parser.paginate);
    } catch( err) {
      if( err instanceof TypeORMError) {
        console.log('asasasasasasas');
      }
    }
  }
  
  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async remove(id){
    try {
      let r = await this.repository.delete({
        id: id
      })
      return r;
    } catch (error) {
      throw error;
    }
  }

}
