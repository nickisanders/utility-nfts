// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

contract ContractProxy is TransparentUpgradeableProxy {
    constructor(
        address _implementation,
        address _admin,
        bytes memory _data
    ) payable TransparentUpgradeableProxy(_implementation, _admin, _data) {}
}
