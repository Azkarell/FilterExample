
import { Subject, Observable, combineLatest, Subscription, merge, of, never } from 'rxjs';
import { map, filter, publish, tap } from 'rxjs/operators';
import { Person } from './Person';

export abstract class Filter<TValue = {}, FilterValues = {} ,Output = TValue> {

    
    private filterVals: Subject<Partial<FilterValues>> = new Subject<Partial<FilterValues>>();
    constructor( private source: Observable<TValue[]>,public values: Partial<FilterValues> = {}){
        this.filterVals.next(values);
    }

    public updateFilter(input: Partial<FilterValues> = {}){
        this.values = input;
        this.filterVals.next(this.values);
    }

    protected abstract filterValues(values: TValue[] , filters: Partial<FilterValues>  ): Output[];

    public asObservable(): Observable<Output[]>{
        return combineLatest( this.source, merge( of(this.values), this.filterVals.asObservable())).pipe( map( ([values,filters]) => this.filterValues(values,filters)));
    }

}

function createFilterClass<TValue,FilterValues,Output>(filterValues:(values: TValue[] , filters: Partial<FilterValues>) => Output[])  {
    return class extends Filter<TValue,FilterValues ,Output> {
        filterValues = (values: TValue[] = [], filters: Partial<FilterValues> = {}) =>  filterValues(values,filters);
    }
}

export function createFilter<TValue,FilterValues,Output>(source: Observable<TValue[]>,
    filterValues:(values: TValue[], filters: Partial<FilterValues> | FilterValues) => Output[],
    filterVals: Partial<FilterValues> = {} ): Filter<TValue,FilterValues,Output>{

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
type FilterType<Base, Condition> = {
    [K in keyof Base]: Base[K] extends Condition ? K : never;
}

type AllowedTypes<Base, Condition> = FilterType<Base, Condition>[keyof Base];

type SubTypes<Base, Condition> = Pick<Base, AllowedTypes<Base, Condition>>;


type Values<T extends Filter<any,any,any>> = T['values'];

type HasProp<T, Prop extends string |number | symbol > = {
    [K in keyof T] : K extends Prop ? K : never;
}[keyof T];



type ExtractTypeFromArray<T extends any[]> = { head: T[0], rest: T }

type GetArrayFromType<T, K extends keyof T> = T[K] extends any[] ? T[K] : never;


type Identifiable<T, Identifier extends string |number |symbol>= {
  [K in keyof T]: K extends Identifier ? K : Exclude<T[K],Function> extends T ? Identifiable<T[K], Identifier> extends Identifier ? K : never  : never
}[keyof T];
type IsAssignable<T,K> = T extends K ? 'yes' : 'no';
type obj = IsAssignable<{},Person>
type obj2 = IsAssignable<{age: number},Partial<Person>>
type p = 'greet' extends 'age' ? 'yes' : 'no'
type tu = PropertiesWithoutFunctions<Person>
type t = HasProp<Person,'greet'>
type personhi = Identifiable<Person,'age'>

type ExcludeFunction<T> =  {
    [K in keyof T] : T[K] extends (...args: any[]) => any ? never : K 
}

type PropertiesWithoutFunctions<T> = ExcludeFunction<T>[keyof T];

export function createPartialUpdater< T extends Filter<any,any,any>, K extends PropertiesWithoutFunctions<Required<Values<T>>>>( o:T, k: K ){
    
    let classobj = createFilterValueWrapperClass<T['values'][K]>( (val?: T['values'][K]) => {
        o.values[k] = val;
        o.updateFilter(o.values);
    });
    const obj = new classobj();
    return <FilterValueWrapper<T['values'][K]>> obj;
}
