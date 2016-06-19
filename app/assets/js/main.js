(function () {
    'use strict';

    var datepicker = new DatePicker('#datepicker1', {
        range: true,
        onSelect: function (date) {
            var next = document.getElementById('datepicker2');

            if(next.value.trim().length === 0){
                datepicker.hide();

                setTimeout(function () {
                    next.focus();
                }, 100);
            }
        }
    });

    var datepicker2 = new DatePicker('#datepicker2', {
        range: true,
        onSelect: function (date) {
            var prev = document.getElementById('datepicker1');

            if(prev.value.trim().length === 0){
                datepicker2.hide();

                setTimeout(function () {
                    prev.focus();
                }, 100);
            }
        }
    });

    var datepicker3 = new DatePicker('#datepicker', {autoclose: true});

})();
