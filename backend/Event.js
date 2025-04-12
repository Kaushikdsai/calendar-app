import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: String,
  category: String,
  date: String,
  startTime: String,
  endTime: String,
});

const Event = mongoose.model('Event', eventSchema);
export default Event;
