import Express from "express";
import Connection from "./database/db.js";
import Cors from "cors";
import bodyParser from "body-parser";
import User from "./model/User.js";
import Conversation from "./model/Conversation.js";
import Message from "./model/Message.js";
import { Server } from "socket.io";

const app = Express();


app.use(Cors());
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

const Port = process.env.PORT || 8888;

Connection();

app.post("/add", async (req, resp) => {
  try {
    let result = await User.findOne({ sub: req.body.sub });
    if (result) {
      resp.status(200).json({ mesg: "User already exist" });
      return;
    } else {
      const NewUser = new User(req.body);
      await NewUser.save();
      console.log(req.body);
      return resp.status(200).json(req.body);
    }
  } catch (error) {
    return resp.status(500).json(error.message);
  }
});

app.get("/getuser", async (req, resp) => {
  try {
    let user = await User.find({});
    return resp.status(200).json(user);
  } catch (error) {
    return resp.status(500).json(error);
  }
});

// connection api

// addCoversation
app.post("/conversation/add", async (req, resp) => {
  try {
    const senderId = req.body.senderId;
    const reciverId = req.body.reciverId;

    let exist = await Conversation.findOne({
      members: [senderId, reciverId],
    });
    if (exist) {
      return resp.status(200).json("Conversation already exist");
    } else {
      let newConversation = await Conversation({
        members: [senderId, reciverId],
      });

      await newConversation.save();
      return resp.status(200).json("New conversation Built");
    }
  } catch (error) {
    return resp
      .status(500)
      .json(
        "some techinical error occured while calling get conversation",
        error
      );
  }
});

// getconversation
app.post("/conversation/get", async (req, resp) => {
  try {
    const senderId = req.body.senderId;
    const reciverId = req.body.reciverId;

    let conversation = await Conversation.findOne({
      members: { $all: [senderId, reciverId] },
    });

    return resp.status(200).json(conversation);
  } catch (error) {
    console.log(error);
    return resp
      .status(500)
      .json(
        "some techinical error occured while calling get conversation",
        error
      );
  }
});

// message added to database

app.post("/message/add", async (req, resp) => {
  try {
    const newMessage = await new Message(req.body);
    await newMessage.save();
    await Conversation.findByIdAndUpdate(req.body.conversationId, {
      message: req.body.text,
    });
    return resp.status(200).json("Message has been sent succesufuly");
  } catch (error) {
    return resp.status(500).json(error);
  }
});

// message calling from data base
app.get("/message/get/:id", async (req, resp) => {
  try {
    const responseMessage = await Message.find({
      conversationId: req.params.id,
    });
    return resp.status(200).json(responseMessage);
  } catch (error) {
    return resp.status(500).json(error);
  }
});

app.listen(Port);


// websocket 
const io = new Server(Port, {
  cors: {
    origin: "http://localhost:5173",
  },
});

let OnlineUser = [];

const adduser = (userdata, socketId) => {
  !OnlineUser.some((user) => user.sub == userdata.sub) &&
  OnlineUser.push({ ...userdata, socketId });
};

// getUser
const getUser = (userId) => {
  console.log("working", userId);
  return OnlineUser.find((user) => user.sub === userId);
};

io.on("connection", (socket) => {
  console.log("User Connected");
  socket.on("addUsers", (userdata) => {
    adduser(userdata, socket.id);
    io.emit("getUsers", OnlineUser);
  });

  socket.on("sendMessage", (data) => {
    const user = getUser(data.reciverId);
    // io.to(User.socketId).emit('getMessage', data)
    io.emit("getMessage", data);
  });
});