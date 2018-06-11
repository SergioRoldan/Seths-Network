pragma solidity ^0.4.21;
import "./Multiownable.sol";
import "./CryptoHandler.sol";
import "./Expirable.sol";

contract Channel is Multiownable, CryptoHandler, Expirable {

    //emit the channel address is not necessary
    event channelCreated(address indexed nearEnd, address indexed farEnd,
    uint256 value, uint256 id, uint256 endDate);

    event channelClosed(address indexed NearEnd, uint256 nearEndFinalValue, address indexed FarEnd,
    uint256 farEndFinalValue, uint256 finalId);

    event closeRequest(address indexed end, bool closeChange);

    event stateUpdated(address indexed NearEnd, uint256 nearEndValue, address indexed FarEnd,
    uint256 farEndValue, uint256 currentId);

    event disputeAccepted(address indexed end, uint256 currentId);

    event rsShownAndUsed(bytes32[] randoms, bytes32[] hashes, bool[] correctRs);

    struct State {
        mapping(address=> uint256) values;
        uint256 id;
    }

    State public state;

    uint256 public channelValue;
    bool public closed; /**Destroy the contract instead and change the notClosed modifier*/

    mapping(address => bool) public requestedClose;
    mapping(address => bool) disputed;

    constructor (address _nearEnd, address _farEnd, uint256 _daysOpen)
        Multiownable([_nearEnd, _farEnd]) Expirable(_daysOpen) public payable {
        /**
            Initialize the state
        */
        state.id = 0;
        state.values[_nearEnd] = msg.value;
        state.values[_farEnd] = 0;
        /**
            Initialize channel value and set closed to false
        */
        channelValue = msg.value;
        /**
            Emit the event of channel created
        */
        emit channelCreated(_nearEnd, _farEnd, msg.value, state.id, channelEnd);
    }

    function updateState(address[2] _end_chann, uint256[2] _values_id, bytes32 _msgHash, uint8 _v, bytes32[2] _r_s, bytes32[] _rs, bytes32[] _hs, uint256[] _ttls, int256[] _rhValues)
        public onlyOwners hasNotExpired notClosed{

        /**
            Require signer == otherEnd
            Require channel == thisChannel
        */
        address checkEnd = getOtherOwner(msg.sender);
        require(_end_chann[0] == checkEnd && _end_chann[1] == address(this));
        /**
            Compute message hash
            Require previousHash = _msgHash
            Require valid signature
        */
        bytes32 msgHash = computeHash(_values_id, _end_chann, _rs, _hs, _ttls,  _rhValues);
        require(verifyBytes32(msgHash, _msgHash) && verifySignature(_end_chann[0], prefixSignHash(_msgHash), _v, _r_s[0], _r_s[1]));

        /**
            Require sent value inferior to channel's value
            Require new state with higher id than state, overwriting the old state
        */
        require(_values_id[0] <= channelValue && _values_id[1] > state.id);

        /**
            Update state (id, values)
        */
        state.id = _values_id[1];
        state.values[_end_chann[0]] = _values_id[0];
        state.values[msg.sender] = channelValue - _values_id[0];

        checkRshashesIn_hs(_rs, _hs, _ttls, _rhValues);

        emit stateUpdated(msg.sender, state.values[msg.sender], _end_chann[0], state.values[checkEnd], state.id);
    }

    function closeChannel(bool _close) public onlyOwners hasNotExpired notClosed{
        if(_close && requestedClose[getOtherOwner(msg.sender)]) {
            // 1. Conditions
            // Part of the modifiers

            // 2. Effects
            closed = true;
            emit channelClosed(owners[0], state.values[owners[0]], owners[1], state.values[owners[1]], state.id);

            // 3. Interaction
            owners[0].transfer(state.values[owners[0]]);
            owners[1].transfer(state.values[owners[1]]);
        } else {
            emit closeRequest(msg.sender, _close);
            requestedClose[msg.sender] = _close;
        }
    }

    function unlockFunds() public onlyOwners hasSettled notClosed{
        // 1. Conditions
        // Part of the modifiers

        // 2. Effects
        closed = true;
        emit channelClosed(owners[0], state.values[owners[0]], owners[1], state.values[owners[1]], state.id);

        // 3. Interaction
        owners[0].transfer(state.values[owners[0]]);
        owners[1].transfer(state.values[owners[1]]);
    }

    function disputeState(address[2] _end_chann, uint256[2] _values_id, bytes32 _msgHash, uint8 _v, bytes32[2] _r_s, bytes32[] _rs, bytes32[] _hs, uint256[] _ttls, int256[] _rhValues)
        public onlyOwners inSettlementPeriod notClosed{

        //Different from updateState
        require(disputed[msg.sender] == false);

        /**
            Require signer == otherEnd
            Require channel == thisChannel
        */
        address checkEnd = getOtherOwner(msg.sender);
        require(_end_chann[0] == checkEnd && _end_chann[1] == address(this));
        /**
            Compute message hash
            Require previousHash = _msgHash
            Require valid signature
        */
        bytes32 msgHash = computeHash(_values_id, _end_chann, _rs, _hs, _ttls,  _rhValues);
        require(verifyBytes32(msgHash, _msgHash) && verifySignature(_end_chann[0], prefixSignHash(_msgHash), _v, _r_s[0], _r_s[1]));

        /**
            Require sent value inferior to channel's value
            Require new state with higher id than state, overwriting the old state
        */
        require(_values_id[0] <= channelValue && _values_id[1] > state.id);

        /**
            Update state (id, values)
        */
        state.id = _values_id[1];
        state.values[_end_chann[0]] = _values_id[0];
        state.values[msg.sender] = channelValue - _values_id[0];

        checkRshashesIn_hs(_rs, _hs, _ttls, _rhValues);

        emit disputeAccepted(msg.sender, state.id);
        //Different from update state
        disputed[msg.sender] = true;
    }

    //Echarle un vistazo a los valores finales
    function checkRshashesIn_hs(bytes32[] _rs, bytes32[] _hs, uint256[] _ttls, int256[] _rhValues) internal {
        int256 values;
        bool[] memory RtoH;
        for(uint i = 0; i < _rs.length; i++) {
            if(verifyHash(_rs[i], _hs[i])) {

                if(uint(_rhValues[i]) <= channelValue && now >= _ttls[i]) {
                    values += _rhValues[i];
                    RtoH[i] = true;
                }

            }
        }

        address higherAddrs;
        if(values >= 0) {
            higherAddrs = owners[0];
        } else {
            values = values - 2*values;
            higherAddrs = owners[1];
        }

        if(values > 0) {
            require(uint(values) <= state.values[higherAddrs]);
            state.values[higherAddrs] -= uint(values);
            state.values[getOtherOwner(higherAddrs)] += uint(values);

            emit rsShownAndUsed(_rs, _hs, RtoH);
        }

    }

    modifier notClosed() {
        require(!closed);
        _;
    }

    /**Internal state getters*/
    function getStateId() public view returns (uint256) {
        return state.id;
    }
    function getStateValues() public view returns ( uint256[2]) {
        return ([state.values[owners[0]], state.values[owners[1]]]);
    }
    /***/
}
