import { Module } from '@nestjs/common';
import { ProductModule } from './product/product.module';
import { DepartmentModule } from './department/department.module';
import { CategoryModule } from './category/category.module';
import { DatabaseModule } from './database/database.module';
import { I18nModule, I18nJsonParser} from 'nestjs-i18n'
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config()

@Module({
  imports: [ 
        /*I18nModule.forRoot({
          fallbackLanguage: 'es',
          parser: I18nJsonParser,
          parserOptions: {
            path: path.join(__dirname, '/i18n/'),
            watch: true
          },
        }),*/
        DatabaseModule, 
        ProductModule, 
        DepartmentModule, 
        CategoryModule],
  controllers: [],
  providers: [],
})
export class AppModule {  }
