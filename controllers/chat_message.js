import { ChatMessage } from "../models/index.js";
import { io, getFilePath  } from '../utils/index.js';

function sendText(req, res) {
    const { chat_id, message } = req.body;
    const { user_id } = req.user
   
    const chat_message = new ChatMessage({
        chat: chat_id,
        user: user_id,
        message,
        type: "TEXT",
      });

      chat_message.save()            
            .then(async chatMessgeStorage => { 
                const data = await chatMessgeStorage.populate("user"); 
                chatMessgeStorage.populate("user").then(t => {
                    io.sockets.in(chat_id).emit('message', data);
                    io.sockets.in(`${chat_id}_notify`).emit('message_notify', data)
                    res.status(201).send(t)
                })
                
      }).catch((error) => {
        res.status(400).send({
          message: 'Error al crear el Message del chat'
        })
      });
}


function sendImage(req, res) {
 
    const { chat_id } = req.body;
    const { user_id } = req.user;
 
    const chat_message = new ChatMessage({
      chat: chat_id,
      user: user_id,
      message: getFilePath(req.files.image),
      type: "IMAGE",
    });

    

    chat_message.save()            
            .then(async chatMessgeStorage => { 
                const data = await chatMessgeStorage.populate("user"); 
                chatMessgeStorage.populate("user").then(t => {
                    io.sockets.in(chat_id).emit('message', data);
                    io.sockets.in(`${chat_id}_notify`).emit('message_notify', data)
                    res.status(201).send(t)
                })
                
      }).catch((error) => {
        res.status(400).send({
          message: 'Error al crear el Message del chat'
        })
      });  
}

async function getAll(req, res) {
   const { chat_id } = req.params;
     
    ChatMessage.find({ chat: chat_id })
    .sort({
        createdAt: 1,
    })
    .populate("user")         
    .then(async chats => {       
            res.status(200).json({ messages: chats, total: chats.length });
        }).catch((error) => {
            res.status(400).send({
                msg: 'Error al obtener todos los mensages'
            })
        });   
  }
  
  async function getTotalMessages(req, res) {
   const { chat_id } = req.params;
   ChatMessage.find({ chat: chat_id }).then(messges =>{
    res.status(200).send(JSON.stringify(messges.length));
   }).catch((error) => {
        res.status(400).send({
            msg: 'Error al obtener el total de los mensages'
        })
    });  
  
  }

  async function getLastMessage(req, res) {
   const { chat_id } = req.params;

   ChatMessage.findOne({ chat: chat_id })
    .sort({
        createdAt: -1,
    })       
    .then(async chats => {        
         res.status(200).send(chats || {});
    }).catch((error) => {
        res.status(400).send({
            msg: 'Error al obtener todos los mensages'
        })
    });
}

export const ChatMessageController = {
    sendText,
    sendImage,
    getAll,
    getTotalMessages,
    getLastMessage
}
