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
    "comptrollerAddress": "0x",
    "oracleAddress": "0x",
    "tadAddress": "0x9f7229aF0c4b9740e207Ea283b9094983f78ba04",
    "genesisMiningAddress": "0x8Cb331D8F117a5C914fd0f2579321572A27bf191",
    "uniswapMiningAddress": "0x0c14e822E43796d955a30b6d974f62031dA845e3",
    "lpAddress": "0x9D8D4550637e3fc86CB465734Ab33280e4838E08",
    "uniswapAddress": "0x9D8D4550637e3fc86CB465734Ab33280e4838E08",
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
        },
        "ten": {
            "id": "ten",
            "name": "TEN",
            "index": "tokenomy",
            "unit": "TEN",
            "logo": "./assets/images/tokens/ten_32.png",
            "cTokenDecimals": 8,
            "underlyingDecimals": 18,
            "address": "0x",
            "underlyingAddress": "0xDD16eC0F66E54d453e6756713E533355989040E4"
        }
    }
}

var MARKETS = {
    "markets": {
        "totalSupplyVal": {
            "inUSD": 0,
        },
        "totalBorrowsVal": {
            "inUSD": 0,
        },
    },
    "cToken": {
        "tad": {
            "getCash": 0,
            "totalBorrows": 0,
            "totalReserves": 0,
            "coingeckoUrl": "https://api.coingecko.com/api/v3/coins/tadpole-finance?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false",
            "priceUSD": 0,
            "totalSupplyVal": {
                "decimalValue": 0,
                "inUSD": 0,
            },
            "totalBorrowsVal": {
                "decimalValue": 0,
                "inUSD": 0,
            },
        },
        "usdt": {
            "getCash": 0,
            "totalBorrows": 0,
            "totalReserves": 0,
            "coingeckoUrl": "https://api.coingecko.com/api/v3/coins/tether?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false",
            "priceUSD": 0,
            "totalSupplyVal": {
                "decimalValue": 0,
                "inUSD": 0,
            },
            "totalBorrowsVal": {
                "decimalValue": 0,
                "inUSD": 0,
            },
        },
        "bnb": {
            "getCash": 0,
            "totalBorrows": 0,
            "totalReserves": 0,
            "coingeckoUrl": "https://api.coingecko.com/api/v3/coins/binancecoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false",
            "priceUSD": 0,
            "totalSupplyVal": {
                "decimalValue": 0,
                "inUSD": 0,
            },
            "totalBorrowsVal": {
                "decimalValue": 0,
                "inUSD": 0,
            },
        },
    },
};

var ENV = _MAINNET_ENV;
var OLD_ENVID;

change_environment = function (chainId) {
    if (!chainId) return false;
    getTVL();
    return true;
}

var getTVL = async function () {
    // get total supply USD
    var totalSupplyUSD = await getTotalSupplyUSD();
    // get stake ten * USD
    var totalStakeTenUSD = await getTotalStakeTenUSD();
    // get total liquidity USD
    var totalLiquidityUSD = await getTotalLiquidityUSD();

    // console.log(totalSupplyUSD);
    // console.log(totalStakeTenUSD);
    // console.log(totalLiquidityUSD);
    $('.tvl-value').html('$' + (totalSupplyUSD + totalStakeTenUSD + totalLiquidityUSD).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'));
}

var getTotalStakeTenUSD = async function () {
    var genesisCont = new web3.eth.Contract(genesisMiningAbi, ENV.genesisMiningAddress);
    var total_stake = await genesisCont.methods.totalStaked().call();
    var tenTadPrices = await getEthTenTadPrices();

    return web3.utils.fromWei(total_stake) * tenTadPrices.TEN;
}

var getTotalLiquidityUSD = async function () {
    var lpCont = new web3.eth.Contract(tadLpAbi, ENV.lpAddress);
    var reserves = await lpCont.methods.getReserves().call();
    var reserveTad = web3.utils.fromWei(reserves._reserve0);
    var reserveEth = web3.utils.fromWei(reserves._reserve1);
    var ethTenTadPrices = await getEthTenTadPrices();

    return (reserveEth * ethTenTadPrices.ETH + reserveTad * ethTenTadPrices.TAD);
}

var getEthTenTadPrices = async function () {
    let data = await fetch('https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: "{ \
		  tokens(where: {id_in: [\"0x9f7229af0c4b9740e207ea283b9094983f78ba04\", \"0xdd16ec0f66e54d453e6756713e533355989040e4\"]}) {\
			id derivedETH symbol\
			}\
		  bundle(id: \"1\"){ ethPrice }	  }"
            })
        })
        .then(r => r.json())
        .then(data => {
            return data;
        });

    var ethPrice = data.data.bundle.ethPrice;
    var tadPrice = data.data.tokens[0].derivedETH * ethPrice;
    var tenPrice = data.data.tokens[1].derivedETH * ethPrice;

    return {
        ETH: ethPrice,
        TAD: tadPrice,
        TEN: tenPrice
    };
}

$(function () {
    getTVL();
    // setInterval(function () {
    //     getTVL();
    // }, 10000);
});