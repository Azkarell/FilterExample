export class Person {
    name: string = "Peter";
    age: number = 42;
    childs: Person[] = [];

    constructor(data: Partial<Person> = {}){
        let {
            name = this.name,
            age = this.age
        } = data;
        this.name = name;
        this.age = age;
    }

    greet(): void {
        console.log(`${this.name}: hello, I am ${this.age} years old`);
    }

}



