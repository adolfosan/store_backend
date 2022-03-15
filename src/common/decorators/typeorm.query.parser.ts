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
    return Not( value);
});

wrapper_operator.set('=', (  value)=>{
    return Equal( value);
});

wrapper_operator.set('<', (  value)=>{
    return LessThan( value);
});

wrapper_operator.set('<=', (  value)=>{
    return LessThanOrEqual( value);
});

wrapper_operator.set('>', (  value)=>{
    return MoreThan( value);
});

wrapper_operator.set('>=', (  value)=>{
    return MoreThanOrEqual( value);
});

wrapper_operator.set('contains', (  value)=>{
    return Like( `%${ value}%`);
});

wrapper_operator.set('start_with', (  value)=>{
    return Like( `${value}%`);
});

wrapper_operator.set('end_with', (  value)=>{
    return Like( `%${ value}`);
});

wrapper_operator.set('!contains', (  value)=>{
    return Not( Like( `%${ value}%`));
});

wrapper_operator.set('!start_with', (  value)=>{
    return Not( Like( `${value}%`));
});

wrapper_operator.set('!end_with', (  value)=>{
    return Not( Like( `%${ value}`));
});

wrapper_operator.set('<>', (  value)=>{
    let split = value.split('-');
    const [ from, to] = split;
    return Between( from, to);
});

wrapper_operator.set('in', (  value)=>{
    return In( value.split(','));
});

wrapper_operator.set('null', (  value)=>{
    return IsNull();
});

interface IDataParserDecorator {
    connectionName: string, //nombre de la conexion
    tableName: string, //nombre de la tabla
    ignoredColumns: Array<string> //columna a ignorar en el parser
}

type QueryParserError = Record< string, any>;

function analyzeSelect ( query: any , columns: Array< string>, parser: TypeORMParser) {
    let { select} = query;
    let error = null;
    if( select) {
        let columnsFromQuery = select.split(',');
        parser.select = columnsFromQuery;
        let invalidColumns: Array<string> = columnsFromQuery.filter( value =>{
            return columns.indexOf( value) == -1;
        })
        if( invalidColumns.length != 0) {
            error = {
                select: {
                    message: 'column:notfound',
                    args: { columns: invalidColumns.join(',')}
                }
            }
        } 
    }
    return error;
}

function analyzeWhere ( query: any , columns: Array< string>, parser: TypeORMParser) {
    let { where} = query;
    let error = null;
        /*let columnsFromQuery = select.split(',');
        let invalidColumns: Array<string> = columnsFromQuery.filter( value =>{
            return columns.indexOf( value) == -1;
        })
        if( invalidColumns.length != 0) {
            error = {
                select: {
                    message: 'column:notfound',
                    args: { columns: invalidColumns.join(',')}
                }
            }
        } else {
            parser.select = columnsFromQuery;
        }*/
    if( where){
        if( typeof( where) == 'string') {
            where = [where];
        }
        let hasInvalidColumns: boolean = false;
        let invalidColumns: Array< string>;

        for(  const idx in where) {
            const split = where[idx].split(':');
            if( split.length == 3) {
                const [cl, operator, payload] = split;
                
                if (columns.includes(cl) == false) {
                    invalidColumns.push( cl);
                    hasInvalidColumns = true;
                }
                
                if( !hasInvalidColumns && wrapper_operator.has( operator)) {
                    //console.log(`${ cl} ${ operator} ${ payload}`);
                    parser.where[cl] = wrapper_operator.get(operator)( payload);
                }
            }
        }
        
    }
    
    return error;
}

export const TypeORMQueryParser = createParamDecorator(
    async ( data: IDataParserDecorator, ctx: ExecutionContext)=>{
    let queryParserError: QueryParserError;
    try {
        const connection = await getConnection( data.connectionName);
        const columns: Array<string> = connection.getMetadata( data.tableName).ownColumns.filter(( cl)=> {
            //console.log( cl.databaseName+' '+cl.type);
            return !data.ignoredColumns.includes(cl.databaseName);
        }).map( cl => cl.databaseName);

        let parser: TypeORMParser = {
            select:[],
            where: {},
            paginate :{ page: 1, limit: 50, route:'' },
            sort: {}
        };

        const request = ctx.switchToHttp().getRequest();
        const {query} = request;

        const errSelect = analyzeSelect( query, columns, parser);
        if( errSelect) {
            queryParserError = { ...queryParserError, ...errSelect};
        }

        const errWhere = analyzeWhere( query, columns, parser);
        if( errWhere) {
            queryParserError = { ...queryParserError, ...errWhere};
        }

        /*if( queryParserError){
            throw new Error();
        }*/
        return parser; 
    } catch (error) {
        
        if( error instanceof ConnectionNotFoundError) {
            throw new HttpException( error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        if( error instanceof EntityMetadataNotFoundError) {
            throw new HttpException( error.message, HttpStatus.NOT_FOUND);
        }

        throw new HttpException( queryParserError, HttpStatus.BAD_REQUEST);
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