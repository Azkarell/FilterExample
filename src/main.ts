import {Person} from './Person';
import { createFilter,  createFilterWrapper} from './Filter';
import { Subject } from 'rxjs';


let source = new Subject<Person[]>();

const stringval = "Gustav";

let filter = createFilter<Person,string,Person>(source, stringval,(values: Person[], filtervals: string) => {
    return values.filter(x => x.name === filtervals);    
});


let sub = filter.asObservable().subscribe(x => {
    x.forEach(y => y.greet());
});


source.next(
    [
        new Person({name: "Gustav"}),
        new Person({name: "Gustav2"}),
        new Person({name: "Gustav3"}),
    ]
)
console.log("calling..");
filter.updateFilter("Gustav");
console.log("calling..");
filter.updateFilter("Gustav2");
console.log("calling..");
filter.updateFilter("Gustav3");

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

let advancedFilter = createFilter(source,p,(values: Person[],filterVal: PersonFilterTypes) => {
    return values.filter(x => filterVal.age === x.age || filterVal.name === x.name );
});


let filterupdatename = createFilterWrapper(p,advancedFilter, 'name' );
let filterupdateage = createFilterWrapper(p,advancedFilter,'age');

let sub2 = advancedFilter.asObservable().subscribe(
    x => x.forEach(y => y.greet())
);


source.next(
    [
        new Person({name: "Gustav" , age:23}),
        new Person({name: "Gustav2", age:12}),
        new Person({name: "Gustav3"}),
    ]
)
console.log("calling 12 ..");

filterupdateage.next(12);
console.log("calling 23..");

filterupdateage.next(23);
console.log("calling gustav2..");

filterupdatename.next("Gustav2");
