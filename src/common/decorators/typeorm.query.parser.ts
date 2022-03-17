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
import QueryParserException from '../exceptions/query.parser.exception';
import TypeORMParser from '../interfaces/typeorm.query.interface';

const wrapper_operator = new Map();

wrapper_operator.set('not', ( value)=>{
    return Not( value);
});

wrapper_operator.set('eq', (  value)=>{
    return Equal( value);
});

wrapper_operator.set('lt', (  value)=>{
    return LessThan( value);
});

wrapper_operator.set('lte', (  value)=>{
    return LessThanOrEqual( value);
});

wrapper_operator.set('gt', (  value)=>{
    return MoreThan( value);
});

wrapper_operator.set('gte', (  value)=>{
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

wrapper_operator.set('between', (  value)=>{
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
                message: 'select:column:notfound',
                args: { columns: invalidColumns.join(',')}
            }
        } 
    }
    return error;
}

function analyzeWhere ( query: any , columns: Array< string>, parser: TypeORMParser) {
    let { where} = query;
    let error = null;
    // me cuadra el formato: <columna>_<operator>=<value> ,ejemplo: name_startwith=ad
    /*console.log( Array.from(wrapper_operator.keys()));
    console.log( Array.from(wrapper_operator.keys()).length);*/
    let operators = [ ...wrapper_operator.keys()];
    if( where){
        if( typeof( where) == 'string') {
            where = [where];
        }
        let hasInvalidColumns: boolean = false;
        let invalidColumns: Array< string> = [];
        /*for(  const idx in where) {
            const split = where[idx].split(':');
            if( split.length == 3) {
                const [cl, operator, payload] = split;
                
                if (columns.includes(cl) == false) {
                    invalidColumns.push( cl);
                    hasInvalidColumns = true;
                }
                
                if( !hasInvalidColumns && wrapper_operator.has( operator)) {
                    parser.where[cl] = wrapper_operator.get(operator)( payload);
                }
            }
        }
        if( hasInvalidColumns) {
            let message = 'where:column:notfound';
            
            if( invalidColumns.length != 1)
                message = 'where:columns:notfound';
            
                error = {
                        message: message,
                        args: { columns: invalidColumns.join(',')}
                }
        }
        */
        //console.log(`(?<column>\\w+)_(?<operator>${operators.join('|')})=(?<value>\\w+)`)
        let reg = new RegExp(`^(?<column>\\w+)_(?<operator>${operators.join('|')})(=(?<value>\\w+))?$`,'i');
        
        for( let w of where) {
            let match = w.match( reg);
            if( match) {
                const { column, operator, value} = match.groups;
                console.log( column + ' '+operator +' '+value);
                if( !columns.includes( column)) {
                    error = {
                        message: 'where:column:notfound',
                        args: { column: column}
                    }
                    break;
                } else if( value == undefined && operator != 'null')  {   
                    error = {
                        message: 'where:query:format:notvalid',
                        args: {}
                    }   
                } else {
                    parser.where[column] = wrapper_operator.get(operator)( value);
                }
            } else {
                error = {
                    message: 'where:query:format:notvalid',
                    args: {}
                }
            }
        }
    }    
    return error;
}

export const TypeORMQueryParser = createParamDecorator(
    async ( data: IDataParserDecorator, ctx: ExecutionContext)=>{
    let hasError: boolean = false;
    let exception = new QueryParserException();
    try {
        const connection = await getConnection( data.connectionName);
        const columns: Array<string> = connection.getMetadata( data.tableName).ownColumns.filter(( cl)=> {
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
            hasError = true;
            exception.addError(errSelect);
        }

        const errWhere = analyzeWhere( query, columns, parser);
        if( errWhere) {
            hasError = true;
            exception.addError(errWhere);
        }

        if( hasError){
            throw exception;
        }
        
        return parser; 
    } catch (error) {
        
        if( error instanceof ConnectionNotFoundError) {
            throw new HttpException( error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        if( error instanceof EntityMetadataNotFoundError) {
            throw new HttpException( error.message, HttpStatus.NOT_FOUND);
        }
        //console.log( queryParserError);
        throw exception;
    }
});