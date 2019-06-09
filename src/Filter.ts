
import { Subject, Observable, combineLatest, Subscription } from 'rxjs';
import { map, filter, publish, tap } from 'rxjs/operators';

export abstract class Filter<TValue = {}, FilterValues = {} ,Output = TValue> {

    
    private filterVals: Subject<Partial<FilterValues>> = new Subject<Partial<FilterValues>>();
    constructor( private source: Observable<TValue[]>,public values: Partial<FilterValues> = {}){
    }

    public updateFilter(input: Partial<FilterValues> = {}){
        this.values = input;
        this.filterVals.next(this.values);
    }

    protected abstract filterValues(values: TValue[] , filters: Partial<FilterValues>  ): Output[];

    public asObservable(): Observable<Output[]>{
        return combineLatest( this.source, this.filterVals.asObservable()).pipe( map( ([values,filters]) => this.filterValues(values,filters)));
    }

}

function createFilterClass<TValue,FilterValues,Output>(filterValues:(values: TValue[] , filteres: Partial<FilterValues>) => Output[])  {
    return class extends Filter<TValue,FilterValues ,Output> {
        filterValues = (values: TValue[] = [], filters: Partial<FilterValues> = {}) =>  filterValues(values,filters);
    }
}

export function createFilter<TValue,FilterValues,Output>(source: Observable<TValue[]>,filterValues:(values: TValue[], filteres: Partial<FilterValues>) => Output[],  filterVals: Partial<FilterValues> = {} ): Filter<TValue,FilterValues,Output>{
    const classval = createFilterClass(filterValues);
    let obj = new classval( source, filterVals); 
    return <Filter<TValue,FilterValues,Output>>obj;
}


export abstract class FilterValueWrapper<T>  {

    constructor(){
        
    }
    next(val?: T){
        this.onUpdate(val);
    }

    protected abstract onUpdate(val?: T): void;
}

function createFilterValueWrapperClass<T>( onUpdate:(val?:T) => void) {
    return class extends FilterValueWrapper<T>{
        onUpdate = (val?: T) => {
            onUpdate(val);
        }
    }
}

export function createFilterWrapper< T extends Filter<any,any,any>, K extends keyof T['values']>( o:T, k: K){
    
    
    let classobj = createFilterValueWrapperClass<T['values'][K]>( (val?: T['values'][K]) => {
        o.values[k] = val;
        o.updateFilter(o.values);
    });
    const obj = new classobj();

    return <FilterValueWrapper<T['values'][K]>> obj;
}
