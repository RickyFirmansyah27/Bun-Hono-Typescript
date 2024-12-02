import { config } from 'dotenv';
import { Hono } from 'hono';
import { Logger } from './helper/logger';
import { ErrorHandler } from './helper/error-handler';
import { routes } from './routes';
import { httpLogger } from './helper/http-logger';

config();

const app = new Hono();
const port = process.env.PORT || 8000;

app.use('*', httpLogger);
app.onError(ErrorHandler);
app.route('/api', routes);
app.notFound((c) => c.text('Route not found', 404));

Logger.info(`Server running on port ${port}`);

export default app;