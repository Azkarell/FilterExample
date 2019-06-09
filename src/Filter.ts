
import { Subject, Observable, combineLatest, Subscription } from 'rxjs';
import { map, filter, publish, tap } from 'rxjs/operators';

export abstract class Filter<TValues, FilterValues ,Output> {

    
    private filterVals: Subject<FilterValues> = new Subject<FilterValues>();
    constructor(public values : FilterValues, private source: Observable<TValues[]>){
    }

    public updateFilter(input: FilterValues){
        this.values = input;
        this.filterVals.next(this.values);
    }

    protected abstract onUpdate(values: TValues[], filters: FilterValues ): Output[];

    public asObservable(): Observable<Output[]>{
        return combineLatest( this.source, this.filterVals.asObservable()).pipe( map( ([values,filters]) => this.onUpdate(values,filters)));
    }

}

function createFilterClass<TValue,FilterValues,Output>(onUpdate:(values: TValue[], filteres: FilterValues) => Output[])  {
    return class extends Filter<TValue,FilterValues,Output>{
        onUpdate = onUpdate;
    }
}

export function createFilter<TValue,FilterValues ,Output>(source: Observable<TValue[]>, filterVals: FilterValues,onUpdate:(values: TValue[], filteres: FilterValues) => Output[] ): Filter<TValue,FilterValues,Output>{
    const classval = createFilterClass(onUpdate);
    let obj = new classval(filterVals, source); 
    return <Filter<TValue,FilterValues,Output>>obj;
}


export abstract class FilterValueWrapper<T>  {

    constructor(){
        
    }
    next(val: T){
        this.onUpdate(val);
    }

    protected abstract onUpdate(val: T): void;
}

function createFilterValueWrapperClass<T>( onUpdate:(val:T) => void) {
    return class extends FilterValueWrapper<T>{
        onUpdate = onUpdate;
    }
}

export function createFilterWrapper<Vals, FilterValues, Output, T extends Filter<Vals,FilterValues,Output>, K extends keyof FilterValues>(f: FilterValues, o:T, k: K){
    
    
    let classobj = createFilterValueWrapperClass<FilterValues[K]>( (val) => {
        f[k] = val;
        o.updateFilter(f);
    });
    const obj = new classobj();

    return <FilterValueWrapper<FilterValues[K]>> obj;
}
