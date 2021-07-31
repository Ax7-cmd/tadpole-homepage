if (location.protocol !== 'https:' && location.hostname !== "localhost" && location.hostname !== "tadpole-homepage.test") { //force https
    location.replace(`https:${location.href.substring(location.protocol.length)}`);
}

$(document).ready(function () {
    // select lang
    $('.select-lang').on('change', function() {
        if($(this).attr('data-selected') != $(this).val()){
            switch ($(this).val()) {
                case 'id':
                    window.location.replace("/id");
                    break;
                case 'cn':
                    window.location.replace("/cn");
                    break;

                default:
                    window.location.replace("/");
                    break;
            }
        }
    });
});