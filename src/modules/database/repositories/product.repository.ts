import { DATABASE_CONNECTION, PRODUCT_REPOSITORY } from "src/common/constants/database.constants";
import { Product } from "../entities/product.entity";
import { Connection, getConnection } from "typeorm";

export const productRepository = {
    provide: PRODUCT_REPOSITORY,
    inject: [DATABASE_CONNECTION],
    useFactory: async function(connection: Connection) {
        return await connection.getRepository(Product);
    }
}