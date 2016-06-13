import faker from 'faker';
import {occupations} from './constants';

export default class Users {
    constructor() {
        this.data = Array(100).fill().map(i => {
            return {
                first: faker.name.firstName(),
                middle: faker.random.number(1) ? faker.name.firstName() : null,
                last: faker.name.lastName(),
                age: faker.random.number(68) + 15,
                occupation: occupations[faker.random.number(occupations.length - 1)],
                gender: ['M', 'F'][faker.random.number(1)]
            };
        });

        Object.freeze(this.data);
    }

    filterByGender(gender) {
        return this.data.filter(user =>
            /^m/i.test(gender) ? user.gender === 'M' :
            /^f/i.test(gender) ? user.gender === 'F' :
            user.gender.includes('M', 'F')
        );
    }
    
    filterByOccupation(occ) {
        return userData.filter(user => user.occupation === occ);
    }
    
    getNames() {
        return this.data.map(user =>
            Object.assign({}, {
                name: `${user.first} ${user.middle ? user.middle + ' ' : ''}${user.last}`
            })
        );
    }
    
    getUsers() {
        return this.data;
    }
    
    getAverageAge() {
        return this.data.map(user => user.age).reduce((a, b) => a + b, 0) / (this.data.length || 1);
    }

    getOldest() {
        return Math.max.apply(null, this.data.map(user => user.age));
    }

    getYoungest() {
        return Math.min.apply(null, this.data.map(user => user.age));
    }
}
