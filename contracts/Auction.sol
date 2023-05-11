pragma solidity ^0.4.17;

contract Auction {
    
    // Data
    
    // Structure to hold details of Bidder
    struct IBidder {
        uint8 token;
        uint8 deposit;
    }
    
    // Structure to hold details of Rule
    struct IRule {
        uint8 startingPrice;
        uint8 minimumStep;
    }
    
    
    // State Enum to define Auction's state
    enum State { CREATED, STARTED, CLOSING, CLOSED }
    
    State public state = State.CREATED; // State of Auction
    
    uint8 public announcementTimes = 0; // Number of announcements
    uint8 public currentPrice = 0; // Latest price is bid.
    IRule public rule; // Rule of this session
    address public currentWinner; // Current Winner, who bid the highest price.
    address public auctioneer;
    
    uint16 private totalDeposit = 0;
    
    mapping(address => IBidder) public bidders; // Mapping to hold bidders' information
    
    function Auction(uint8 _startingPrice, uint8 _minimumStep) public {
        
        // Task #1 - Initialize the Smart contract
        // + Initialize Auctioneer with address of smart contract's owner
        // + Set the starting price & minimumStep
        // + Set the current price as the Starting price
        
        
        // ** Start code here. 4 lines approximately. ** /
        auctioneer = msg.sender; 
        rule.startingPrice = _startingPrice;
        rule.minimumStep = _minimumStep;
        currentPrice = rule.startingPrice;
        // ** End code here. ** /
    }
    
    
    // Register new Bidder
    function register(address _account, uint8 _token) public inState(State.CREATED) onlyAuctioneer() { 
        
                
        // Task #2 - Register the bidder
        // + Initialize a Bidder with address and token are given.
        // + Initialize a Bidder's deposit with 0
        
        
        // ** Start code here. 3 lines approximately. ** /
        IBidder storage newBidder = bidders[_account];
        newBidder.token = _token;
        newBidder.deposit = 0;     
	    // ** End code here. **/
    }

    
    // Start the session.
    function startSession() public inState(State.CREATED) onlyAuctioneer() {
        state = State.STARTED;
    }
    

    
    function bid(uint8 _price) public inState(State.STARTED) {
        
        // Task #3 - Bid by Bidders
        // + Check the price with currentPirce and minimumStep. Revert if invalid.
        // + Check if the Bidder has enough token to bid. Revert if invalid.
        // + Move token to Deposit.
        
        address bidderAddr = msg.sender;
        IBidder storage currentBidder = bidders[bidderAddr];
        
        // ** Start code here.  ** /
        require(_price >= (currentPrice + rule.minimumStep));
        require(currentBidder.token >= _price);
        uint8 oldDeposit = currentBidder.deposit;
        currentBidder.token = currentBidder.token - (_price - oldDeposit); //token(new) = token(old) - (new price - old price which is deposit by bidder)
        currentBidder.deposit = _price;
        // Tracking deposit
		totalDeposit += (currentBidder.deposit - oldDeposit); 
        
        
        // ** End code here. **/
        

        
        // Update the price and the winner after this bid.
        currentPrice = _price;
        currentWinner = bidderAddr;
        
        // Reset the Annoucements Counter
        announcementTimes = 0;
    }
    
    function announce() public inState(State.STARTED) onlyAuctioneer() {
        
        // Task #4 - Handle announcement.
        // + When Auctioneer annouce, increase the counter.
        // + When Auctioneer annouced more than 3 times, switch session to Closing state.
        
        // ** Start code here.  ** /
       announcementTimes++;
       if (announcementTimes > 3) {
           state = State.CLOSING;
       }
	   
        // ** End code here. **/
    }
    
    function getDeposit() public inState(State.CLOSING) {
        
        // Task #5 - Handle get Deposit.
        // + Allow bidders (except Winner) to withdraw their deposit 
		// + When all bidders' deposit are withdrew, close the session 
        
        // ** Start code here.  ** /
        // HINT: Remember to decrease totalDeposit.
        address bidderAddr = msg.sender;
        IBidder storage currentBidder = bidders[bidderAddr];
        require(currentWinner != bidderAddr);
        
        currentBidder.token += currentBidder.deposit;
        totalDeposit -= currentBidder.deposit;
        currentBidder.deposit = 0;
        if (totalDeposit == currentPrice) {
           totalDeposit = 0;
        }
        // ** End code here ** /
       
       if (totalDeposit <= 0) {
           state = State.CLOSED;
       }
    }

    modifier inState(State expectedState) {
        require(state == expectedState);
        _;
    }

    modifier onlyAuctioneer() {
        require(auctioneer == msg.sender);
        _;
    }
}




// PART 2 - Using Modifier to:
// - Check if the action (startSession, register, bid, annoucement, getDeposit) can be done in current State.
// - Check if the current user can do the action.

