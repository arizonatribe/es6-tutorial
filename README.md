## Install Node

[NodeJS](https://nodejs.org) is the main dependency for this tutorial project. You can install it directly from their website or you can install a version manager (called [NVM](https://github.com/creationix/nvm)) which allows you to use multiple versions of NodeJS on the same machine. If you wish to install NVM, these are the steps to complete that process (for Mac and Linux users, but Windows users can use [this installer](https://github.com/coreybutler/nvm-windows) and skip the steps below).

First clone the github repository:

```bash
git clone https://github.com/creationix/nvm.git
```

Next, make sure this directory where you cloned the NVM repo is on your environment path. Add this line to your `~/.bashrc`,` ~/.profile`, or `~/.zshrc` (for Mac or Linux users):

```bash
. <your NVM repo folder location>/nvm.sh
```

Now, you can execute the install script we listed in that file:

```bash
source <path to your NVM folder>/nvm.sh
```

Now we are going to pick a version of NodeJS to instal through NVM. For this tutorial, I've chosen 6.2.0, however you can change that in any of the commands I listed to the version you wish to install:

```bash
nvm install v6.2.0
```
The next step directs NVM to use this version (you only need this command if you have more than one version of NodeJS installed through NVM, and so it is not necessary if this is the first version you installed through NVM):

```bash
nvm use v6.2.0
```
Because you may switch between different versions of Node through NVM, you can also set the default version of NodeJS to use in new projects you create:

```bash
nvm alias default v6.2.0
```

Finally, create soft links for "node" and "npm" (note: you must be sure you do not aready have a version of NodeJS installed outside of NVM):

```bash
ln -s <your NVM repo directory>/versions/node/v6.2.0/bin/node /usr/bin/node
ln -s <your NVM repo directory>/versions/node/v6.2.0/bin/npm /usr/bin/npm
```

## Setup and Configure NPM

Create a directory for the project, as well as standard folders for a Node application:

```bash
mkdir -p es6-example/src/server
```

Create a Node package manifest:

```bash
cd es6-example
npm init -y
```

Now you should see a `package.json` manifest in the directory. This file is used to include project dependencies, define details on your project and configure aliases for node or bash scripts.

Next, install several key dependencies and save them to the manifest:

```bash
npm install --save babel-polyfill babel-preset-es2015 babel-register
```

You should now see a `node_modules/` directory where the babel modules we installed are placed.

## Setup and Configure Babel

Babel is a __transpiler__ that allows us to write JavaScript using the syntax we want to use now, even if the browser or the version of Node you're using does not yet support it. It accomplishes this by translating your finished JavaScript into an earlier version automatically. This step happens typically during your build process, allowing you to output a final bundle that is compatible with the current version of the browser or of Node. Babel provides tools for doing this from the command line, or as a plugin to a build tool or as a module for Node.

We are using it as a module for our Node application, which we installed as `babel-register`. We are also using a shim, called `babel-polyfill`, to implement ES6 and ES7 features that would otherwise we unavailable to use. And finally, we installed a preset.

Next, we need to create a configuration file for Babel in the root of our project, which instructs babel to use the ES6 preset we installed. Create a file called `.babelrc` and place the following contents inside:

```js
{
  "presets": ["es2015"]
}
```

To use babel in our Node application, we must import `babel-register` and `babel-polyfill` before any of our ES6 code appears. It is common practice to place those statements into a separate JavaScript file, and have it import your true starting file.

![Node babel import pattern][babel import pattern]

Create a file called `server.babel.js` and place it into the `src/server/` directory. Inside that file place the following three lines of code:

```js
require('babel-polyfill');
require('babel-register');
require('./server.js');
```

Now, create a script alias in your `package.json` directory that will load this file whenever you start your project:

```js
"scripts": {
    "start": "node src/server/server.babel.js"
}
```

This will allow you to start your project by entering the simple command `npm start`.


## Setup and Configure ExpressJS

ExpressJS is a web application framework for NodeJS. While Node contains many tools, the philosophy of Node is to keep "light" and defer to the community of npm module writers to extend and expand Node. The most popular tool for creating Web Applications (RESTful APIs or fully-functioning MVC applications) is [Express](http://expressjs.com).

First, install the express module through npm

```bash
npm install --save express
```

Create a file called `server.js` and place it into the same directory as the `server.babel.js` you created previously. Then, import and then create an instance of Express and set the port number on which it will listen for requests.

```js
import express from 'express';

const app = express();

app.listen(3000);
```

The main purpose of Express is to assist you in parsing HTTP requests and creating HTTP responses. It provides you with a "request" and "response" object into any callback function you pass into the `.use()` method, and additionally a `next` callback function you can invoke if necessary. The `next()` function is useful to invoke if you create a function that is meant to perform some validation, and where failed validation would require stopping the execution and sending a failure response, but passing validation should send the execution to the next function in the chain. This pattern is most useful in defining your routes. Otherwise, you will rely on the "response" object to control the execution flow of the application.

As a simple example, create a callback function that logs the "request" object on every request and a second callback function that response to the endpoint `/greeting` with a "Hello" message.

```js
import express from 'express';

const app = express();

app.use('/', (req, res, next) => {
    console.log(req);
    
    next();
});

app.use('/greeting', (req, res) => {
    res.json({
        message: 'Hello!'
    });
});

app.listen(3000);
```

The more general endpoint `/` is reached even when the user goes to `/greeting`, which allows us to create a "middleware" function that logs the request prior to passing execution to the actual `/greeting` endpoint.

![Middleware execution flow][middleware pattern]

And before we go any further, let's install a couple more common Express middleware tools for handling posted forms and JSON.

```bash
npm install --save body-parser
```

And import/configure them in the `server.js` file

```js
import express from 'express';
import bodyParser from 'body-parser';

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
...
```

We can also improve the middleware logger with an npm module called "bunyan"

```bash
npm install --save bunyan express-bunyan-logger
```

```js
import express from 'express';
import bodyParser from 'body-parser';
import bunyan from 'bunyan';
import expressLog from 'express-bunyan-logger';

const app = express(),
    log = bunyan.createLogger({name: 'server'});

app.use(expressLog());
app.use(expressLog.errorLogger());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
...
```

Now, you can remove the `app.use('/', (req, res, next)` function we created earlier. It might even be useful to output a simple logging message when the application starts, so place the following line at the end of this file:

```js
...

log.info('Express server listening at port 3000');
```

Now we should think about handling multiple routes, so let's create an instance of the Express router. Then we will define routes (GET, POST, PUT, DELETE, etc.) and have express use the router instead of the manual route created earlier (place this before the `app.listen()` line).

```js
...
const router = express.router();

router.get('/greeting', (req, res) => {
    if (req.query.name) {
        res.json({
            message: `Hello ${req.query.name}!`
        });
    } else {
        res.status(400).send({
            message: 'What is your name?'
        });
    }
});

app.use('/', router);
...
```

This endpoint was modified from before to greet the user by name. We are inspecting the query string for a parameter called "name", and sending back an error if it is missing.

Another important feature is to use environment variables to customize the application. We can use environment variables to easily change port numbers, database passwords, and hostnames/IPs for other services we connect to our application. In a Node application, you can simple set an environment variable prior to the `node <path to start file>` command. If we only wished to change the port number for our application, we could alter the `start` script in the `package.json` to look like this:

```
PORT=3000 node src/server/server.babel.js
```

And in our `src/server/server.js` file we can change it to read the port number from the `process.env` instead of hard-coding the port number:

```js
const port = process.env.PORT || 8000;

....
app.listen(port);

log.info(`Express server listening at port ${port}`);
```

The change we made here was to assign the port number to a local variable "port" but to default to a port number of 8000 (you can pick another one if you wish) if no port number was passed in as an environment variable.

This solution is sufficient for our needs in this tutorial so far, however if we find ourselves passing in many environment variables, it will become difficult to set each one on a single command line statement. Additionally, we'll be checking in our `package.json` file into an online repo, and there are a couple problems we can run into doing so. First, we may not want every environment variable to be visible, and second, because we often change environment variable settings during development, it is easy to make a change and then forget to change it back before checking-in our other file changes. The solution to these problems is to create a separate file to hold our environment variable settings (the convention is a file name `.env` in the root folder of our project) and configure our version control (git, svn, tfs, etc.) to exclude it from the repository. In addition to this change, we will also include two new packages in our Node application to automatically handle importing environment variables from the `.env` file in our project root.

So, remove the `PORT=3000` from the start script in the `package.json` and instead place it into a file named `.env` in the root of the project.

Then, modified the `.gitignore` file (or create it, if it is missing) in the project root folder, placing the following line into it to ignore the environment file:

```
.env
```

Next, we need to install two Node packages `dotenv` and `dotenv-expand`

```bash
npm install --save dotenv dotenv-expand
```

And finally, well import those two packages in our `src/server/server.babel.js` file and instantiate them:

```js
require('dotenv-expand')(require('dotenv').config({silent: true}))

require('babel-polyfill');
require('babel-register');
require('./server.js');
```

__Note__: I place that into the `server.babel.js` file for convenience, however as support for newer ES6 and ES7 features arrives natively in Node, the need for Babel may disappear, and though you can then remove the `babel-register` and `babel-polyfill` dependencies, you would need to move the `dotenv` statements from the `server.babel.js` into the `server.js` file. If you ever move those statements, this is what it would look like in ES6 in that file:

```js
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

const locConfig = dotenv.config({silent: true});

dotenvExpand(locConfig);
```

## Generating Random Data with FakerJS

Mock data is essential to testing and development, however it is important to find a balance between creating realistic data and saving time for true development (not wasting too much time on creating realistic test data). One solution to this problem is with a tool called [Faker](https://github.com/marak/Faker.js/), which generates random data for testing/development purposes. You have the ability to generate specific categories of data, such as name, address, numbers, dates, and even images.

This tool can be installed through npm:

```bash
npm install --save faker
```

Using _faker_ is as simple as importing it into a JavaScript file, and specifying a category and type of information to gandomly generate. For example:

```js
import faker from 'faker';

console.log(faker.name.firstName());
```

We can use it to build a set of users for our application, where each user would be created like this:

```js
var user = {
    first: faker.name.firstName(),
    middle: faker.random.number(1) ? faker.name.firstName() : null,
    last: faker.name.lastName(),
    age: faker.random.number(68) + 15,
    gender: ['M', 'F'][faker.random.number(1)]
};
```

This would generate a random first and last name for each user, and occasionally a middlename. This also sets and age for them between 15 and 83 years old, as well as a gender.

Additionally, we may wish to set and occupation for the user, but from a list we create. So if we have a list of possible occupations:

```js
const occupations = [
    'engineer',
    'politician',
    'baker',
    'butcher',
    'mechanic',
    'cook',
    'student',
    'dishwasher',
    'salesman',
    'sailor',
    'farmer',
    'clerk',
    'policeman',
    'nurse',
    'doctor',
    'barber',
    'candlestick maker',
    'taxi driver',
    'carpenter',
    'plumbler',
    'accountant',
    'attorney',
    'teacher'
];
```

We can add a property to the user object that randomly picks from this list:

```js
var user = {
    first: faker.name.firstName(),
    middle: faker.random.number(1) ? faker.name.firstName() : null,
    last: faker.name.lastName(),
    age: faker.random.number(68) + 15,
    occupation: occupations[faker.random.number(occupations.length - 1)],
    gender: ['M', 'F'][faker.random.number(1)]
};
```

For our sample application, we can place this data into a JavaScript file, rather than setting up a full database. This would be a good opportunity to demonstrate the use of classes in ES6 JavaScript. We can create a class that will hold a hundred users and eventually we can put filtering methods onto the class as well.

So lets create a `db/` folder in the `server/` directory and create a file there called `helper.js`.

```js
import faker from 'faker';

const occupations = [
    'engineer',
    'politician',
    'baker',
    'butcher',
    'mechanic',
    'cook',
    'student',
    'dishwasher',
    'salesman',
    'sailor',
    'farmer',
    'clerk',
    'policeman',
    'nurse',
    'doctor',
    'barber',
    'candlestick maker',
    'taxi driver',
    'carpenter',
    'plumbler',
    'accountant',
    'attorney',
    'teacher'
];

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
}
```

We constructed this class to generate 100 new users and assign them to an internal property called `data`. We are also freezing this list so that it cannot be altered accidentally by some other file. So whenever we create an instance of this Users class, these 100 users will be generated (because the code to do so is inside the class constructor).

Because we want to create an application that provides RESTful endpoints, we should think about common ways users may wish to view this data. First, we'll create the methods to perform the filtering (as part of this class) and later we'll create RESTful endpoints that will use those methods to send the requesting user the data in JSON format.

First, we can create a method that retrieves all users

```js
    getUsers() {
        return this.data;
    }
```

Perhaps another useful and simple filter is to retrieve the full names of the users

```js
    getNames() {
        return this.data.map(user =>
            Object.assign({}, {
                name: `${user.first} ${user.middle ? user.middle + ' ' : ''}${user.last}`
            })
        );
    }
```

In this example, the `Array.map()` function was used to transform the shape of the `data` array. The first, middle and last names are concatenated into one string and placed into a new object with only one property, `name`. The `Object.assign()` method is being used here to generate a new object in one statement. If we did NOT use it, the code would appear like this:

```js
var nameObj = {};
nameObj.name = `${user.first} ${user.middle ? user.middle + ' ' : ''}${user.last}`;
return nameObj;
```

Using `Object.assign()` allows for a more compact syntax.

We can also add methods around the `Array.map()` to perform aggregation operations, like _min_ and _max_. This would be useful for finding the oldest and youngest ages in our list of users

```js
    getOldest() {
        return Math.max.apply(null, this.data.map(user => user.age));
    }

    getYoungest() {
        return Math.min.apply(null, this.data.map(user => user.age));
    }
```

In this example, we have to use `.apply()` to allow `Math.min`/`Math.max` to operate on an array of values, rather than a single value.

Also, we can find an average age for our users, and it allows the demonstration of the `Array.reduce()` method:

```js
    getAverageAge() {
        return this.data.map(user => user.age).reduce((a, b) => a + b, 0) / (this.data.length || 1);
    }
```

In this example, a mapped array of numbers (age) is reduced to a single number (each value added to the next, to produce a final total). The total value is then divided by the number of users in our list.

Another common method we will use often in JavaScript is `Array.filter()`, which allows you to selectively display a portion of the overall collection.

```js
    filterByOccupation(occ) {
        return userData.filter(user => user.occupation === occ);
    }
```

In this example, we expect an occupation value to be provided, and we filter the collection of users who have that matching occupation.

And finally, we can create a method to filter users by gender

```js
    filterByGender(gender) {
        return this.data.filter(user =>
            /^m/i.test(gender) ? user.gender === 'M' :
            /^f/i.test(gender) ? user.gender === 'F' :
            user.gender.includes('M', 'F')
        );
    }
```

This example uses case-insensitive regular expressions to match results. It is constructed to return all users if no _gender_ value is passed in to the filtering function.

## Creating Service Endpoints

To make our data accessible to web requests, we need to use Express to create endpoints where users can access the information. We will create an instance of the Express router and define get/post/put/delete methods. Those methods will each correspond to a URL address, such as `/users` for the `getUsers()` method.

### Controllers

But before we define our routes, we need to create a controller to execute methods on the `server/db/helper.js` and format a payload to return to the requester in HTTP responses.

Create a new folder inside the `/server` directory and call it `/controllers`. Inside that new directory, create a file called `myController.js`. We require one dependency in that file, the `db/helper.js`:

```js
import Users from '../db/helper';

const users = new Users();
```

Now we need to define a class with methods to handle each type of query.

```js
export default class MyController {
    users(req, res) {
        res.json({
            users: users.getUsers()
        });
    }

    names(req, res) {
        res.json({
            users: users.getNames()
        });
    }

    average(req, res) {
        res.json({
            age: users.getAverageAge()
        });
    }

    oldest(req, res) {
        res.json({
            age: users.getOldest()
        });
    }

    youngest(req, res) {
        res.json({
            age: users.getYoungest()
        });
    }
    
    findByOccupation(req, res) {
        res.json({
            user: users.findByOccupation(req.occupation)
        });
    }

    findByGender(req, res) {
        res.json({
            user: users.findByGender(req.query.gender || req.body.gender)
        });
    }
}
```

Although this is a lot of code to write in at once, each method is very simple: it invokes the matching `Users` method in the `db/helper.js`, sending it back to the user in a JSON response.

### Routes

Create a new folder inside the `/server` directory and call it `/routes`. Inside that new directory, create a file called `index.js`. Inside that file we need to import express and our controller we created earlier.

```js
import express from 'express';

import MyController from '../controllers/myController'
```

Next, we need to create an instance of the controller and of the express router.

```js
const router = express.Router();
const myController = new MyController();
```

Now we can create endpoints using the `router.get()` or `router.post()` methods. The first argument to pass into that method is a string, representing the endpoint address (such as `/users`), and the second argument is the function to be executed when Express received a web request at that endpoint address.

First, let's define an endpoint to listen to GET requests at `/users`.

```js
router.get('/users', myController.names);
```

Again, the second argument passed into a `router.get()` or any other router methods will be a function to execute. In this case, we provided a function that we imported from our controller.

Let's create the rest of the endpoints now

```js
router.get('/greeting', myController.greet);
router.get('/users', myController.names);
router.get('/users/detail', myController.users);
router.get('/users/occupation', myController.findByOccupation);
router.get('/users/gender', myController.findByGender);
router.get('/users/oldest', myController.oldest);
router.get('/users/youngest', myController.youngest);
router.get('/users/average', myController.average);

export default router;
```

### Custom Validation/Authentication Middleware

You are not limited to a single function to pass into a router method, in fact, you will often see additional methods on endpoints that require authentication or validation that you prefer to separate from the controller method (or third-party middleware functions that you install into your project, which must execute before your controller method).

Let's create a simple validation function to execute before the `myController.findByOccupation`, to make sure the occupation is valid. Create a new file in the `server/db/` directory, named `validation.js` and define a function to parse the query string from the request object to find the occupation provided by the requester.

```js
import {occupations} from './constants';

var occupationRegex = new RegExp(`(${occupations.join('|')})`, 'i');
```

Prior to writing this code, I moved the occupations out of the `server/db/helper.js` and into a new file in the `server/db/` directory, called `constants.js`. Then I imported the occupations from it (make sure to put the word `export` before `const occupations = ...` in the `constants.js`).

Then, I created a regular expression object from the list of occupations, joining them all together, separated by a "pipe" character, to indicate that any of the occupations in the list will be accepatable.

Now we can use the regular expression in a function that parses the query string from the request object

```js
export const validOccupation = (req, res, next) => {
    if (req.query.occupation || req.body.occupation) {
        let occ = req.query.occupation || req.body.occupation;
        
        if (occupationRegex.test(occ)) {
            req.occupation = occ.toLowerCase();
        } else {
            res.status(400).send({
                message: 'Unrecognized Occupation'
            });

            return;
        }
    
        next();
    } else {
        res.status(400).send({
            message: '`occupation` field missing from request'
        });

        return;
    }
};
```

Express will automatically populate the `req`, `res` and `next` object (in that exact order), and we can look at the `req.query` object to find a property on the query string called `occupation`. If it is not there, we will reject the request before proceeding further, and the user will never reach the `myController.findOccupation` function.

Our function is also flexible enough to handle POST requests, because we can look for the `occupation` field on the requst body as well as the query string. Regardless of where the `occupation` property is found, if it passes the regular expression test, the execution flow proceeds to `myController.findOccupation` because we invoked the `next()` method. Prior to passing the user onto `myController.findOccupation` we place the occupation field directly onto the request object (this way, the methods downstream will not need to look at the query and the body objects to find it).

![Express Middleware Flow][middleware flow]

This is how express middleware flow operates: evaluate the `request`, pass to the next methods if conditions are met, until you reach the final method (or if conditions fail to be met), and then you use the `response` object to redirect or send back information to the requester.

## Wrapping Up

Now that your files are all in place you should have a directory structure like this:

```
es6-tutorial/
..src/
....server/
......db/
........"constants.js"
........"helper.js"
........"validation.js"
......controllers/
........"myController.js"
......routes/
........"index.js"
......"server.js"
......"server.babel.js"
.."package.json"
..".babelrc"
..".gitignore"
```

Now we are finished setting up our application and fine-tuning the dependencies, so we should finally be able to start the project.

```bash
npm start
```

Go to the address [localhost:3000/greeting](http://localhost:3000/users) or [localhost:3000/users/occupation?occupation=baker](http://localhost:3000/users/occupation?occupation=baker) and see our greetings.

Additionally, you can use the curl command to hit the endpoints:

```bash
curl -k localhost:3000/users/occupation?occupation=baker
```

Another powerful to to assist you in API development is [Postman](https://www.getpostman.com/). I use this tool quite often when developing and testing an API, and you may find it most useful if you need to query your endpoints a lot during development.

[babel import pattern]: https://github.com/arizonatribe/es6-tutorial/blob/master/node-import.png
[middleware pattern]: https://github.com/arizonatribe/es6-tutorial/blob/master/middleware.png
[middleware flow]: https://github.com/arizonatribe/es6-tutorial/blob/master/middleware-flow.png