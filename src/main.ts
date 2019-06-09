import {Person} from './Person';
import { createFilter,  createFilterWrapper, Filter} from './Filter';
import { Subject } from 'rxjs';


let source = new Subject<Person[]>();


let filter = createFilter<Person,string,Person>(source, (values: Person[], filtervals: string) => {
    return values.filter(x => x.name === filtervals);    
});


let sub = filter.asObservable().subscribe(x => {
    x.forEach(y => y.greet());
});


source.next(
    [
        new Person({name: "Gustav", age: 25}),
        new Person({name: "Hans", age: 33}),
        new Person({name: "Peter", age: 22}),
    ]
)
console.log("calling..");
filter.updateFilter("Gustav");
console.log("calling..");
filter.updateFilter("Hans");
console.log("calling..");
filter.updateFilter("Peter");

sub.unsubscribe();









//advanced

type FilterType<Base, Condition> = {
    [K in keyof Base]: Base[K] extends Condition ? K : never;
}

type AllowedTypes<Base, Condition> = FilterType<Base, Condition>[keyof Base];

type SubTypes<Base, Condition> = Pick<Base, AllowedTypes<Base, Condition>>;

type PersonBaseTypes = SubTypes<Person, string | number >

interface PersonFilterTypes extends PersonBaseTypes {};
let p: PersonFilterTypes = new Person();

let advancedFilter = createFilter(source,(values: Person[],filterVal: Partial<PersonFilterTypes>) => {
    return values.filter(x => {
        const ret = (filterVal.age == undefined ?   true : filterVal.age === x.age) || (filterVal.name == undefined ?  true : filterVal.name === x.name);
        return ret;
    });
});

let advancedFilter2 = createFilter(source,(values: Partial<Person>[],filterVal: Partial<Person>) => values.map(x => x.name));


let filterupdatename = createFilterWrapper(advancedFilter,'name')
let filterupdateage = createFilterWrapper(advancedFilter,'age');
let filterupdatevalue = createFilterWrapper(advancedFilter,'value');
let sub2 = advancedFilter.asObservable().subscribe(
    x => x.forEach(y => y.greet())
);


source.next(
    [
        new Person({name: "Gustav", age: 25}),
        new Person({name: "Hans", age: 33}),
        new Person({name: "Peter", age: 22}),
    ]
)


console.log("calling..");

filterupdateage.next(undefined);
console.log("calling..");

filterupdatename.next("Gustav");
console.log("calling..");

filterupdateage.next(33);

source.next(undefined);
