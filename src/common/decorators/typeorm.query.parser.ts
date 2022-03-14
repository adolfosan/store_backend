import { createParamDecorator, ExecutionContext, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { Not, 
         Equal, 
         LessThan, 
         LessThanOrEqual, 
         MoreThan, 
         MoreThanOrEqual,
         Like,
         ILike,
         Between,
         In,
         IsNull,
         getRepository,
         Connection,
         getConnection,
         ConnectionNotFoundError,
         EntityMetadataNotFoundError
        } from 'typeorm'
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
import TypeORMParser from '../interfaces/typeorm.query.interface';

const wrapper_operator = new Map();

wrapper_operator.set('!=', ( value)=>{
    //console.log('Not FindOperator')
    //console.log(where => <column>:<operator>:value)
    return Not( value);
});

wrapper_operator.set('=', (  value)=>{
    //console.log('Equal FindOperator')
    //console.log(where => <column>:<operator>:value)
    return Equal( value);
});

wrapper_operator.set('<', (  value)=>{
    //console.log('LessThan FindOperator')
    //console.log(where => <column>:<operator>:value)
    return LessThan( value);
});

wrapper_operator.set('<=', (  value)=>{
    //console.log('LessThanOrEqual FindOperator')
    //console.log(where => <column>:<operator>:value)
    return LessThanOrEqual( value);
});

wrapper_operator.set('>', (  value)=>{
    //console.log('MoreThan FindOperator')
    //console.log(where => <column>:<operator>:value)
    return MoreThan( value);
});

wrapper_operator.set('>=', (  value)=>{
    //console.log('MoreThanOrEqual FindOperator')
    //console.log(where => <column>:<operator>:value)
    return MoreThanOrEqual( value);
});

wrapper_operator.set('contains', (  value)=>{
    // Operator LIKE '%value%'
    //console.log('LIKE FindOperator )
    //console.log(where => <column>:<operator>:value)
    return Like( `%${ value}%`);
});

wrapper_operator.set('start_with', (  value)=>{
    // Operator LIKE 'value%'
    //console.log('LIKE FindOperator )
    //console.log(where => <column>:<operator>:value)
    return Like( `${value}%`);
});

wrapper_operator.set('end_with', (  value)=>{
    // Operator LIKE '%value'
    //console.log('LIKE FindOperator )
    //console.log(where => <column>:<operator>:value)
    return Like( `%${ value}`);
});

wrapper_operator.set('!contains', (  value)=>{
    // Operator NOT LIKE '%value%'
    //console.log(' NOT LIKE FindOperator )
    //console.log(where => <column>:<operator>:value)
    return Not( Like( `%${ value}%`));
});

wrapper_operator.set('!start_with', (  value)=>{
    // Operator NOT LIKE 'value%'
    //console.log('NOT LIKE FindOperator )
    //console.log(where => <column>:<operator>:value)
    return Not( Like( `${value}%`));
});

wrapper_operator.set('!end_with', (  value)=>{
    // Operator NOT LIKE '%value'
    //console.log('NOT LIKE FindOperator )
    //console.log(where => <column>:<operator>:value)
    return Not( Like( `%${ value}`));
});

wrapper_operator.set('<>', (  value)=>{
    //console.log('Between FindOperator')
    //console.log(where => <column>:<operator>:value)
    let split = value.split('-');
    const [ from, to] = split;
    return Between( from, to);
});

wrapper_operator.set('in', (  value)=>{
    //console.log('IN FindOperator')
    //console.log(where => <column>:<operator>:value)
    return In( value.split(','));
});

wrapper_operator.set('null', (  value)=>{
    //console.log('NUll FindOperator')
    //console.log(where => <column>:<operator>:value)
    return IsNull();
});

interface IDataParserDecorator {
    connectionName: string, //nombre de la conexion
    tableName: string, //nombre de la tabla
    ignoredColumns: Array<string> //columna a ignorar en el parser
}

export const TypeORMQueryParser = createParamDecorator(
    async ( data: IDataParserDecorator, ctx: ExecutionContext)=>{
    try {
        const connection = await getConnection( data.connectionName);
        
        const columns: Array<string> = connection.getMetadata( data.tableName).ownColumns.filter(( cl)=>{
            return !data.ignoredColumns.includes(cl.databaseName);
        }).map( cl => cl.databaseName);

        
        let parser: TypeORMParser = {
            select:[],
            where: {},
            paginate :{ page: 1, limit: 50, route:'' },
            sort: {}
        };
        return parser    
    } catch (error) {
        console.log( error);
        if( error instanceof ConnectionNotFoundError) {
            throw new HttpException( error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        if( error instanceof EntityMetadataNotFoundError) {
            throw new HttpException( error.message, HttpStatus.NOT_FOUND);
        }
    }
    

    /*const request = ctx.switchToHttp().getRequest();
    const {query} = request;
    
    let parser: TypeORMParser = {
        select:[],
        where: {},
        paginate :{ page: 1, limit: 50, route:'' },
        sort: {}
    };
    
    let { where} = query;
    let { select} = query;
    let { sort} = query;

    if( select) {
        parser.select = select.split(',');
    }

    if ( query['page'] && parseInt( query['page'])) {
        parser.paginate.page = Number( query['page']);
    }

    if ( query['limit'] && parseInt( query['limit'])) {
        parser.paginate.limit = Number( query['limit']);
    }

    if( where){
        if( typeof( where) == 'string') {
            where = [where];
        }
        for(  const idx in where) {
            const split = where[idx].split(':');
            if( split.length == 3) {
                const [key, operator, payload] = split;
                if( wrapper_operator.has( operator)) {
                    parser.where[key] = wrapper_operator.get(operator)( payload);
                }
            }
        }  
    }

    if( sort) {
        if( typeof( sort) == 'string') {
            sort = [sort];
        }
        for(  const idx in sort) {
            
            const split = sort[idx].split(':');
            if( split.length == 2) {
                const [key, order] = split;
                parser.sort[key] = order;
            }
        }  
    }

    return parser;*/
});