import { tokens } from '../helpers'

const Token = artifacts.require('./Token')

require('chai')
 .use(require('chai-as-promised'))
 .should()



contract('Token', ([deployer, receiver]) => {
    const name = 'Drew Token'
    const symbol = 'Drew'
    const decimals = '18'
    const totalSupply = tokens(1000000).toString()
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

        it('tracks the decimal', async () => {
            const result = await token.decimals() 
            result.toString().should.equal(decimals) 
        })

        it('tracks the total supply', async () => {
            const result = await token.totalSupply() 
            result.toString().should.equal(totalSupply.toString())  
        })

       it('assigns the total supply to the deployer', async () => {
           const result = await token.balanceOf(deployer)
           result.toString().should.equal(totalSupply.toString())
       })


    })

    describe ('sending Tokens', ()=> {

        it('transfers token balances', async () =>{
            let balanceOf
            // before transfer
            balanceOf = await token.balanceOf(deployer)
            console.log('deployer balance before transfer', balanceOf.toString())
            balanceOf = await token.balanceOf(receiver)
            console.log("reciever balance before transfer", balanceOf.toString())

            // Transfer (The from value is the function meta date)
            await token.transfer(receiver, tokens(100), {from: deployer})

            // Balances after transfer
            balanceOf = await token.balanceOf(deployer)
            console.log('deployer balance after transfer', balanceOf.toString())
            balanceOf = await token.balanceOf(receiver)
            console.log("reciever balance after transfer", balanceOf.toString())


        })
    })
})
