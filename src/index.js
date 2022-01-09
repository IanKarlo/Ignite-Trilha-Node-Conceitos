const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const username = request.get('username');

  for(let user of users) {
    if(user.username === username) {
      request.user = user;
      return next();
    }
  }

  return response.status(404).json({
    error: 'Mensagem do erro'
  })
}

app.post('/users', (request, response) => {
  try {
    const {name, username} = request.body;

    for(let user of users) {
      if(user.username === username) {
        return response.status(400).json({
          error: "Username already exists"
        })
      }
    }

    const user = {
      id: uuidv4(),
      name,
      username,
      todos: []
    }

    users.push(user)

    return response.status(201).json({
      ...user
    })

  } catch(err) {
    console.log(err);
    return response.status(500).json({
      error: "Internal server error"
    })
  }
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  try {
    const { user } = request;

    const response_array = user.todos

    return response.status(200).send(
      response_array
    )
  } catch(err) {
    console.log(err);
    return response.status(500).json({
      error: "Internal server error"
    })
  }
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  try {
    const { user } = request;
    const {title, deadline} = request.body;

    const todo = {
      id: uuidv4(),
      title,
      done: false,
      deadline: new Date(deadline),
      created_at: new Date()
    }

    user.todos.push(todo);
    return response.status(201).json({
      ...todo
    })
  } catch(err) {
    console.log(err);
    return response.status(500).json({
      error: "Internal server error"
    })
  }
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  try {
    const { user } = request;
    const {title, deadline} = request.body;
    const {id} = request.params;

    for(let todo of user.todos) {
      if(todo.id === id) {
        if(title) {
          todo.title = title;
        }
        if(deadline) {
          todo.deadline = new Date(deadline);
        }

        return response.status(200).json(
          todo
        )
      }
    }

    return response.status(404).json({
      error: "Todo not found"
    })

  } catch(err) {
    console.log(err);
    return response.status(500).json({
      error: "Internal server error"
    })
  }
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  try {
    const { user } = request;
    const {id} = request.params;

    let find = false;

    for(let todo of user.todos) {
      if(todo.id === id) {
        todo.done = true;
        find = true

        return response.status(200).json(
          todo
        )
      }
    }

    if(!find) {
      return response.status(404).json({
        error: "Todo not found"
      })
    }

  } catch(err) {
    console.log(err);
    return response.status(500).json({
      error: "Internal server error"
    })
  }
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  try {
    const { user } = request;
    const {id} = request.params;

    let index = 0;

    for(let todo of user.todos) {
      if(todo.id === id) {
        user.todos.splice(index, 1)
        return response.status(204).end()
      }
      index++;
    }

    return response.status(404).json({
      error: "Todo not found"
    })

  } catch(err) {
    console.log(err);
    return response.status(500).json({
      error: "Internal server error"
    })
  }
});

module.exports = app;