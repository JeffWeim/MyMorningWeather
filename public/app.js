var MorningWeather = function() {
    var self = this;

    self.init = function() {
        self.eventListeners();
    },

    self.eventListeners = function() {
        $('.start-button').on('click', function(e) {
            e.preventDefault();

            $(this).hide();

            self.getData();
        });
    },

    self.getData = function() {
        $.ajax({
            method: "GET",
            type: "html",
            url: "/startApp"
        }).done(function(data) {
            $('.last-started').text(data);

            $('.last-started').show();
        });
    }
};

var morningWeather = new MorningWeather();

morningWeather.init();
