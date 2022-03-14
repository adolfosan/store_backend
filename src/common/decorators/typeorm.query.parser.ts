import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Not, 
         Equal, 
         /*LessThan, 
         LessThanOrEqual, 
         MoreThan, 
         MoreThanOrEqual,
         Like,
         ILike,
         Between,
         In,
         Any,
         IsNull*/
        } from 'typeorm'
import TypeORMParser from '../interfaces/typeorm.query.interface';

const wrapper_operator = new Map();


wrapper_operator.set('!=', ( value)=>{
    //console.log('Not FindOperator')
    return Not( value);
});

wrapper_operator.set('=', (  value)=>{
    //console.log('Equal FindOperator')
    return Equal( value);
});

export const TypeORMQueryParser = createParamDecorator(
    ( data: unknown, ctx: ExecutionContext)=>{
    
        const request = ctx.switchToHttp().getRequest();
    const {query} = request;
    
    let parser: TypeORMParser = {
        select:[],
        where: {},
        paginate :{ page: 1, limit: 50, route:'' }
    };
    
    let { where} = query;
    let { select} = query

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
                parser.where[key] = wrapper_operator.get(operator)( payload);
            }
        }  
    }
    return parser;
});