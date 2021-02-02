import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from './models/users';

const app = express();

// @TODO separate the files
// @TODO setup nodemon

mongoose.connect('mongodb://localhost/pagination', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.once('open', async () => {
  if (await User.countDocuments().exec() > 0) return;
  Promise.all([
    User.create({ name: 'User 1' }),
    User.create({ name: 'User 2' }),
    User.create({ name: 'User 3' }),
    User.create({ name: 'User 4' }),
    User.create({ name: 'User 5' }),
    User.create({ name: 'User 6' }),
    User.create({ name: 'User 7' }),
    User.create({ name: 'User 8' }),
    User.create({ name: 'User 9' }),
    User.create({ name: 'User 10' }),
    User.create({ name: 'User 11' }),
    User.create({ name: 'User 12' }),
  ]).then(() => console.log('created boilerplate users'));
});

declare module 'express-serve-static-core' { // is this allowed?
  export interface Response {
    paginatedResults: {}
  }
}

app.get('/users', paginatedResults(User), (req: Request, res: Response) => {
  res.json(res.paginatedResults);
});

// @TODO correct the types, I was reeeeeally lazy
function paginatedResults(model: any) {
  return async (req: Request, res: Response, next: any) => {
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {} as any;

    if (endIndex < await model.countDocuments().exec()) {
      results.next = {
        page: page + 1,
        limit
      }
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit
      }
    }
    try {
      results.data = await model.find().limit(limit).skip(startIndex).exec()
      res.paginatedResults = results;
      next();
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

app.listen(3000);