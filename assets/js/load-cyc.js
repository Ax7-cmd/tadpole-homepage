$(document).ready(function () {
    // load data circulating supply
    var cycXhttp = new XMLHttpRequest();
    cycXhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const obj = JSON.parse(cycXhttp.response);
            $('.cyc-value').html(obj.strValue + ' TAD');
            $('.cyc-percent').html(obj.percent + '%');
            $('.cyc-percent-style').attr('style', 'width: ' + obj.percent + '%');
            $('.cyc-percent-style').attr('aria-valuenow', obj.percent);
            $('.cyc-update').html('* update, ' + obj.updatedAt);
        }
    };
    cycXhttp.open("GET", "//api.npoint.io/f7f14792a99a6209db30", true);
    cycXhttp.send();
});