import { ArgumentsHost, Catch, ExceptionFilter, HttpException} from '@nestjs/common';
import { Response} from 'express'
import QueryParserException from '../exceptions/query.parser.exception';

@Catch( QueryParserException)
export class QueryParserExceptionFilter implements ExceptionFilter {
  catch(exception: QueryParserException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    console.log( exception.select);
    console.log( exception.where);
    /*const statusCode = exception.getStatus();
    const message = exception.getResponse() as Record< string, any>*/
    return response.status( 404).json({ msg:'hello world'});
  }
}
