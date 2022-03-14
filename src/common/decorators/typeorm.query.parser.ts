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
    //parser.where[field] = Not( value);
    return Not( value);
});

wrapper_operator.set('=', (  value)=>{
    //console.log('Equal FindOperator')
    //parser.where[field] = Equal( value);
        return Equal( value);
});

export const TypeORMQueryParser = createParamDecorator(
    ( data: unknown, ctx: ExecutionContext)=>{
    
        const request = ctx.switchToHttp().getRequest();
    const {query} = request;
    
    let parser: TypeORMParser = {
        where: {},
        paginate :{ page: 1, limit: 50 }
    };
    
    const { paginate } = query;
    let { where} = query;

    if( paginate) {
        const split = paginate.split(':');
        if( parseInt( split[0]) && parseInt( split[1])) {
            parser.paginate.page = Number(split[0]);
            parser.paginate.limit = Number(split[1]);
        }
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
                //wrapper_operator.get(operator)(parser, key, payload);
                //console.log(`${key} ${operator} ${payload}`);
            }
        }  
    }
    console.log( parser);
});