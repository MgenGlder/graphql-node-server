# Example GraphQL Server in Node.JS
A quick graphql implementation

_Note I did not make this_

To kill the port when the terminal is no longer accessible:

`kill -9 $(lsof -ti:4000)`
## Setup
- `brew install --cask graphiql`
- `npm install`
- `node server.js`



![screenGrab](./screenGrab.png)

## Example Query
`query{
  warriors {
    name
    id
  }
  horsemen(num: 2) {
    name
    id
  }
  pikemen {
  	... on Pikeman {
    	name
      id
  	}
  }
}`