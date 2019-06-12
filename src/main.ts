import {Person} from './Person';
import { createFilter,  createPartialUpdater, Filter} from './Filter';
import { Subject } from 'rxjs';


let source = new Subject<Person[]>();


let filter = createFilter(source, (values: Person[], filtervals: string) => {
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


interface IIdentifiable {
    id: number
 }
 
 function getId<T extends IIdentifiable>(arg: T): number {
    return arg.id;
 }
 
 let identi = { id : 10 }



//advanced

type FilterType<Base, Condition> = {
    [K in keyof Base]: Base[K] extends Condition ? K : never;
}

type AllowedTypes<Base, Condition> = FilterType<Base, Condition>[keyof Base];

type SubTypes<Base, Condition> = Pick<Base, AllowedTypes<Base, Condition>>;

type PersonBaseTypes = SubTypes<Person, string | number >


interface PersonFilterTypes extends PersonBaseTypes {};

let advancedFilter = createFilter(source,(values: Person[],filterVal: Partial<PersonFilterTypes>) => {
    return values.filter(x => {
        const ret = (filterVal.age == undefined ?   true : filterVal.age === x.age) || (filterVal.name == undefined ?  true : filterVal.name === x.name);
        return ret;
    });
}, {name: 'Gustav', age: 22});


let filterupdatename = createPartialUpdater(advancedFilter, 'name' )
let filterupdateage = createPartialUpdater(advancedFilter,'age');
let filterupdatevalue = createPartialUpdater(advancedFilter,'value');
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

console.log("\n");
console.log("calling..");

filterupdateage.next(undefined);
console.log("calling..");

filterupdatename.next("Gustav");
console.log("calling..");

filterupdateage.next(33);

console.log("calling..");

advancedFilter.updateFilter({name: "Hans", age: 33});

