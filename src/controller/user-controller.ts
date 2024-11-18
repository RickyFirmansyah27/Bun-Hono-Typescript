import { BaseResponse, Logger } from '../helper';
import { getAllUsers, addUser, deleteUser } from '../service/user-service';
import { Context } from 'hono';

export const getUsersHandler = (c: Context) => {
  const contextLogger = 'UserController';
  const users = getAllUsers();
  Logger.info(`${contextLogger} | getUser`, users);
  return BaseResponse(c, 'User created successfully', 'success', { data: users })
  return c.json(users);
};


export const addUserHandler = async (c: Context) => {
  const body = await c.req.json<{ name: string; email: string }>();
  const user = addUser(body);
  return c.json(user, 201);
};

export const deleteUserHandler = (c: Context) => {
  const id = parseInt(c.req.param('id'), 10);
  const deletedUser = deleteUser(id);
  if (deletedUser) {
    return c.json({ message: 'User deleted successfully' });
  }
  return c.json({ error: 'User not found' }, 404);
};
