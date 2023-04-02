import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
    },

    reciverId: {
      type: String,
    },

    senderId: {
      type: String,
    },

    text: {
      type: String,
    },

    type: {
      type: String,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Messages", messageSchema);

export default Message;
