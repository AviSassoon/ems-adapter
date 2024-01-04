import { Document, Schema, Model, model } from 'mongoose';

interface TodoAttrs {
  title: string;
  description: string;
  deadline: Date;
  completed?: boolean;
}

interface TodoModel extends Model<TodoDoc> {
  build(attrs: TodoAttrs): TodoDoc;
}

interface TodoDoc extends Document {
  title: string;
  description: string;
  deadline: Date;
  completed?: boolean;
}

const todoSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  deadline: { type: Date, required: true },
  completed: { type: Boolean, default: false },
});

// todoSchema.pre('save', async function (done) {
//   if (this.isModified('password')) {
//     const hashed = await Password.toHash(this.get('password'));
//     this.set('password', hashed);
//   }
//   done();
// });

todoSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

todoSchema.statics.build = (attrs: TodoAttrs) => {
  return new Todo(attrs);
};

const Todo = model<TodoDoc, TodoModel>('Todo', todoSchema);

export { Todo };
