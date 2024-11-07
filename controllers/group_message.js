import { GroupMessage } from "../models/index.js";
import { io, getFilePath } from "../utils/index.js";

function sendText(req, res) {
  const { group_id, message } = req.body;
  const { user_id } = req.user;

  const group_message = new GroupMessage({
    group: group_id,
    user: user_id,
    message,
    type: "TEXT",
  });

  group_message.save()            
            .then(async groupMessgeStorage => { 
                const data = await groupMessgeStorage.populate("user"); 
                groupMessgeStorage.populate("user").then(t => {
                    io.sockets.in(group_id).emit("message", data);
                    io.sockets.in(`${group_id}_notify`).emit("message_notify", data);
                    res.status(201).send({t});
                })
                
      }).catch((error) => {
        res.status(400).send({
          message: 'Error al crear el Message del Grupo'
        })
      });
}

function sendImage(req, res) {
  const { group_id } = req.body;
  const { user_id } = req.user;

  const group_message = new GroupMessage({
    group: group_id,
    user: user_id,
    message: getFilePath(req.files.image),
    type: "IMAGE",
  });

  group_message.save()            
            .then(async groupMessgeStorage => { 
                const data = await groupMessgeStorage.populate("user"); 
                groupMessgeStorage.populate("user").then(t => {
                    io.sockets.in(group_id).emit('message', data);
                    io.sockets.in(`${group_id}_notify`).emit('message_notify', data)
                    res.status(200).send(t)
                })
                
      }).catch((error) => {
        res.status(400).send({
          message: 'Error al crear el Message del chat'
        })
      }); 
}

async function getAll(req, res) {
  
  const { group_id } = req.params;

  GroupMessage.find({ group: group_id })
    .sort({
        createdAt: 1,
    })
    .populate("user")         
    .then(async msgs => {        
            res.status(200).json({ messages: msgs, total: msgs.length });
        }).catch((error) => {
            res.status(400).send({
                msg: 'Error al obtener todos los mensages'
            })
        });  
}

async function getTotalMessages(req, res) {

  const { group_id } = req.params;

  GroupMessage.find({ group: group_id })
    .then(async msgs => {        
        res.status(200).json(JSON.stringify(msgs.length));
    }).catch((error) => {
        res.status(400).send({
            msg: 'Error del servidor'
        })
    }); 
}

async function getLastMessage(req, res) {
  const { group_id } = req.params;

  try {
    const response = await GroupMessage.findOne({ group: group_id })
      .sort({ createdAt: -1 })
      .populate("user");

    res.status(200).send(response || {});
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor" });
  }
}

export const GroupMessageController = {
  sendText,
  sendImage,
  getAll,
  getTotalMessages,
  getLastMessage,
};