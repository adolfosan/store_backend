

export default class QueryParserException extends Error {
    private _select: any = null;
    private _where: any = null;
    
    public get select() { 
        return this._select
    };

    public set select( select: any){
        this._select = select;
    }

    public get where() { 
        return this._where
    };

    public set where( where: any){
        this._where = where;
    }

}