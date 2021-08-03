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
		var borrowRatePerBlock = await cToken.contract.methods.borrowRatePerBlock().call();
        var supplyApy = (((Math.pow((supplyRatePerBlock / mentissa * blocksPerDay) + 1, daysPerYear - 1))) - 1) * 100;
		var borrowApy = (((Math.pow((borrowRatePerBlock / mentissa * blocksPerDay) + 1, daysPerYear - 1))) - 1) * 100;
        $('.' + cToken.id + '-apy').html(supplyApy.toFixed(2));
        $('.' + cToken.id + '-borrow-rate').html(borrowApy.toFixed(2));
    });
}

var syncMarkets = async function () {
    ENV = _MAINNET_ENV;
    var i = 0;
    Object.values(ENV.cTokens).forEach(async function (cToken, index) {
        var getCash = await cToken.contract.methods.getCash().call();
        var totalBorrows = await cToken.contract.methods.totalBorrows().call();
        var totalReserves = await cToken.contract.methods.totalReserves().call();

        // ===========
        MARKETS.cToken[cToken.id].getCash = getCash;
        MARKETS.cToken[cToken.id].totalBorrows = totalBorrows;
        MARKETS.cToken[cToken.id].totalReserves = totalReserves;
        MARKETS.cToken[cToken.id].totalSupplyVal.decimalValue = ((getCash/(10**18)) + (totalBorrows/(10**18)) - (totalReserves/(10**18)));
        MARKETS.cToken[cToken.id].totalBorrowsVal.decimalValue = (totalBorrows/(10**18));

        // ===== coingecko api
        let response = await new Promise(resolve => {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", MARKETS.cToken[cToken.id].coingeckoUrl, true);
            xhr.onload = function(e) {
              resolve(JSON.parse(xhr.response));
            };
            xhr.onerror = function () {
              resolve(undefined);
              console.error("** An error occurred during the XMLHttpRequest");
            };
            xhr.send();
        });
        MARKETS.cToken[cToken.id].priceUSD = response.market_data.current_price.usd;
        MARKETS.cToken[cToken.id].totalSupplyVal.inUSD = MARKETS.cToken[cToken.id].totalSupplyVal.decimalValue * MARKETS.cToken[cToken.id].priceUSD;
        MARKETS.cToken[cToken.id].totalBorrowsVal.inUSD = MARKETS.cToken[cToken.id].totalBorrowsVal.decimalValue * MARKETS.cToken[cToken.id].priceUSD;
        MARKETS.markets.totalSupplyVal.inUSD = MARKETS.cToken.tad.totalSupplyVal.inUSD + MARKETS.cToken.usdt.totalSupplyVal.inUSD + MARKETS.cToken.bnb.totalSupplyVal.inUSD;
        MARKETS.markets.totalBorrowsVal.inUSD = MARKETS.cToken.tad.totalBorrowsVal.inUSD + MARKETS.cToken.usdt.totalBorrowsVal.inUSD + MARKETS.cToken.bnb.totalBorrowsVal.inUSD;

        i++;
        if(i == 3){
            $('.markets-total-supply-usd').html('$' + MARKETS.markets.totalSupplyVal.inUSD.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'));
            $('.markets-total-borrows-usd').html('$' + MARKETS.markets.totalBorrowsVal.inUSD.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'));
            let tadSupply = Math.round(((MARKETS.cToken.tad.totalSupplyVal.inUSD/MARKETS.markets.totalSupplyVal.inUSD)*100));
            let tadBorrows = Math.round(((MARKETS.cToken.tad.totalBorrowsVal.inUSD/MARKETS.markets.totalBorrowsVal.inUSD)*100));
            let usdtSupply = Math.round(((MARKETS.cToken.usdt.totalSupplyVal.inUSD/MARKETS.markets.totalSupplyVal.inUSD)*100));
            let usdtBorrows = Math.round(((MARKETS.cToken.usdt.totalBorrowsVal.inUSD/MARKETS.markets.totalBorrowsVal.inUSD)*100));
            let bnbSupply = Math.round(((MARKETS.cToken.bnb.totalSupplyVal.inUSD/MARKETS.markets.totalSupplyVal.inUSD)*100));
            let bnbBorrows = Math.round(((MARKETS.cToken.bnb.totalBorrowsVal.inUSD/MARKETS.markets.totalBorrowsVal.inUSD)*100));

            $('.percent-supply-tad').html(tadSupply + '%');
            $('.percent-supply-usdt').html(usdtSupply + '%');
            $('.percent-supply-bnb').html(bnbSupply + '%');
            $('.percent-borrows-tad').html(tadBorrows + '%');
            $('.percent-borrows-usdt').html(usdtBorrows + '%');
            $('.percent-borrows-bnb').html(bnbBorrows + '%');
            
            $('.progress-supply-tad').attr('style', 'width: '+tadSupply+'%;');
            $('.progress-supply-usdt').attr('style', 'width: '+usdtSupply+'%;');
            $('.progress-supply-bnb').attr('style', 'width: '+bnbSupply+'%;');
            $('.progress-borrows-tad').attr('style', 'width: '+tadBorrows+'%;');
            $('.progress-borrows-usdt').attr('style', 'width: '+usdtBorrows+'%;');
            $('.progress-borrows-bnb').attr('style', 'width: '+bnbBorrows+'%;');

            $('.loading-progress-markets').hide();
        }
    });
}

$(document).ready(function () {
    syncCont();
    syncRate();
});