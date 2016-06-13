import {occupations} from './constants';

var occupationRegex = new RegExp(`(${occupations.join('|')})`, 'i');

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
