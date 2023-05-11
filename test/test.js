let Auction = artifacts.require('./Auction.sol');
let auctionInstance;

contract('AuctionContract', function(accounts) {
    //accounts[0] is the default account
    let auOwner = accounts[0];
    let bidder1 = accounts[1];
    let bidder2 = accounts[2];
    let bidder3 = accounts[3];

    describe('Contract deployment', function() {
        it('Contract deployment', function() {
            //Fetching the contract instance of our smart contract
            return Auction.deployed().then(function(instance) {
                //We save the instance in a global variable and all smart contract functions are called using this
                auctionInstance = instance;
                assert(
                    auctionInstance !== undefined, 
                    'Auction contract should be defined'
                );
            });
        });
        
        it('Initial rule with corrected startingPrice and minimumStep', function() {
            //Fetching the rule of Auction
            return auctionInstance.rule().then(function(rule) {
                //We save the instance in a global variable and all smart contract functions are called using this
                assert(rule !== undefined, 'Rule should be defined');
    
                assert.equal(rule.startingPrice, 50, 'Starting price should be 50');
                assert.equal(rule.minimumStep, 5, 'Minimum step should be 5');
            });
        });
    });

    describe('1. Register', function() {
        it ('1a. Only Auctioneer can register bidders.', function() {
            return auctionInstance.register(bidder1, 255, {from: bidder1}).then(function() {
                throw ("Only Auctioneer can register bidders");
            }).catch (function(err) {
                if (err === "Only Auctioneer can register bidders") {
                    assert(false); //expect this
                } else {
                    assert(true);
                }
            }).then(function() {
                return auctionInstance.register(bidder1, 255, {from: bidder2}).then(function() {
                    throw ("Only Auctioneer can register bidders");
                }).catch (function(err) {
                    if (err === "Only Auctioneer can register bidders") {
                        assert(false); //expect this
                    } else {
                        assert(true);
                    }
                }).then(function() {
                    return auctionInstance.register(bidder1, 255, {from: auOwner}).then(function() {
                        return auctionInstance.bidders(bidder1).then(function(bidderInfo){
                            assert.equal(bidderInfo[0].toNumber(), 255, "Token registered amount is not correct"); //No of token which is registered
                            return auctionInstance.auctioneer();    
                        }).then(function(result) {
                            assert.equal(result, auOwner, "Register unsuccessfully");
                        });
                    })
                })
            });
        });

        it ('1b. This action is only available in Created State', function() {
            return auctionInstance.state().then(function(currentState) {
                assert.equal(currentState.toString(), Auction.State.CREATED.toString(),  "Current state shoulbe be Created");
            }).then(function(){
                return auctionInstance.register(bidder2, 255, {from: accounts[0]}).then(function() {
                    return auctionInstance.state();
                }).then(function(currentState) {
                    assert.equal(currentState.toString(), Auction.State.CREATED.toString(),  "Current state shoulbe be Created also");
                });
            });
        });

        it ('1c. When register, the account address and the number of tokens need to be inputted', function() {
            return auctionInstance.register(bidder3, "", {from: auOwner}).then(function() {
                throw ("Missing number of token amount");
            }).catch(function(err) {
                if (err === "Missing number of token amount") {
                    assert(false);
                } else {
                    assert(true);
                }
            }).then(function() {
                return auctionInstance.register("", 255, {from: accounts}).then(function() {
                    throw ("Missing bidder address");
                }).catch(function(err) {
                    if (err === "Missing bidder address") {
                        assert(false);
                    } else {
                        assert(true);
                    }    
                })
            }).then(function() {
                return auctionInstance.register(bidder3, 255, {from: accounts[0]}).then(function() {
                    throw ("Auction contract register successfully");
                }).catch(function(mess) {
                    if (mess === "Auction contract register successfully") {
                        assert(true);
                    } else {
                        assert(false);
                    }
                });
            })
        });
    });

    describe('2. Start the session', function() {
        it ('2a. Only Auctioneer can start the session', function() {
            return Auction.new(50, 5).then(function(newInstance) {
                return newInstance.startSession({from: accounts[6]}).then(function() {
                    throw ("Only Auctioneer can start the session");
                }).catch (function(err) {
                    if (err === "Only Auctioneer can start the session") {
                        assert(false); //expect this
                    } else {
                        assert(true);
                    }
                }).then(function() {
                    return newInstance.register(accounts[6], 255, {from: auOwner}).then(function() {
                        return newInstance.startSession({from: accounts[6]}).then(function() {
                            throw ("Only Auctioneer can start the session");
                        }).catch (function(err) {
                            if (err === "Only Auctioneer can start the session") {
                                assert(false); //expect this
                            } else {
                                assert(true);
                            }
                        })
                    })
                }).then(function() {
                    return newInstance.startSession({from: auOwner}).then(function() {
                        throw ("Start the session successfully");
                    }).catch (function(err) {
                        if (err === "Start the session successfully") {
                            assert(true); //expect this
                        } else {
                            assert(false);
                        }
                    })
                })
            })
        });

        it ('2b. This action is only available in Created State', function() {
            return auctionInstance.state().then(function(currentState) {
                assert.equal(currentState.toString(), Auction.State.CREATED.toString(), "Should be Created State"); 
            }).then (function() {
                return auctionInstance.startSession({from: auOwner}).then(function() {
                    return auctionInstance.auctioneer();
                }).then(function(result) {
                    assert.equal(result, auOwner, "Only Auctioneer can start the session");
                    return auctionInstance.state();
                }).then (function(currentState) {
                    assert.equal(currentState.toString(), Auction.State.STARTED.toString(), "Should be Started State");
                });
            });
        });
    });

    describe('3. Bid', function() {
        it ('3a. All the Bidders can bid', function() {
            // Bidder now are bidder1, bidder2, bidder3
            return auctionInstance.bid(55, {from: accounts[4]}).then(function(){
                throw ("Not register yet");
            }).catch (function(err) {
                if (err === "Not register yet") {
                    assert(false);
                } else {
                    assert(true);
                }
            }).then(function() {
                return auctionInstance.bid(55, {from: bidder1}).then(function() {
                    return auctionInstance.bid(60, {from: bidder2}).then(function() {
                        return auctionInstance.bid(65, {from: bidder3}).then(function() {
                            throw ("All bidder bid successfully");
                        }).catch(function(mess) {
                            if (mess === "All bidder bid successfully") {
                                assert(true);
                            } else {
                                assert(false);
                            }
                        });
                    });
                });
            });
        });

        it ('3b. This action is only available in Started State', function() {
            return Auction.new(50, 5).then(function(newInstance) {
                return newInstance.register(accounts[7], 255, {from: auOwner}).then(function() {
                    return newInstance.state().then(function(currentState) {
                        assert.equal(currentState.toString(), Auction.State.CREATED.toString(), "Should be Created State"); 
                    }).then(function() {
                        return newInstance.bid(100, {from: accounts[7]}).then(function() {
                            throw ("Wrong state, this is Created state");
                        }).catch (function(err) {
                            if (err === "Wrong state, this is Created state") {
                                assert(false); //expect this
                            } else {
                                assert(true);
                            }
                        }).then(function() {
                            return newInstance.startSession({from: auOwner}).then(function() {
                                return newInstance.state().then(function(currentState) {
                                    assert.equal(currentState.toString(), Auction.State.STARTED.toString(), "Should be Started State"); 
                                }).then(function() {
                                    return newInstance.bidders(accounts[7]).then(function(info) { //access mapping info
                                        assert.equal(info[0].toNumber(), 255); //token amount
                                    }).then(function() {
                                        return newInstance.bid(100, {from: accounts[7]}).then(function() {
                                            return newInstance.bidders(accounts[7]).then(function(info) {
                                                assert.equal(info[0], 155); //token amount
                                                assert.equal(info[1], 100); //deposit amount
                                                return newInstance.currentWinner().then(function(winner) {
                                                    assert.equal(winner, accounts[7]); //latest bidder is the winner
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    }) 
                })
            })
        });

        it ('3c. The next price must be inputted', function() {
            return auctionInstance.bid(70, {from: bidder1}).then(function() {
                return auctionInstance.bid(75, {from: bidder2}).then(function() {
                    return auctionInstance.bid(80, {from: bidder3}).then(function() {
                        throw ("All bidder bid successfully");
                    }).catch(function(mess) {
                        if (mess === "All bidder bid successfully") {
                            assert(true);
                        } else {
                            assert(false);
                        }
                    });
                });
            });
        });

        it ('3d. The next price must higher than the latest price plus the minimum step (set in rule)', function() {
            return auctionInstance.bid(82, {from: bidder1}).then(function() {
                throw ("Violate the rule")
            }).catch(function(err) {
                if (err === "Violate the rule") {
                    assert(false);
                } else {
                    assert(true);
                }
            }). then(function() {
                return auctionInstance.bid(100, {from: bidder1}).then(function() { //winner
                    throw ("Bidder bid successfully");
                }).catch(function(mess) {
                    if (mess === "Bidder bid successfully") {
                        assert(true);
                    } else {
                        assert(false);
                    }
                });
            });
        });
    });

    describe('4. Announcement', function() {
        it ('4a. Only the Auctioneer can Announce', function() {
            return auctionInstance.announce({from: bidder1}).then(function() {
                throw ("Only Auctioneer can Announce");
            }).catch (function(err) {
                if (err === "Only Auctioneer can Announce") {
                    assert(false); //expect this
                } else {
                    assert(true);
                }
            }).then(function() {
                return auctionInstance.announce({from: accounts[0]}).then(function() {
                    return auctionInstance.announcementTimes().then(function(noOfCount) {
                        assert.equal(1, noOfCount.toString(), "Should Announce the 1st time successfully");
                    });
                });
            });
        });

        it ('4b. This action is only available in Started State', function() {
            return auctionInstance.state().then(function(currentState) {
                assert.equal(currentState.toString(), Auction.State.STARTED.toString(), "Should be Started State"); 
            });
        });

        it ('4c. After 3 times (4th call of this action), the session will end', function() {
            return auctionInstance.announce({from: accounts[0]}).then(function() { //2nd
                return auctionInstance.announce({from: accounts[0]}).then(function() { //3rd
                    return auctionInstance.state().then(function(currentState) {
                        assert.equal(currentState.toString(), Auction.State.STARTED.toString(), "Should be Started State"); 
                    }).then(function() {
                        return auctionInstance.announce({from: accounts[0]}).then(function() { //4th
                            return auctionInstance.announcementTimes().then(function(noOfCount) {
                                assert.equal(4, noOfCount.toString(), "Should Announce the 3rd time successfully");

                                return auctionInstance.state().then(function(currentState) {
                                    assert.equal(currentState.toString(), Auction.State.CLOSING.toString(), "Should be Closing State"); 
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    describe('5. Get back the deposit', function() {
        it ('5a. All the Bidders (except the Winner) can Get back the deposit', function() {
            let winnerAddr;
            return auctionInstance.currentWinner().then(function(winnerAddr) {
                return auctionInstance.state().then(function(currentState) {
                    assert.equal(currentState.toString(), Auction.State.CLOSING.toString(), "Should be Closing State"); 
                }).then(function(winnerAddr) {
                    return auctionInstance.getDeposit({from: winnerAddr}).then(function() {
                        throw ("Winner cannot withdraw");
                    }).catch(function(err) {
                        if (err === "Winner cannot withdraw") {
                            assert(false); //expect this
                        } else {
                            assert(true);
                        }
                    }).then(function() {
                        return auctionInstance.getDeposit({from: bidder2}).then(function() {
                            throw ("Bidder get back deposit successfully");
                        }).catch(function(mess) {
                            if (mess === "Bidder get back deposit successfully") {
                                assert(true);
                            } else {
                                assert(false);
                            }
                        });
                    });
                });
            });
        });

        it ('5b. This action is only available in Closing State', function() {
            return auctionInstance.state().then(function(currentState) {
                assert.equal(currentState.toString(), Auction.State.CLOSING.toString(), "Should be Closing State");

                return auctionInstance.getDeposit({from: bidder3}).then(function() {
                    return auctionInstance.state().then(function(lastState) {
                        assert.equal(lastState.toString(), Auction.State.CLOSED.toString(), "Should be CLOSED State");
                    });
                    /*
                    return auctionInstance.totalDeposit().then(function(remain) { // change totalDeposit to public and test
                        assert.equal(0, remain.toString(), "Total deposit now should be 0");
                        return auctionInstance.state().then(function(lastState) {
                            assert.equal(lastState.toString(), Auction.State.CLOSED.toString(), "Should be CLOSED State");
                        });
                    });
                    */
                });
            });
        });
    });
});