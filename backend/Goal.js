import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  name: String,
  color: String,
});

const Goal = mongoose.model('Goal', goalSchema);
export default Goal;
