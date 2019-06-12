export class Person {
    name: string = "Peter";
    age: number = 42;
    childs: Person[] = [];
    partner: Person = new Person();
    constructor(data: Partial<Person> = {}){
        let {
            name = this.name,
            age = this.age,
            partner = this.partner,
            childs = this.childs
        } = data;
        this.name = name;
        this.age = age;
        this.partner = partner;
        this.childs = childs;
    }

    greet(): void {
        console.log(`${this.name}: hello, I am ${this.age} years old`);
    }

    get value(): string {
        return "hi";
    }
    set value(val: string) {
        console.log("setting val");
    }

}



