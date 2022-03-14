import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Not, 
         Equal, 
         LessThan, 
         LessThanOrEqual, 
         MoreThan, 
         MoreThanOrEqual,
         Like,
         /*ILike,
         Between,
         In,
         Any,
         IsNull*/
        } from 'typeorm'
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


export const TypeORMQueryParser = createParamDecorator(
    ( data: unknown, ctx: ExecutionContext)=>{
    
    const request = ctx.switchToHttp().getRequest();
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
                parser.where[key] = wrapper_operator.get(operator)( payload);
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

    return parser;
});