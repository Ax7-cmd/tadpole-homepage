$(document).ready(function () {
    // load market cap rank
    var mcrXhttp = new XMLHttpRequest();
    mcrXhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const obj = JSON.parse(mcrXhttp.response);
            if (obj.market_cap_rank != undefined) {
                $('.mcr').html(obj.market_cap_rank);
            }
        }
    };
    mcrXhttp.open("GET", "https://api.coingecko.com/api/v3/coins/tadpole-finance?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false", true);
    mcrXhttp.send();
});