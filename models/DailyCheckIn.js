import mongoose from "mongoose";

const DailyCheckInSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // YYYY-MM-DD (server-local) rather than a truncated Date, so the
    // {user,date} uniqueness check never drifts across timezones.
    date: { type: String, required: true },
    // One task per day per the one-task-at-a-time rule — carriedOver marks
    // a day where this is a continuation of an earlier day's unfinished task.
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    carriedOver: { type: Boolean, default: false },
    delayReason: { type: String, default: "" },
    checkedInAt: { type: Date, default: null },
    checkedOutAt: { type: Date, default: null },
  },
  { timestamps: true }
);

DailyCheckInSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.models.DailyCheckIn ||
  mongoose.model("DailyCheckIn", DailyCheckInSchema);
