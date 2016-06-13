import Users from '../db/helper';

const users = new Users();

export default class MyController {
    greet(req, res) {
        if (req.query.name) {
            res.json({
                greeting: `Bonjour ${req.query.name}!`
            });
        } else {
            res.status(400).json({
                message: 'Comment T\'appelle tu?'
            });
        }
    }
    
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