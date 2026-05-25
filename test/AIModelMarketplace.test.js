const AImodelMarketplace = artifacts.require("AImodelMarketplace");

contract("AImodelMarketplace", (accounts) => {
    let marketplace;
    const [owner, buyer, anotherBuyer] = accounts;

    beforeEach(async () => {
        marketplace = await AImodelMarketplace.new();
    });

    describe("Listing Models", () => {
        it("should list a new model", async () => {
            await marketplace.listModel("Model1", "Description1", web3.utils.toWei("1", "ether"), { from: owner, value: web3.utils.toWei("1", "ether") });
            
            const model = await marketplace.models(0);
            assert.equal(model.name, "Model1");
            assert.equal(model.description, "Description1");
            assert.equal(model.price.toString(), web3.utils.toWei("1", "ether"));
            assert.equal(model.creator, owner);
            assert.equal(model.ratingCount.toString(), "0");
            assert.equal(model.totalRating.toString(), "0");
        });
    });

    describe("Purchasing Models", () => {
        it("should allow a user to purchase a model", async () => {
            await marketplace.listModel("Model1", "Description1", web3.utils.toWei("1", "ether"), { from: owner });
    
            await marketplace.purchaseModel(0, { from: buyer, value: web3.utils.toWei("1", "ether") });
    
            const modelDetails = await marketplace.getModelDetails(0);
            const buyers = modelDetails[5]; // buyers is the 6th return value (index 5)
    
            assert.equal(buyers.length, 1, "There should be one buyer."); // Check if there is one buyer
            assert.equal(buyers[0], buyer, "The buyer should be the correct one."); // Check that the buyer is the correct one
        });

        it("should not allow a user to purchase their own model", async () => {
            await marketplace.listModel("Model1", "Description1", web3.utils.toWei("1", "ether"), { from: owner });
            try {
                await marketplace.purchaseModel(0, { from: owner, value: web3.utils.toWei("1", "ether") });
                assert.fail("Expected an error but did not get one");
            } catch (error) {
                assert(error.message.includes("Cannot purchase your own model"));
            }
        });
    });

    describe("Rating Models", () => {
        it("should allow a user to rate a model", async () => {
            await marketplace.listModel("Model1", "Description1", web3.utils.toWei("1", "ether"), { from: owner });
            await marketplace.purchaseModel(0, { from: buyer, value: web3.utils.toWei("1", "ether") });
            
            await marketplace.rateModel(0, 5, { from: buyer });
            
            const model = await marketplace.models(0);
            assert.equal(model.ratingCount.toString(), "1");
            assert.equal(model.totalRating.toString(), "5");
        });

        it("should not allow a creator to rate their own model", async () => {
            await marketplace.listModel("Model1", "Description1", web3.utils.toWei("1", "ether"), { from: owner });
            
            try {
                await marketplace.rateModel(0, 5, { from: owner });
                assert.fail("Expected an error but did not get one");
            } catch (error) {
                assert(error.message.includes("Model creator cannot rate their own model"));
            }
        });
    });

    describe("Withdrawing Funds", () => {
        it("should allow the owner to withdraw funds", async () => {
            await marketplace.listModel("Model1", "Description1", web3.utils.toWei("1", "ether"), { from: owner });
            await marketplace.purchaseModel(0, { from: buyer, value: web3.utils.toWei("1", "ether") });
            const initialOwnerBalance = await web3.eth.getBalance(owner);
            const tx = await marketplace.withdrawFunds({ from: owner });
            const gasUsed = tx.receipt.gasUsed;
            const txDetails = await web3.eth.getTransaction(tx.tx);
            const gasPrice = txDetails.gasPrice;
            const gasCost = gasUsed * gasPrice;
            const finalOwnerBalance = await web3.eth.getBalance(owner);
            const expectedFinalBalance = BigInt(initialOwnerBalance) + BigInt(web3.utils.toWei("1", "ether")) - BigInt(gasCost);
            assert.equal(finalOwnerBalance, expectedFinalBalance.toString());
        });
        
        

        it("should not allow non-owners to withdraw funds", async () => {
            await marketplace.listModel("Model1", "Description1", web3.utils.toWei("1", "ether"), { from: owner });
            await marketplace.purchaseModel(0, { from: buyer, value: web3.utils.toWei("1", "ether") });

            try {
                await marketplace.withdrawFunds({ from: anotherBuyer });
                assert.fail("Expected an error but did not get one");
            } catch (error) {
                assert(error.message.includes("Only the owner can withdraw funds"));
            }
        });
    });
});
