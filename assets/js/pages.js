$(document).ready(function () {
    var canvs = document.getElementById("fishHolder");
    canvs.width = window.innerWidth;
    canvs.height = $('.bg-holder').height();
    $('#fishHolder').fishAnimation();

    // load data circulating supply
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const obj = JSON.parse(xhttp.response);
            $('.cyc-value').html(obj.strValue + ' TAD');
            $('.cyc-percent').html(obj.percent + '%');
            $('.cyc-percent-style').attr('style', 'width: ' + obj.percent + '%');
            $('.cyc-percent-style').attr('aria-valuenow', obj.percent);
            $('.cyc-update').html('* update, ' + obj.updatedAt);
        }
    };
    xhttp.open("GET", "//api.npoint.io/f7f14792a99a6209db30", true);
    xhttp.send();
});