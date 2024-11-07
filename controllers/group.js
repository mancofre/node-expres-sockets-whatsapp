import { User, Group, GroupMessage } from "../models/index.js";
import { getFilePath } from "../utils/index.js";

function create(req, res) {
    const { user_id } = req.user;
    const group = new Group(req.body);
    group.creator = user_id;
    group.participants = JSON.parse(req.body.participants);
    group.participants = [...group.participants, user_id];

    console.log(group)
    if (req.files.image) {
        const imagePath = getFilePath(req.files.image);
        group.image = imagePath;
    }

    group.save().then(groupStorage => {
        res.status(200).send(groupStorage)
      }).catch((error) => {
        res.status(400).send({
          message: 'Error al crear Grupo' 
        })
      });
      
}

async function getAll(req, res) {
    const { user_id } = req.user;
    Group.find({  participants: user_id })
          .populate('creator')
          .populate('participants')
          .then(async groups => {
                const arrayGroups = [];
                for (const group of groups) {
                    const response = await GroupMessage.findOne({ group: group._id }).sort({
                        createdAt: -1,
                      });
              
                      arrayGroups.push({
                        ...group._doc,
                        last_message_date: response?.createdAt || null,
                      });
                }
                res.status(200).send(arrayGroups);
          })
          .catch((error) => {
            res.status(400).send({
              msg: 'Error al obtener los grupos'
            })
          }); 
}

function getGroup(req, res) {    
    const group_id = req.params.id;

    Group.findById({ _id: group_id })
          .populate('participants')          
          .then(groupStorage => {
            if (!groupStorage) {
                res.status(400).send({ msg: "No se ha encontrado el grupo" });
            } else {
                res.status(200).send(groupStorage);
            }              
    }).catch((error) => {
      res.status(400).send({
        msg: 'Error de servidor'
      })
    })
}

async function updateGroup(req, res) {
    const { id } = req.params;
    const { name } = req.body;
    
    const group = await Group.findById(id);
    if (name) group.name = name;

    if (req.files.image) {
        const imagePath = getFilePath(req.files.image);
        group.image = imagePath;
    }

    Group.findByIdAndUpdate({ _id: id }, group).then(updatedGroup => {
        res.status(200).send({ image: group.image, name: group.name })
      }).catch((error) => {
        res.status(400).send({
          msg: 'Error al actualizar el grupo'
        })
      })
}

async function exitGroup(req, res) {    
    const { id } = req.params;
    const { user_id } = req.user;
  
    const group = await Group.findById(id);
    const newParticipants = group.participants.filter(
        (participant) => participant.toString() !== user_id
      );

    const newData = {
    ...group._doc,
    participants: newParticipants,
    };

    Group.findByIdAndUpdate({ _id: id }, newData).then(updatedGroup => {
        res.status(200).send({ msg: "Salida exitosa" });
      }).catch((error) => {
        res.status(400).send({
          msg: 'Error al salir del grupo'
        })
      })

    console.log(newData)
}

async function addParticipants(req, res) {
  const { id } = req.params;
  const { users_id } = req.body;

  const group = await Group.findById(id);
  const users = await User.find({ _id: users_id });

  const arrayObjectIds = [];
  users.forEach((user) => {
    arrayObjectIds.push(user._id);
  });

  const newData = {
    ...group._doc,
    participants: [...group.participants, ...arrayObjectIds],
  };

  await Group.findByIdAndUpdate(id, newData);
  Group.findByIdAndUpdate({ _id: id }, newData).then(updatedGroup => {
    res.status(200).send({ msg: "Participantes añadidos correctamente" });
  }).catch((error) => {
    res.status(400).send({
      msg: 'Error al salir del grupo'
    })
  })

}

async function banParticipant(req, res) {
  const { group_id, user_id } = req.body;
  const group = await Group.findById(group_id);

  const newParticipants = group.participants.filter(
    (participant) => participant.toString() !== user_id
  );

  const newData = {
    ...group._doc,
    participants: newParticipants,
  };

  Group.findByIdAndUpdate({ _id: group_id }, newData).then(updatedGroup => {
    console.log(updatedGroup)
    res.status(200).send({ msg: "Baneo con existo" });
  }).catch((error) => {
    res.status(400).send({
      msg: 'Error al salir del grupo'
    })
  })

  //res.status(200).send({ msg: "Baneo con existo" });
}

export const GroupController = {
  create,
  getAll,
  getGroup,
  updateGroup,
  exitGroup,
  addParticipants,
  banParticipant,
};