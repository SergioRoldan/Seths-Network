//Compiler version
pragma solidity ^0.4.23;

//Import cryptohandler library
import { CryptoHandler } from "./libraries/CryptoHandler.sol";

//Internal contract expirable to define the live cycle of a channel
contract Expirable {
    
    uint256 public channelEnd;
    
    constructor (uint256 _daysToExpire) internal {
        channelEnd = now + (_daysToExpire * 1 days);
    }
    
    //Modifiers for the live cycle of a channel
    modifier hasNotExpired() {
        require(now <= channelEnd);
        _;
    }
    modifier hasNotSettle() {
        require(now <= (channelEnd + 1 days));
        _;
    }
    modifier inSettlementPeriod() {
        require(now > channelEnd && now <= (channelEnd + 1 days));
        _;
    }
    modifier hasSettled() {
        require(now > (channelEnd + 1 days));
        _;
    }

}

//Internal contract multiownable to define the two owners of a channel
contract Multiownable {
    
    address[2] public owners;
    
    constructor (address[2] _owners) internal {
        
        owners = _owners;
    }
    
    //Get the other owner of the channel for verifying operations
    function getOtherOwner(address _owner)  internal view returns (address){
        if(_owner == owners[0]) 
            return owners[1];
        else if (_owner == owners[1]) 
            return owners[0]; 
        return 0x0;
    }
    
    //Modifiers for the owners of the channel
    modifier onlyOwners(){
        require(msg.sender == owners[0] || msg.sender == owners[1]);
        _;
    }
    modifier onlyFarEnd(){
        require(msg.sender == owners[1]);
        _;
    }
    
}

//Internal contract modifiers to define modifiers and events of the channel related with closed,accepted and disputed situations
contract Modifiers {

    // Channel accepted, close request and close events
    event channelAccepted(uint256 farEndValue, uint256 totalValue);
    event closeRequest(address indexed end, bool closeChange);
    event channelClosed(address indexed NearEnd, uint256 nearEndFinalValue, address indexed FarEnd,
    uint256 farEndFinalValue, uint256 finalId);

    bool public closed;
    bool public accepted;

    mapping(address => bool) public disputed;
    
    //Modifiers related with closed, accepted and disputed situations
    modifier notClosed() {
        require(!closed);
        _;
    }
    modifier isAccepted() {
        require(accepted);
        _;
    }
    modifier notAccepted(){
        require(!accepted);
        _;
    }
    modifier notDisputed(){
        require(disputed[msg.sender] == false);
        _;
    }
    
}

//Channel contract inheriting from the previous internal contracts
contract ChannelFinal is Multiownable, Expirable, Modifiers {

    //Channels events for state update, random shown and dispute accepted situations
    event stateUpdated(address indexed sender, uint256 senderValue, address indexed uploader,
    uint256 uploaderValue, uint256 currentId);
    event disputeAccepted(address indexed end, uint256 currentId);
    event rsShownAndUsed(bytes32[] randomS, bytes32[] random);

    //Limit number of hash locked transactions on an update or a dispute
    uint16 constant public limit = 251;
 
    struct State {
        mapping(address=> uint256) values;
        uint256 id;
    }

    State state;

    uint256 public channelValue;

    mapping(address => bool) public requestedClose;

    //Functions relate with token transfers follow the conditions -> effects -> interaction 
    //in order to avoid security leaks and double-spend problems

    //Create a channel selfexplanatory
    constructor (address _nearEnd, address _farEnd, uint256 _daysOpen)
        Multiownable([_nearEnd, _farEnd]) Expirable(_daysOpen) public payable {

        state.values[_nearEnd] = msg.value;
        channelValue = msg.value;
    }

    //Accept channel, selfexplanatory
    function acceptChannel() public payable onlyFarEnd notAccepted hasNotExpired {

        accepted = true;

        state.values[msg.sender] = msg.value;
        channelValue += msg.value;

        emit channelAccepted(msg.value, channelValue);

    }

    //Update state of the channel calls handle state and emits and event
    function updateState(
        address[2] _end_chann, uint256[2] _values_id, uint8 _v, bytes32[2] _r_s, 
        bytes32[] _rsSigned, bytes32[] _rs, bytes32[] _hs, uint256[] _ttls, uint256[] _rhValues,  uint8[] _end
        ) public onlyOwners isAccepted notClosed hasNotExpired {

        handleState(_end_chann, _values_id, _v, _r_s, _rsSigned, _rs, _hs, _ttls, _rhValues, _end);

        emit stateUpdated(msg.sender, state.values[msg.sender], _end_chann[0], state.values[getOtherOwner(msg.sender)], state.id);
    }

    //Dispute state of the channel, practically equal to update state but set disputed to true (just in settlement period)
    function disputeState(
        address[2] _end_chann, uint256[2] _values_id, uint8 _v, bytes32[2] _r_s, 
        bytes32[] _rsSigned, bytes32[] _rs, bytes32[] _hs, uint256[] _ttls, uint256[] _rhValues,  uint8[] _end
        ) public onlyOwners isAccepted notClosed inSettlementPeriod notDisputed {

        handleState(_end_chann, _values_id, _v, _r_s, _rsSigned, _rs, _hs, _ttls, _rhValues, _end);

        disputed[msg.sender] = true;
        
        emit disputeAccepted(msg.sender, state.id);

    }

    //Handle an state update, requires a well-build update including hash and signature, consistency in the parameters
    //Updates the parameters and calls checkRHashesInH
    function handleState(
        address[2] _end_chann, uint256[2] _values_id, uint8 _v, bytes32[2] _r_s, 
        bytes32[] _rsSigned, bytes32[] _rs, bytes32[] _hs, uint256[] _ttls, uint256[] _rhValues,  uint8[] _end
        ) internal {

        require(
            _end_chann[0] == getOtherOwner(msg.sender) &&
            _end_chann[1] == address(this) &&
            _values_id[0] <= channelValue && 
            _values_id[1] > state.id &&
            uint8(_hs.length) < limit
        );

        bytes32 msgHash;

        if(_rsSigned.length > 0)
          msgHash = keccak256(_values_id, _end_chann, _rsSigned, _hs, _ttls,  _rhValues, _end);
        else if(_hs.length > 0)
          msgHash = keccak256(_values_id, _end_chann, _hs, _ttls,  _rhValues, _end);
        else
          msgHash = keccak256(_values_id, _end_chann);

        require(CryptoHandler.verifySignature(_end_chann[0], CryptoHandler.prefixSignHash(msgHash), _v, _r_s));

        state.id = _values_id[1];
        state.values[_end_chann[0]] = _values_id[0];
        state.values[msg.sender] = channelValue - _values_id[0];

        if(_hs.length > 0) 
            checkRsHashesInHs(_rsSigned, _rs, _hs, _ttls, _rhValues, _end);

    }

    //Check for each R in a hash locked transaction if the time to live is still valid and if it hashed in H
    //Updates the state and emits the R shown
    function checkRsHashesInHs(
        bytes32[] _rsSigned, bytes32[] _rs, bytes32[] _hs, uint256[] _ttls, 
        uint256[] _rhValues,  uint8[] _end
        ) internal {
        
        uint256 near;
        uint256 far;
        uint8 i = 0;

        for(i; i < _rsSigned.length; i++) {
            if(_rsSigned[i] != 0x0 && now <= _ttls[i] && CryptoHandler.verifyHash(_rsSigned[i], _hs[i])) {
                if(_end[i] == 0)
                    near += _rhValues[i];
                else
                    far += _rhValues[i];
            }
        }

        for(uint8 j = i; j < (i + _rs.length); j++) {
            if(_rs[j-i] != 0x0 && now <= _ttls[j] && CryptoHandler.verifyHash(_rs[j-i], _hs[j])) {
                if(_end[j] == 0)
                    near += _rhValues[j];
                else
                    far += _rhValues[j];
            }
        }

        uint values;
        address higherAddrs;

        if(near >= far) {
            values = near - far;
            higherAddrs = owners[0];
        } else {
            values = far - near;
            higherAddrs = owners[1];
        }

        if(values > 0) {

            require(uint(values) <= state.values[higherAddrs]);

            state.values[higherAddrs] -= uint(values);
            state.values[getOtherOwner(higherAddrs)] += uint(values);

            emit rsShownAndUsed(_rsSigned, _rs);

        }

    }

    //Request a close of the channel, if both parties agree in the closing then the channel closes and unlocks the funds
    function closeChannel(bool _close) public onlyOwners isAccepted notClosed hasNotSettle {
        
        if(_close && requestedClose[getOtherOwner(msg.sender)]) {

            closed = true;
            emit channelClosed(owners[0], state.values[owners[0]], owners[1], state.values[owners[1]], state.id);

            if (state.values[owners[0]] > 0) {
                owners[0].transfer(state.values[owners[0]]);
                state.values[owners[0]] = 0;
            }
            if (state.values[owners[1]] > 0) {
                owners[1].transfer(state.values[owners[1]]);
                state.values[owners[1]] = 0;
            }

        } else {

            requestedClose[msg.sender] = _close;

            emit closeRequest(msg.sender, _close);

        }
    }

    //Unlocks the funds once the channel is settled
    function unlockFunds() public onlyOwners notClosed hasSettled {

        closed = true;
        emit channelClosed(owners[0], state.values[owners[0]], owners[1], state.values[owners[1]], state.id);

        if (state.values[owners[0]] > 0) {
            owners[0].transfer(state.values[owners[0]]);
            state.values[owners[0]] = 0;
        }
        if (state.values[owners[1]] > 0) {
            owners[1].transfer(state.values[owners[1]]);
            state.values[owners[1]] = 0;
        }
            
    }

    //Public functions to retrieve each owner value and the state id
    function getStateNear() public view returns (uint256 val) {
        return state.values[owners[0]];
    }
    function getStateFar() public view returns (uint256 val) {
        return state.values[owners[1]];
    }
    function getStateId() public view returns (uint256 val) {
        return state.id;
    }
    
}

//Factory of channels, smart contract deployed in a known address and main component of the Seths Network on the Blockchain
contract Factory{
    
    //Factory event for a new channel
    event channelProcessed(address indexed ContractAddrs, address indexed NearEnd, address indexed FarEnd,
    uint256 channelVal, uint256 endDate);
    
    //Public payable function to create a channel with a _farEnd to remain open for _daysOpen
    function createChannel(address _farEnd, uint _daysOpen) public payable {
        ChannelFinal channel = (new ChannelFinal).value(msg.value)(msg.sender, _farEnd, _daysOpen);
        emit channelProcessed(channel, msg.sender, _farEnd, channel.channelValue(), channel.channelEnd());
    }
    
}