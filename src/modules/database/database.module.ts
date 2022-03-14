import { Global, Module } from '@nestjs/common';
import { databaseProvider } from './database.provider';
import { productRepository } from './repositories/product.repository';


@Global()
@Module({
  exports:[ databaseProvider, productRepository],
  providers: [ databaseProvider, productRepository]
})
export class DatabaseModule { 
  
}
