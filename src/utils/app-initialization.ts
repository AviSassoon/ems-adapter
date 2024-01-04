import { TodoService } from '../services/todo-service';
import { redisService } from '../services/redis-service';

export const fillConfigurationCache = async () => {
  const todoService = new TodoService();
  const todos = await todoService.getTodos();
  await redisService.add(todos);
};
