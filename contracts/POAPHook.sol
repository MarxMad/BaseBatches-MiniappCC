// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./POAPVerifier.sol";
import "@uniswap/v4-core/contracts/interfaces/IHook.sol";
import "@uniswap/v4-core/contracts/libraries/Hooks.sol";

contract POAPHook is IHook {
    POAPVerifier public poapVerifier;

    constructor(address _poapVerifier) {
        poapVerifier = POAPVerifier(_poapVerifier);
    }

    function beforeSwap(
        address sender,
        address recipient,
        uint256 amount0,
        uint256 amount1,
        bytes calldata data
    ) external override returns (bytes4) {
        require(poapVerifier.isStudent(sender), "Only students can swap");
        return IHook.beforeSwap.selector;
    }

    function afterSwap(
        address sender,
        address recipient,
        uint256 amount0,
        uint256 amount1,
        bytes calldata data
    ) external override returns (bytes4) {
        return IHook.afterSwap.selector;
    }

    function beforeInitialize(
        address sender,
        address recipient,
        uint256 amount0,
        uint256 amount1,
        bytes calldata data
    ) external override returns (bytes4) {
        return IHook.beforeInitialize.selector;
    }

    function afterInitialize(
        address sender,
        address recipient,
        uint256 amount0,
        uint256 amount1,
        bytes calldata data
    ) external override returns (bytes4) {
        return IHook.afterInitialize.selector;
    }
} 