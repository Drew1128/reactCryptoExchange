import { EVM_REVERT, ether, tokens, ETHER_ADDRESS } from './../helpers'

const Exchange = artifacts.require('./Exchange')
const Token = artifacts.require('./Token')

require('chai')
    .use(require('chai-as-promised'))
    .should()



contract('Exchange', ([deployer, feeAccount, user1, user2]) => {
    let token
    let exchange
    const feePercent = 10

    beforeEach(async () => {
        // deploy token
        token = await Token.new()
        // transfer some tokens to user1
        token.transfer(user1, tokens(100), { from: deployer })
        // deploy exchange
        exchange = await Exchange.new(feeAccount, feePercent)

    })

    describe('deployment', () => {

        it('tracks the fee account', async () => {
            const result = await exchange.feeAccount()
            result.should.equal(feeAccount)
        })

        it('tracks the fee percent', async () => {
            const result = await exchange.feePercent()
            result.toString().should.equal(feePercent.toString())
        })


    })

    describe('fallback', () => {
        it('reverts when Ether is sent', async () => {
            await exchange.sendTransaction({ value: 1, from: user1 }).should.be.rejectedWith(EVM_REVERT)
        })
    })

    describe('depositing ether', async () => {
        let result
        let amount

        beforeEach(async () => {
            amount = ether(1)
            result = await exchange.depositEther({ from: user1, value: amount })
        })

        it('tracks the Ether deposit', async () => {
            const balance = await exchange.tokens(ETHER_ADDRESS, user1)
            balance.toString().should.equal(amount.toString())
        })

        it('emits a Deposit event', async () => {
            const log = result.logs[0]
            log.event.should.equal('Deposit')
            const event = log.args
            event.token.should.equal(ETHER_ADDRESS, 'Ether address is correct')
            event.user.should.equal(user1, 'user address is correct')
            event.amount.toString().should.equal(amount.toString(), 'amount is correct')
            event.balance.toString().should.equal(amount.toString(), 'balance is correct')
        })

    })

    describe('withdrawing Ether', () => {
        let result
        let amount

        beforeEach(async () => {
            // Deposit Ether first
            amount = ether(1)
            await exchange.depositEther({ from: user1, value: amount })
        })

        describe('success', () => {
            beforeEach(async () => {
                // Withdraw Ether
                result = await exchange.withdrawEther(amount, { from: user1 })
            })

            it('withdraws Ether funds', async () => {
                const balance = await exchange.tokens(ETHER_ADDRESS, user1)
                balance.toString().should.equal('0')
            })

            it('emits a "Withdraw" event', () => {
                const log = result.logs[0]
                log.event.should.eq('Withdraw')
                const event = log.args
                event.token.should.equal(ETHER_ADDRESS)
                event.user.should.equal(user1)
                event.amount.toString().should.equal(amount.toString())
                event.balance.toString().should.equal('0')
            })
        })

        describe('failure', () => {
            it('rejects withdraws for insufficient balances', async () => {
                await exchange.withdrawEther(ether(100), { from: user1 }).should.be.rejectedWith(EVM_REVERT)
            })
        })
    })


    describe('depositing tokens', () => {

        let result
        let amount



        describe('success', async () => {

            beforeEach(async () => {
                amount = tokens(10)
                await token.approve(exchange.address, amount, { from: user1 })
                result = await exchange.depositToken(token.address, amount, { from: user1 })
            })

            it('tracks the token deposit', async () => {
                // check exchange token balance 
                let balance
                balance = await token.balanceOf(exchange.address)
                balance.toString().should.equal(amount.toString())
                // check tokens on exchange 
                balance = await exchange.tokens(token.address, user1)
                balance.toString().should.equal(amount.toString())
            })

            it('emits a Deposit event', async () => {
                const log = result.logs[0]
                log.event.should.equal('Deposit')
                const event = log.args
                event.token.should.equal(token.address, 'token address is correct')
                event.user.should.equal(user1, 'user address is correct')
                event.amount.toString().should.equal(amount.toString(), 'amount is correct')
                event.balance.toString().should.equal(amount.toString(), 'balance is correct')
            })
        })

        describe('failure', async () => {

            it('rejects ether deposits', async () => {
                await exchange.depositToken(ETHER_ADDRESS, tokens(10), { from: user1 }).should.be.rejectedWith(EVM_REVERT)
            })


            it('fails when no tokens are approved', async () => {
                // dont approve any tokens before depositing 
                await exchange.depositToken(token.address, tokens(10), { from: user1 }).should.be.rejectedWith(EVM_REVERT)
            })

        })

    })

    describe('withdrawing Tokens', () => {
        let result
        let amount

        beforeEach(async () => {
            // Deposit tokens first
            amount = ether(10)
            await token.approve(exchange.address, amount, { from: user1 })
            await exchange.depositToken(token.address, amount, { from: user1 })

            // Withdraw tokens
            result = await exchange.withdrawToken(token.address, amount, { from: user1 })
        })

        it('withdraws token funds', async () => {
            const balance = await exchange.tokens(token.address, user1)
            balance.toString().should.equal('0')
        })

        it('emits a "Withdraw" event', async () => {
            const log = result.logs[0]
            log.event.should.equal('Withdraw')
            const event = log.args
            event.token.should.equal(token.address)
            event.user.should.equal(user1)
            event.amount.toString().should.equal(amount.toString())
            event.balance.toString().should.equal('0')
        })


        describe('failure', () => {
            it('rejects ether withdraws', async () => {
                await exchange.withdrawToken(ETHER_ADDRESS, tokens(10), { from: user1 }).should.be.rejectedWith(EVM_REVERT)
            })

            it('fails for insuffficient balances', async () => {
                // attempts to withdraw tokens without depositong any first 
                await exchange.withdrawToken(token.address, tokens(10), { from: user1 }).should.be.rejectedWith(EVM_REVERT)
            })

        })
    })

    describe(' checking balances ', async () => {
        beforeEach(async () => {
          await exchange.depositEther({ from: user1, value: ether(1) })
        })

        it('returns user balance', async () => {
            const result = await exchange.balanceOf(ETHER_ADDRESS, user1)
            result.toString().should.equal(ether(1).toString())

        })

    })

    describe('making orders', async () => {
        let result
    
        beforeEach(async () => {
          result = await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), { from: user1 })
        })
    
        it('tracks the newly created order', async () => {
          const orderCount = await exchange.orderCount()
          orderCount.toString().should.equal('1')
          const order = await exchange.orders('1')
          order.id.toString().should.equal('1', 'id is correct')
          order.user.should.equal(user1, 'user is correct')
          order.tokenGet.should.equal(token.address, 'tokenGet is correct')
          order.amountGet.toString().should.equal(tokens(1).toString(), 'amountGet is correct')
          order.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct')
          order.amountGive.toString().should.equal(ether(1).toString(), 'amountGive is correct')
          order.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
        })
    
        it('emits an "Order" event', async () => {
          const log = result.logs[0]
          log.event.should.eq('Order')
          const event = log.args
          event.id.toString().should.equal('1', 'id is correct')
          event.user.should.equal(user1, 'user is correct')
          event.tokenGet.should.equal(token.address, 'tokenGet is correct')
          event.amountGet.toString().should.equal(tokens(1).toString(), 'amountGet is correct')
          event.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct')
          event.amountGive.toString().should.equal(ether(1).toString(), 'amountGive is correct')
          event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
        })



      })

      describe('order actions', async () => {

        beforeEach(async () => {
          // user1 deposits ether
          await exchange.depositEther({ from: user1, value: ether(1) })
          // user1 makes an order to buy tokens with Ether
          await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), { from: user1 })
        })
    
        describe('cancelling orders', async () => {
          let result
    
          describe('success', async () => {
            beforeEach(async () => {
              result = await exchange.cancelOrder('1', { from: user1 })
            })
    
            it('updates cancelled orders', async () => {
              const orderCancelled = await exchange.orderCancelled(1)
              orderCancelled.should.equal(true)
            })
    
            it('emits a "Cancel" event', async () => {
              const log = result.logs[0]
              log.event.should.eq('Cancel')
              const event = log.args
              event.id.toString().should.equal('1', 'id is correct')
              event.user.should.equal(user1, 'user is correct')
              event.tokenGet.should.equal(token.address, 'tokenGet is correct')
              event.amountGet.toString().should.equal(tokens(1).toString(), 'amountGet is correct')
              event.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct')
              event.amountGive.toString().should.equal(ether(1).toString(), 'amountGive is correct')
              event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
            })
    
          })
    
          describe('failure', async () => {
            it('rejects invalid order ids', async () => {
              const invalidOrderId = 99999
              await exchange.cancelOrder(invalidOrderId, { from: user1 }).should.be.rejectedWith(EVM_REVERT)
            })
    
            it('rejects unauthorized cancelations', async () => {
              // Try to cancel the order from another user
              await exchange.cancelOrder('1', { from: user2 }).should.be.rejectedWith(EVM_REVERT)
            })
          })
        })
      })

      describe('fillOrder()', () => {

        describe('Check balances after filling user1 buy Tokens order', () => {
            
          beforeEach(async () => {
            // user1 deposit 1 ETHER to the exchange
            await exchange.depositEther({from: user1, value: ether(1)})
            // user1 create order to buy 10 tokens for 1 ETHER
            await exchange.makeOrder(token.address, tokens(10), ETHER_ADDRESS, ether(1), {from: user1})
            // user2 gets tokens
            await token.transfer(user2, tokens(11), {from: deployer})
            // user2 approve exchange to spend his tokens
            await token.approve(exchange.address, tokens(11), {from: user2})
            // user2 deposit tokens + fee cost (1 token) to the exchange
            await exchange.depositToken(token.address, tokens(11), {from: user2})
            // user2 fills the order
            await exchange.fillOrder('1', {from: user2})
          })
    
          it('user1 tokens balance on exchange should eq. 10', async () => {
            await (await exchange.balanceOf(token.address, user1)).toString().should.eq(tokens(10).toString())
          })
    
          it('user1 ether balance on exchange should eq. 0', async () => {
            await (await exchange.balanceOf(ETHER_ADDRESS, user1)).toString().should.eq('0')
          })
    
          it('user2 tokens balance on exchange should eq. 0', async () => {
            await (await exchange.balanceOf(token.address, user2)).toString().should.eq('0')
          })
    
          it('user2 ether balance on exchange should eq. 1', async () => {
            await (await exchange.balanceOf(ETHER_ADDRESS, user2)).toString().should.eq(ether(1).toString())
          })
        })
    
        describe('Check balances after filling user1 buy Ether order', () => {
          beforeEach(async () => {
            // Uuser1 Gets the 10 tokens
            await token.transfer(user1, tokens(10), {from: deployer})
            // user1 approve exchange to spend his tokens
            await token.approve(exchange.address, tokens(10), {from: user1})
            // user1 approve send tokens to the exchange 
            await exchange.depositToken(token.address, tokens(10), {from: user1})
            // user1 create order to buy 1 Ether for 10 tokens
            await exchange.makeOrder(ETHER_ADDRESS, ether(1), token.address, tokens(10), {from: user1})
            // user2 deposit 1 ETHER + fee cost (.1 ETH) to the exchange
            await exchange.depositEther({from: user2, value: ether(1.1)})
            // user2 fills the order
            await exchange.fillOrder('1', {from: user2})
          })
    
          it('user1 tokens balance on exchange should eq. 0', async () => {
            await (await exchange.balanceOf(token.address, user1)).toString().should.eq('0')
          })
    
          it('user1 Ether balance on exchange should eq. 1', async () => {
            await (await exchange.balanceOf(ETHER_ADDRESS, user1)).toString().should.eq(ether(1).toString())
          })
    
          it('user2 tokens balance on exchange should eq. 10', async () => {
            await (await exchange.balanceOf(token.address, user2)).toString().should.eq(tokens(10).toString())
          })
    
          it('user2 ether balance on exchange should eq. 0', async () => {
            await (await exchange.balanceOf(ETHER_ADDRESS, user2)).toString().should.eq('0')
          })
        })
      })



    })




