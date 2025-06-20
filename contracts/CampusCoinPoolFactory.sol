// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@uniswap/v4-core/contracts/interfaces/IPoolManager.sol";
import "@uniswap/v4-core/contracts/libraries/PoolKey.sol";
import "./POAPHook.sol";

contract CampusCoinPoolFactory {
    IPoolManager public immutable poolManager;
    POAPHook public immutable poapHook;

    constructor(address _poolManager, address _poapHook) {
        poolManager = IPoolManager(_poolManager);
        poapHook = POAPHook(_poapHook);
    }

    function createCampusPool(address tokenA, address tokenB) external returns (address pool) {
        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(tokenA),
            currency1: Currency.wrap(tokenB),
            fee: 500,
            tickSpacing: 60,
            hooks: IHooks(address(poapHook))
        });

        pool = poolManager.initialize(key, SQRT_RATIO_1_1, "");
        return pool;
    }
} 