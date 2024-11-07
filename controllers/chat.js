import { Chat, ChatMessage } from "../models/index.js";

    async function create(req, res) {
      console.log(req.body)
        const { participant_id_one, participant_id_two } = req.body;
        
        const foundOne = await Chat.findOne({
            participant_one: participant_id_one,
            participant_two: participant_id_two,
          });
        
          const foundTwo = await Chat.findOne({
            participant_one: participant_id_two,
            participant_two: participant_id_one,
          });
        
          if (foundOne || foundTwo) {
            res.status(200).send({ msg: "Ya tienes un chat con este usuario" });
            return;
          }
        
          const chat = new Chat({
            participant_one: participant_id_one,
            participant_two: participant_id_two,
          });
         
        chat.save().then(chatStorage => {
            res.status(200).send(chatStorage)
          }).catch((error) => {
            res.status(400).send({
              message: error //'Error al crear chat' 
            })
          })
       
    }
  
  async function getAll(req, res) {
    const { user_id } = req.user;
    const arrayChats = [];

    Chat.find({
            $or: [{ participant_one: user_id }, { participant_two: user_id }],
          })
          .populate('participant_one', '-password')
          .populate('participant_two', '-password')
          .then(async chats => {
            for (const chat of chats) {
              const response = await ChatMessage.findOne({ chat: chat._id }).sort({
                createdAt: -1,
              });
              arrayChats.push({
                ...chat._doc,
                last_message_date: response?.createdAt || null
              });
            }  
            res.status(200).send(arrayChats)

          }).catch((error) => {
            res.status(400).send({
              msg: 'Error al obtener los chats'
            })
          });   
  }
  
  async function deleteChat(req, res) {
    const chat_id = req.params.id
    Chat.findByIdAndDelete({ _id: chat_id })            
            .then(chatDelte => {
              res.status(200).send({ msg: 'Chat eliminado correctamente.' })
    }).catch((error) => {
      res.status(400).send({
        msg: 'Error al Eliminar Chat'
      })
    })
  }
  
  async function getChat(req, res) {
    
    const chat_id = req.params.id;
    Chat.findById({ _id: chat_id })
          .populate('participant_one', '-password')
          .populate('participant_two', '-password')
          .then(chat => {
                  res.status(200).send({ chat })
    }).catch((error) => {
      res.status(400).send({
        msg: 'Error al Obtener el Chat'
      })
    })
  }

export const ChatController = {
    create,
    getAll,
    deleteChat,
    getChat,
  };