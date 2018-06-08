pragma solidity ^0.4.23;

library CryptoHandler{

    //Prefix necessary to verify the signature of a message with a length of 32 bytes
    bytes public constant msgSignPrefix = "\x19Ethereum Signed Message:\n32";

    //Uses ecrecover to verify a signature
    function verifySignature(address _addr, bytes32 _msgHash, uint8 _v, bytes32[2] _r_s) internal pure returns (bool) {
        return ecrecover(_msgHash, _v, _r_s[0], _r_s[1]) == _addr;
    }

    //Uses keccak256 to verify a hash 
    function verifyHash(bytes32 _msg, bytes32 _msgHash) internal pure returns (bool) {
        return keccak256(_msg) == _msgHash;
    }

    //Hash a message using the prefix required to verify a signature
    function prefixSignHash(bytes32 _msgHash) internal pure returns (bytes32) {
        return keccak256(msgSignPrefix, _msgHash);
    }

}