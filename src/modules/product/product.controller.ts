import { Controller, 
         Get, 
         Post, 
         Body, 
         Patch, 
         Param, 
         Delete, 
         HttpException, 
         HttpStatus, Res, 
         DefaultValuePipe, 
         ParseIntPipe, 
         Query, 
         Request,
         Req } from '@nestjs/common';

import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { DeleteResult } from 'typeorm';
import { query, Response} from 'express'
import * as uuid from 'uuid'
import { Pagination } from 'nestjs-typeorm-paginate';
import { TypeORMQueryParser } from 'src/common/decorators/typeorm.query.parser';
import TypeORMParser from 'src/common/interfaces/typeorm.query.interface';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
      try {
        let r = await this.productService.create( createProductDto);
        return r;
      } catch( err) {
        return err;
      }
  }

  @Get()
  async filter( 
    @TypeORMQueryParser() parser: TypeORMParser, @Req() req: Request) {
    
    const route = `http://${req.headers['host']+req.url}`;
    parser.paginate.route = route;

    return await this.productService.filter(parser);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(+id, updateProductDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res: Response)  {
    
    if( !uuid.validate( id)) {
      throw new HttpException('product:id:notvalid',HttpStatus.BAD_REQUEST);
    }

    try {
      let r: DeleteResult = await this.productService.remove( id);
      if( r.affected == 0) {
        throw new HttpException('product:id:notfound', HttpStatus.BAD_REQUEST);
      }
      return  res.status( HttpStatus.ACCEPTED).send('asas');
    } catch( err) {
      throw err;
    }
  }
}
