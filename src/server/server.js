import express from 'express';
import bodyParser from 'body-parser';
import bunyan from 'bunyan';
import compression from 'compression';
import expressLog from 'express-bunyan-logger';

import routes from './routes/index';

const port = process.env.PORT || 3000,
    log = bunyan.createLogger({name: 'server'}),
    app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(expressLog());
app.use(expressLog.errorLogger());

if (process.env.NODE_ENV === 'production') {
    app.use(compression());
}

app.use('/', routes);

app.listen(port);

log.info(`Server listening on port ${port}`);
