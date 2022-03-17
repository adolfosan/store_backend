import { FindOperator, OrderByCondition } from "typeorm";

interface IPaginate {
    page: number,
    limit: number,
    route: string
}

export default interface TypeORMParser {
    schema?: string,
    table?: string,
    select: Array<string>,
    where: Record< string, FindOperator<any>>,
    paginate: IPaginate,
    sort: OrderByCondition
}   