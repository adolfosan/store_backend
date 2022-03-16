

export default class QueryParserException extends Error {
    private _errors: Array< Record< string, any>> =[];
    
    public get errors() {
        return this._errors;
    }
    
    public addError( err: Record< string, any>) {
        this._errors.push( err);
    }
}