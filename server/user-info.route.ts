import {Request, Response} from 'express';
import {db} from './database';

export function userInfo(req: Request, res: Response) {

  const userInfo = req.user;

  console.log('Check if user exists', userInfo);

  const user = db.findUserByEmail(userInfo.email);

  if (!user) {
    db.createUser(userInfo.email, userInfo.sub);
  }

  res.status(200).json({email: user.email});

}
