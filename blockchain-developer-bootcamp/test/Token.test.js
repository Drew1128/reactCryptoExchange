const Token = artifacts.require('./Token')

require('chai')
 .use(require('chai-as-promised'))
 .should()

contract('Token', (accounts) => {
    const name = 'Drew Token'
    const symbol = 'Drew'
    const decimals = '18'
    const totalSupply = '1000000000000000000000000'
    let token 

    beforeEach(async () => {
        token = await Token.new()
    })

    describe('deployment', () => {
        it('tracks the name', async () => {
            const result = await token.name() 
            result.should.equal(name) 
        })

        it('tracks the symbol', async () => {
            const result = await token.symbol() 
            result.should.equal(symbol) 
        })

        it('tracks the name', async () => {
            const result = await token.decimals() 
            result.toString().should.equal(decimals) 
        })

        it('tracks the name', async () => {
            const result = await token.totalSupply() 
            result.toString().should.equal(totalSupply)  
        })
    })
})
