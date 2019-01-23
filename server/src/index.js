import '@babel/polyfill/noConflict'
import server from './server'

server.get('/api/hello', (req, res) => {
  res.send({ express: 'Hello form express' })
})

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  server.use(server.static(path.join(__dirname, 'client/build')));
  // Handle React routing, return all requests to React app
  server.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

server.start({ 
  port: process.env.PORT || 4000,
  playground: '/playground'
}, () => {
  console.log('The server is up!')
})