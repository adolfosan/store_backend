import { FindOperator } from "typeorm";

interface IPaginate {
    page: number,
    limit: number,
    route: string
}

export default interface TypeORMParser {
    select: Array<string>,
    where: Record< string, FindOperator<any>>,
    paginate: IPaginate,
}   