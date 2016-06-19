/*
*    DatePicker test javascript
*    @Author: Waldir Martinez C.
*
*/

(function () {

    var config = {
        abbrDays : ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'],
        months : ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        view: 'days',
        fromView: null,
        datepicker: null,
        date: null
    }

    var defaults, closing = false;

    this.DatePicker = function (selector, options) {
        this.element = null;

        defaults = {
            date: new Date(),
            formatDate: 'YYYY/MM/DD',
            autoclose: false,
            range: false,
            onSelect: null
        };

        if(typeof selector === 'string'){
            this.element = document.body.querySelector(selector);
            this.options = extendDefaults(defaults, options);
            this.hide = this.hide.bind(this);
            this._setPosition = setPosition.bind(this);

            attach.call(this);
        }
    };

    function attach () {
        config.date = new Date(this.options.date);
        this.element.addEventListener('click', show.bind(this));
        this.element.addEventListener('focus', show.bind(this));
    }

    function show (event) {
        event.stopImmediatePropagation();

        this.hide();

        if(typeof config.datepicker === 'undefined' || config.datepicker === null){

            config.datepicker = document.createElement('div');
            config.datepicker.className = 'datepicker';
            this.update();

            setPosition.call(this);

            document.body.appendChild(config.datepicker);
            setValue.call(this);
        }
    }

    function remove () {
        if(config.datepicker){
            document.removeEventListener('click', this.hide);
            window.removeEventListener('resize', this._setPosition);

            document.body.removeChild(config.datepicker);
            config.datepicker = null;
        }
    }

    function setPosition () {
        var bounding = this.element.getBoundingClientRect();

        config.datepicker.style.position = 'absolute';
        config.datepicker.style.top = (bounding.top+bounding.height)+'px';
        config.datepicker.style.left = bounding.left+'px';
    }

    function initializeEvents () {
        var i, len, _this = this;
        var btnprevious = config.datepicker.querySelector('#btn-previous');
        var btnnext = config.datepicker.querySelector('#btn-next');
        var selectables = config.datepicker.querySelectorAll('tbody td');

        btnprevious.addEventListener('click', previous.bind(this));
        btnnext.addEventListener('click', next.bind(this));

        if(config.view === 'days'){
            var btntomonths = config.datepicker.querySelector('#to-months');
            btntomonths.addEventListener('click', toView.bind(this, 'months'));
        }

        if(config.view === 'days' || config.view === 'months'){
            var btntoyears = config.datepicker.querySelector('#to-years');
            btntoyears.addEventListener('click', toView.bind(this, 'years'));
        }

        for (i = 0, len = selectables.length; i < len; i++){
            selectables[i].addEventListener('click', selectItem.bind(this));

            if(this.options.range){
                selectables[i].addEventListener('mouseenter', markRange.bind(this));
                selectables[i].addEventListener('mouseleave', removeMarkRange.bind(this));
            }
        }
        document.removeEventListener('click', this.hide);
        document.addEventListener('click', this.hide);

        window.removeEventListener('resize', this._setPosition);
        window.addEventListener('resize', this._setPosition);
    }

    function build () {
        var thead, tbody;
        var calendar = '<table class="calendar '+config.view+'">'
        + '{thead}'
        + '{tbody}'
        + '</table>';

        thead = buildHeader.call(this);
        tbody = buildBody.call(this);
        calendar = calendar.replace('{thead}', thead).replace('{tbody}', tbody);
        return calendar;
    }

    function buildHeader () {
        var title, days;
        var date = config.date;
        var thead = '<thead>'
        + '<tr class="nav-container">'
        + '<th>'
        + '<i class="arrow left" id="btn-previous"></i>'
        + '</th>'
        + '{title}'
        + '<th>'
        + '<i class="arrow right" id="btn-next"></i>'
        + '</th>'
        + '</tr>'
        + '{days}'
        + '</thead>';

        switch (config.view) {
            case 'days':

            title = '<th colspan="5">'
            + '<p id="to-months" class="title-md">'+getMonthName.call(this, date.getMonth())+'</p>'
            + '<p id="to-years" class="title-sm">'+date.getFullYear()+'</p>'
            + '</th>';

            days =  printDayNames.call(this);

            break;
            case 'months':

            title = '<th><p id="to-years" class="title-md">'+date.getFullYear()+'</p></th>';
            days = '';

            break;
            case 'years':

            var decade = getYearDecade(date.getFullYear());
            title = '<th><p class="title-md">'+decade+' - '+(decade + 11)+'</p></th>';
            days = '';

            break;
            default:
            toView.call(this, 'days');

        }
        return thead.replace('{title}', title).replace('{days}', days);
    }

    function buildBody () {
        var tbody ='<tbody>{content}</tbody>';
        var content;

        switch (config.view) {
            case 'days':
            content = printDayMonths.call(this);
            break;
            case 'months':
            content = printMonthNames.call(this);
            break;
            case 'years':
            content = printYears.call(this);
            break;
            default:
        }

        return tbody.replace('{content}', content);
    }

    function printDayNames () {
        var i, abbrDays = config.abbrDays;
        var days = '<tr class="day-names">';

        for(i = 0, len = abbrDays.length; i < len; i++) {
            days += '<th>'+abbrDays[i]+'</th>'
        }

        return days + '</tr>';
    }

    function printYears () {
        var date = config.date;
        var decade = getYearDecade(date.getFullYear()), month = date.getMonth();
        var currentyear = date.getFullYear();
        var i, items = '', row = '';

        for(i = 0; i < 12; i++){
            row += '<td '+((decade+i) === currentyear ? 'class="selected"' : '')
            + ' to="'+(config.fromView === 'days' ? 'days' : 'months')
            + '" data-date="'+ getDateString(new Date((decade+i), month)) +'">'
            + (decade + i) +'</td>';

            if(i !== 0 && (i+1) % 3 === 0){
                items += '<tr>'+row+'</tr>';
                row = '';
            }
        }
        return items;
    }

    function printMonthNames () {
        var months = config.months;
        var date = config.date, year = date.getFullYear();
        var currentmonth = date.getMonth();
        var i, len, items = '', row = '';

        for(i = 0, len = months.length; i < len; i++){
            row += '<td '+ (i === currentmonth ? 'class="selected"' : '')
            +' to="days" data-date="'+ getDateString(new Date(year, i))
            + '">'+months[i]+'</td>';

            if(i !== 0 && (i+1) % 3 === 0){
                items += '<tr>'+row+'</tr>';
                row = '';
            }
        }
        return items;
    }

    function printDayMonths () {
        var date = config.date;
        var selected = this.options.date;
        var items = '', days = 1, dateprint, i, j;
        var days = 1, nextdays = 1, datestring;
        var year = date.getFullYear(), month = date.getMonth();
        var previousmonth = new Date(date);
        previousmonth.setMonth(month -1);

        var lastprevious = lastDayMonth(previousmonth).getDate();
        var lastcurrent = lastDayMonth(date).getDate();
        var firstcurrent = firstDayMonth(date);
        var firstdaymonth = firstcurrent.getDay();
        selected = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());
        lastprevious = lastprevious - firstdaymonth;

        for(i = 0; i < 6; i++){
            items += '<tr>';
            for(j = 1; j <= 7; j++){
                if(i === 0 && j <= firstdaymonth){
                    dateprint = new Date(year, month-1, (lastprevious+j));
                    datestring = getDateString(dateprint);

                    items += '<td class="previous-month '+(selected.getTime() === dateprint.getTime() ? 'selected' : '')
                    + '" data-date="'+datestring+'">'
                    + '<span>'+( lastprevious + j )+'</span>'
                    + '</td>';
                }else if(days <= lastcurrent){
                    dateprint = new Date(year, month, days);
                    datestring = getDateString(dateprint);

                    items += '<td '+(selected.getTime() === dateprint.getTime() ? 'class="selected"' : '')
                    +' data-date="'+datestring+'">'
                    +'<span>'+days+'</span>'
                    +'</td>';
                    days++;
                }else{
                    dateprint = new Date(year, month+1, nextdays);
                    datestring = getDateString(dateprint);

                    items += '<td class="next-month '+(selected.getTime() === dateprint.getTime() ? 'selected' : '')
                    +'" data-date="'+datestring+'">'
                    +'<span>'+nextdays+'</span>'
                    +'</td>';
                    nextdays++;
                }
            }
            items += '</tr>';
        }
        return items;
    }

    function previous () {
        var date = config.date;

        switch (config.view) {
            case 'days':
            date.setMonth(date.getMonth() - 1);
            break;
            case 'months':
            date.setFullYear(date.getFullYear() - 1);
            break;
            case 'years':
            var year = date.getFullYear();
            date.setFullYear(getYearDecade(year) - 1);
            break;
            default:
        }
        this.update();
    }

    function next () {
        var date = config.date;

        switch (config.view) {
            case 'days':
            date.setMonth(date.getMonth() + 1);
            break;
            case 'months':
            date.setFullYear(date.getFullYear() + 1);
            break;
            case 'years':
            var year = date.getFullYear();
            date.setFullYear(getYearDecade(year) + 12);
            break;
            default:
        }
        this.update();
    }

    function selectItem (event) {
        var target = event.target || event.srcElement;
        var selected = config.datepicker.querySelector('.selected');
        var selecteddate;

        if(target.hasAttribute('to')){
            selecteddate = target.getAttribute('data-date');
            config.date = new Date(selecteddate);
            toView.call(this, target.getAttribute('to'));

            return;
        }

        if(target.tagName !== 'TD'){
            target = target.parentNode;
        }

        if(!hasClass(target, 'selected')){
            if(selected){
                removeClass(selected, 'selected');
            }
            selecteddate = target.getAttribute('data-date');
            this.options.date = new Date(selecteddate);
            addClass(target, 'selected');
            setValue.call(this);
        }

        if(this.options.autoclose){
            this.hide();
        }else if(this.options.range){
            removeMarkRange.call(this);
        }

        if(this.options.date.getMonth() !== config.date.getMonth()){
            config.date = new Date(this.options.date);
            this.update();
        }

        if(this.options.onSelect){
            this.options.onSelect(this.options.date);
        }
    }

    function setValue () {
        var date = this.options.date;
        var format = this.options.formatDate;
        this.element.value = formatDate(date, format);
    }

    function setView (name) {
        config.fromView = config.view;
        config.view = name;
    }

    function toView (view) {
        setView.call(this, view);
        this.update();
    }

    function markRange (event) {
        var target = event.target || event.srcElement;
        var targetdate, selected = new Date(this.options.date);
        var itemselected = config.datepicker.querySelector('.selected');
        var node, parent, children, i, len, next;

        if(target.tagName !== 'TD'){
            target = target.parentNode;
        }

        targetdate = new Date(target.getAttribute('data-date'));
        next = selected.getTime() > targetdate.getTime() ? true : false;
        parent = target.parentNode;
        parent = next ? parent.nextSibling : parent.previousSibling;
        node = target;

        while(node !== null){
            addClass(node, 'in-range');
            node = next ? node.nextSibling : node.previousSibling;
            if(node !== null && node === itemselected){
                return false;
            }
        }

        while(parent !== null && parent.tagName === 'TR'){
            children = parent.childNodes;
            if(next){
                for(i = 0, len = children.length; i < len; i++){
                    if(children[i] !== itemselected){
                        addClass(children[i], 'in-range');
                    }else{
                        addClass(children[i], 'in-range');
                        return false;
                    }
                }
            }else{
                for(i = children.length -1; i >= 0; i--){
                    if(children[i] !== itemselected){
                        addClass(children[i], 'in-range');
                    }else{
                        addClass(children[i], 'in-range');
                        return false;
                    }
                }
            }
            parent = next ? parent.nextSibling : parent.previousSibling;
        }
    }

    function removeMarkRange (){
        var hovered = config.datepicker.querySelectorAll('.in-range');

        for(i = 0, len = hovered.length; i < len; i++){
            removeClass(hovered[i], 'in-range');
        }
    }

    function formatDate (date, format) {

        if(typeof format === 'undefined' || format.indexOf('YYYY') === -1
        || format.indexOf('MM') === -1 || format.indexOf('DD') === -1){
            format = defaults.formatDate;
            console.log('Date format not support, using default.');
        }

        format = format.replace('YYYY', date.getFullYear())
        .replace('MM', ('0' + (date.getMonth() + 1)).slice(-2))
        .replace('DD', ('0' + date.getDate()).slice(-2));

        return format;
    }

    function getDateString (date) {
        return date.toDateString();
    }

    function firstDayMonth (date) {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    }

    function lastDayMonth (date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    }

    function getMonthName (month) {
        return config.months[month];
    }

    function getYearDecade (year) {
        return Math.floor(year/10) * 10;
    }

    function hasClass (element, className) {
        var reg = new RegExp('\\b'+className+'\\b');

        if (element.className.match(reg)) {
            return true;
        }

        return false;
    }

    function addClass (element, className){
        element.className += ' '+className;
    }

    function removeClass (element, className) {
        var reg = new RegExp('\\b'+className+'\\b');

        element.className = element.className.replace(reg, '');
    }

    function isChildOfDatepicker(child) {
        var node = child.parentNode;
        var lastnode;

        while (node !== null) {

            if (node === config.datepicker) {
                return true;
            }

            if(node !== null){
                lastnode = node;
            }

            node = node.parentNode;
        }

        if(lastnode.tagName === 'TABLE' && hasClass(lastnode, 'calendar')){
            return true;
        }

        return false;
    }

    function extendDefaults (source, properties) {
        var property;

        for (property in properties) {
            if (properties.hasOwnProperty(property)) {
                source[property] = properties[property];
            }
        }

        return source;
    }

    DatePicker.prototype.update = function () {
        var calendar;

        calendar = build.call(this);
        config.datepicker.innerHTML = calendar;
        initializeEvents.call(this);
    };

    DatePicker.prototype.hide = function (event) {
        var target;
        closing = true;

        if(typeof event !== 'undefined'){
            target = event.target || event.srcElement;
            if(this.element !== target && !isChildOfDatepicker(target)){
                remove.call(this);
            }

        }else if(typeof event === 'undefined'){
            remove.call(this);
        }
    };

})();
