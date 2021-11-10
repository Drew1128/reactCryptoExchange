require('chai')
 .use(require('chai-as-promised'))
 .should()


const Token = artifacts.require('./Token')

contract('Token', (accounts) => {
    describe('deployment', () => {
        it('tracks the name', async () => {
            const token = await Token.new() // fetch token from the blockchain
            const result = await token.name() // read token name here...
            result.should.equal('My Name') // token name is 'My Name'
            
        })
    })
})