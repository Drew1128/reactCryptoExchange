import { EVM_REVERT, tokens } from '../helpers'

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
        let amount 
        let result 

        describe('success', async ()=>{

            beforeEach(async () => {
                amount = tokens(100)
                result = await token.transfer(receiver, amount, {from: deployer})
            })
    
            it('transfers token balances', async () =>{
                let balanceOf
                // before transfer
                balanceOf = await token.balanceOf(deployer)
                console.log('deployer balance before transfer', balanceOf.toString())
                balanceOf = await token.balanceOf(receiver)
                console.log("reciever balance before transfer", balanceOf.toString())
    
                // Transfer (The from value is the function meta date)
                
    
                // Balances after transfer
                balanceOf = await token.balanceOf(deployer)
                balanceOf.toString().should.equal(tokens(999900).toString())
                balanceOf = await token.balanceOf(receiver)
                balanceOf.toString().should.equal(tokens(100).toString())
            })
    
            it('emits a transfer event', async () => {
                const log = result.logs[0]
                log.event.should.equal('Transfer')
                const event = log.args
                event.from.toString().should.equal(deployer, "from is correct")
                event.to.toString().should.equal(receiver, "to is correct")
                event.value.toString().should.equal(amount.toString(), "value is correct")
            })
        })

        describe('failure', async () => {

            it('rejects insufficint balances', async () => {
                let invalidAmount
                invalidAmount = tokens(100000000000)
                await token.transfer(receiver, invalidAmount, {from : deployer}).should.be.rejectedWith(EVM_REVERT);

                // attemt to transfer tokens when you have none
                invalidAmount = tokens(10)
                await token.transfer(deployer, invalidAmount, {from: receiver }).should.be.rejectedWith(EVM_REVERT)
            })

            it('rejects invalid recipients', async () => {
                await token.transfer(0x0, amount, { from: deployer }).should.be.rejected
            })
        })
    })
})