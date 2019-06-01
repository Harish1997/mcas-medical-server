const express = require('express');
const { ApolloServer } = require('apollo-server-express');
var socket = require('socket.io-client')('http://192.168.100.200:8888/');
const bodyParser = require('body-parser');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
const { makeExecutableSchema } = require('graphql-tools');
var fs = require('fs');
const cors = require('cors');
const fetch = require("node-fetch");
const app = express();
const http = require('http');
let rawdata = fs.readFileSync('data.json');  
let database = JSON.parse(rawdata);  
const { PubSub } = require('apollo-server');
const pubsub = new PubSub();

const MESSAGE_CREATED = 'MESSAGE_CREATED';

url="http://192.168.100.200:8888";

const typeDefs = `
  type Query { 
    patients: [Patient]
    }
    type Patient{
     profilepic:String,
     name:String,
     location:String,
     bloodGroup:String,
     status:String,
     severity:String,
     lat:String,
     lon:String
    }
    type Subscription {
        patientAdded: Patient
      }
    
      type Message {
        id: String
        content: String
      }
`;

// The resolvers
const resolvers = {
    Subscription: { 
                patientAdded: {
                    subscribe: () => pubsub.asyncIterator(MESSAGE_CREATED),
                  }
                 },
  Query: { patients: () => {
      return fetch("http://3.19.58.242/get_data",{
        method:"get",
      }).then(res=>res.json()).then(data=>{
        //  console.log(data.patientsArrayJson);
          return database.patientsArrayJson;
      })
    
  }
 },
};

// Put together a schema
// const schema = makeExecutableSchema({
//   typeDefs,
//   resolvers,
// });

const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  server.applyMiddleware({ app, path: '/graphql' });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen({ port: 8001 }, () => {
  console.log('Apollo Server on http://localhost:8001/graphql');
});



  socket.on('connection', function (data) {
    console.log(data);
    pubsub.publish(MESSAGE_CREATED, {
        data,
      });
  });

  

  
// Initialize the app
// var allowCrossDomain = function(req, res, next) {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  
//     // intercept OPTIONS method
//     if ('OPTIONS' == req.method) {
//       res.send(200);
//     }
//     else {
//       next();
//     }
//   };
//   app.use(cors()) // enable `cors` to set HTTP response header: Access-Control-Allow-Origin: *
//   // The GraphQL endpoint
//   app.use(bodyParser.json())
//   app.use(bodyParser.text({ type: 'application/graphql' }));
//   app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));
//   app.use(bodyParser.text({ type: 'application/graphql' }));
// // The GraphQL endpoint
// app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));

// // GraphiQL, a visual editor for queries
// app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

// io.on('connection', function(socket){
//     console.log('a user connected');
//   });
// // Start the server
// app.listen(3000, () => {
//   console.log('Go to http://localhost:3000/graphiql to run queries!');
// });