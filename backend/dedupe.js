import connectDB from './config/db.js';
import Event from './models/Event.js';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
  await connectDB();
  const events = await Event.find();
  const seen = new Set();
  const duplicates = [];
  const invalid = [];
  
  for (const e of events) {
    if (!e.date || !e.title) {
      invalid.push(e._id);
      continue;
    }
    const key = e.title + e.date.toISOString();
    if (seen.has(key)) {
      duplicates.push(e._id);
    } else {
      seen.add(key);
    }
  }
  
  if (invalid.length > 0) {
    await Event.deleteMany({ _id: { $in: invalid } });
    console.log(`Deleted ${invalid.length} invalid old events.`);
  }

  if (duplicates.length > 0) {
    await Event.deleteMany({ _id: { $in: duplicates } });
    console.log(`Deleted ${duplicates.length} duplicate events.`);
  } else {
    console.log('No duplicates found.');
  }
  process.exit(0);
};

run();
