import { DATABASE_CONNECTION } from "src/common/constants/database.constants";
import { createConnection } from "typeorm";
import { Product } from "./entities/product.entity";



export const databaseProvider = {
    provide: DATABASE_CONNECTION,
    useFactory: async function(){
        try {
            const connection = await createConnection({
            type: "postgres",
            host: process.env.HOST,
            port: Number(process.env.PORT),
            username: process.env.USERNAME,
            password: process.env.PASSWORD,
            database: process.env.DATABASE,
            synchronize: true,
            entities: [
                Product
            ]
          });
          return connection;
        } catch( err) {
            console.log( err);
        }
    }
}