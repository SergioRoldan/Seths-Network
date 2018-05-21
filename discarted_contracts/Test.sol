pragma solidity ^0.4.23;
import "./CryptoHandler.sol";

contract Test is CryptoHandler {
    
    event addNeg(int neg);
    event comHash(bytes32 hash, bytes32 expected, bool compare);
    event kec(bytes32 keck);
    event double(bytes32 first);
    event signat(address obtain, address expected, bool compare);
    event rsShownAndUsed(bytes32[] randomsUnsigned, bytes32[] randoms, bytes32[] hashes, bool[] correctRs);
    event stateUpdated(uint256 close, uint256 far, uint256 id);
    event err(bytes32[] _rs, bytes32[] _hs, uint256[] _ttls, int256[] _rhValues);

    uint256 constant channelValue = 1000000;
    
    address[2] owners = [0x627306090abaB3A6e1400e9345bC60c78a8BEf57, 0xf17f52151EbEF6C7334FAD080c5704D77216b732];

    struct State {
        mapping(address=> uint256) values;
        uint256 id;
    }

    State state;
    
    function testing1(uint256[2] _values_id, address[2] _end_chann, bytes32 _msgHash, bytes32[] _hs, uint256[] _ttls, int256[] _rhValues) public {
        bytes32 msgHash = computeHash(_values_id, _end_chann, _hs, _ttls, _rhValues);
        emit comHash(msgHash, _msgHash, (msgHash == _msgHash));
    }

    function testing2(uint256[2] _values_id, address[2] _end_chann, bytes32 _msgHash, bytes32[] _rs, bytes32[] _hs, uint256[] _ttls, int256[] _rhValues, uint8 _v, bytes32[2] _r_s) public {
        bytes32 msgHash = keccak256(_values_id, _end_chann, _rs, _hs, _ttls, _rhValues);
        emit comHash(msgHash, _msgHash, (msgHash == _msgHash));
        bytes32 hashPref = prefixSignHash(msgHash);
        address sign = ecrecover(hashPref,_v,_r_s[0],_r_s[1]);
        emit signat(sign, _end_chann[0], sign == _end_chann[0]);
        state.id = _values_id[1];
    }

    function testing2a(uint256[2] _values_id, address[2] _end_chann, bytes32 _msgHash, bytes32[] _rs, bytes32[] rsNotSigned, bytes32[] _hs, uint256[] _ttls, int256[] _rhValues, uint8 _v, bytes32[2] _r_s) public {
        state.values[owners[0]] = 500000;
        state.values[owners[1]] = 500000;
       
        bytes32 msgHash = keccak256(_values_id, _end_chann, _rs, _hs, _ttls, _rhValues);
        emit comHash(msgHash, _msgHash, (msgHash == _msgHash));
        bytes32 hashPref = prefixSignHash(msgHash);
        address sign = ecrecover(hashPref,_v,_r_s[0],_r_s[1]);
        emit signat(sign, _end_chann[0], sign == _end_chann[0]);
        state.id = _values_id[1];
        checkRshashesInHs(rsNotSigned, _rs, _hs, _ttls, _rhValues);
    }

    function checkRshashesInHs(bytes32[] rsNotSigned, bytes32[] _rs, bytes32[] _hs, uint256[] _ttls, int256[] _rhValues) internal {
        
        int256 values;
        bool[] memory RtoH = new bool[](_hs.length);
        uint8 i = 0;

        for(i; i < _rs.length; i++) {
            if(_rs[i] != 0x0 && verifyHash(_rs[i], _hs[i])) {
                if(uint(_rhValues[i]) <= channelValue && now <= _ttls[i]) {
                    values += _rhValues[i];
                    RtoH[i] = true;
                }
            }
        }

        for(uint8 j = i; j < (i + rsNotSigned.length); j++) {
            if(rsNotSigned[j-i] != 0x0 && verifyHash(rsNotSigned[j-i], _hs[j])) {
                if(uint(_rhValues[j]) <= channelValue && now <= _ttls[j]) {
                    values += _rhValues[j];
                    RtoH[j] = true;
                }
            }
        }

        address higherAddrs;
        address lowerAddrs;
        if(values >= 0) {
            higherAddrs = owners[0];
            lowerAddrs = owners[1];
        } else {
            values = values - 2*values;
            higherAddrs = owners[1];
            lowerAddrs = owners[0];
        }

        if(values > 0) {
            require(uint(values) <= state.values[higherAddrs]);
            state.values[higherAddrs] -= uint(values);
            state.values[lowerAddrs] += uint(values);

            emit rsShownAndUsed(rsNotSigned, _rs, _hs, RtoH);
            emit stateUpdated(state.values[higherAddrs], state.values[lowerAddrs], state.id);
        }
        
        emit err(_rs,_hs,_ttls,_rhValues);

    }

}