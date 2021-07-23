var BN = web3.utils.BN;

var accountBalance = new Object();
var accountBorrow = new Object();
var prices = new Object();
var enableCollateral = new Object();
var assetsIn;
var accountLiquidityAvailable;
const gasLimitStake = 300000;
const gasLimitApprove = 70000;

var formatter = new Intl.NumberFormat('us-US', {
    style: 'currency',
    currency: 'USD',
});

var _MAINNET_ENV = {
    "id": 1,
    "comptrollerAddress": "0x8Cb331D8F117a5C914fd0f2579321572A27bf191",
    "oracleAddress": "0x2E0490c8fd2b23cB323370bb7958204A23504AaC",
    "tadAddress": "0x9f7229aF0c4b9740e207Ea283b9094983f78ba04",
    "etherscan": "https://bscscan.com/",
    "cTokens": {
        "tad": {
            "id": "tad",
            "name": "TAD",
            "index": "tadpole-finance",
            "unit": "TAD",
            "logo": "./assets/images/tokens/tad_32.png",
            "cTokenDecimals": 8,
            "underlyingDecimals": 18,
            "address": "0x684EB9b9675B9999F4b50038Ce7151E68f111ca6",
            "underlyingAddress": "0x9f7229aF0c4b9740e207Ea283b9094983f78ba04"
        },
        "usdt": {
            "id": "usdt",
            "name": "USDT",
            "index": "tether",
            "unit": "USDT",
            "logo": "./assets/libs/cryptocurrency-icons/32/color/usdt.png",
            "cTokenDecimals": 8,
            "underlyingDecimals": 18,
            "address": "0x7d611B1B0B70Fcf0678d44893418301c712C868E",
            "underlyingAddress": "0x55d398326f99059fF775485246999027B3197955"
        },
        "bnb": {
            "id": "bnb",
            "name": "BNB",
            "index": "bnb",
            "unit": "BNB",
            "logo": "./assets/libs/cryptocurrency-icons/32/color/bnb.png",
            "cTokenDecimals": 8,
            "underlyingDecimals": 18,
            "address": "0x3f01C2b4A090Fa8BD36e87B78e0d75e37d2d5D90",
            "underlyingAddress": "0x"
        }
    }
}

var ENV = _MAINNET_ENV;
var OLD_ENVID;

var syncCont = function () {

    ENV = _MAINNET_ENV;

    ENV.comptrollerContract = new web3.eth.Contract(comptrollerAbi, ENV.comptrollerAddress);
    ENV.oracleContract = new web3.eth.Contract(oracleAbi, ENV.oracleAddress);
    Object.values(ENV.cTokens).forEach(async function (cToken, index) {
        if (cToken.id == 'bnb') ENV.cTokens[cToken.id].contract = new web3.eth.Contract(cEtherAbi, cToken.address);
        else ENV.cTokens[cToken.id].contract = new web3.eth.Contract(cErc20Abi, cToken.address);
    });
}

const blocksPerDay = 12 * 60 * 24;
const daysPerYear = 365;
const mentissa = 1e18;

var syncRate = function () {

    ENV = _MAINNET_ENV;
    Object.values(ENV.cTokens).forEach(async function (cToken, index) {

        var supplyRatePerBlock = await cToken.contract.methods.supplyRatePerBlock().call();
        var supplyApy = (((Math.pow((supplyRatePerBlock / mentissa * blocksPerDay) + 1, daysPerYear - 1))) - 1) * 100;
        $('.' + cToken.id + '-apy').html(supplyApy.toFixed(2));
    });
}
$(document).ready(function () {
    syncCont();
    syncRate();
});