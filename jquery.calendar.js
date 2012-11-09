function jqueryCalendar()
{
    var self = this;

    /* Cache Lifespan in Seconds
    */
    this.cache_ttl = null;

    /* Prefix to prepend before cache if multiple calendars are used on same site
    */
    this.cache_prefix = '';

    this.days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    this.daysFull = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    this.months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August', 
        'September',
        'October',
        'November',
        'December'
    ];
    
    this.toggleMonth = true;
    this.toggleYear = true;
    
    this.offset = 0;

    if (window.Cache && this.cache_ttl) {
        var cache_year = Cache.fetch(this.cache_prefix + 'calendar_year');
        var cache_month = Cache.fetch(this.cache_prefix + 'calendar_month');
    }
        
    if (this.cache_ttl && cache_year !== null && cache_month !== null) {
        this.start_date = new Date(cache_year, cache_month, 1);
    } else {
        this.start_date = new Date();
    }

    this.setMonth = function (year, month)
    {
        this.start_date = new Date(year, month, 1);
    }

    this.append = function(node)
    {
        this.node = $(node);
        var template;
        template  = '<div class="calendar">';
        template += '<div class="calendar-head">';

        if (this.toggleMonth) {
            template += '<div class="calendar-months">';
            template += '<span class="calendar-button calendar-previous-month"></span>';
            if (this.toggleYear == false) {   
                template += '<span class="calendar-month-year">';
                template += '<span class="calendar-month"></span>';
                template += ' <span class="calendar-year"></span>';
                template += "</span>";
            } else {
                template += '<span class="calendar-month"></span>';
            }
            template += '<span class="calendar-button calendar-next-month"></span>';
            template += '</div>';
        }

        if (this.toggleYear) {
            template += '<div class="calendar-years">';
            template += '<span class="calendar-button calendar-previous-year"></span>';
            template += '<span class="calendar-year"></span>';
            template += '<span class="calendar-button calendar-next-year"></span>';
            template += '</div>';
        
        }

        template += '</div>';
        template += '<div class="calendar-body">';
        template += '<table class="calendar-table">';
        template += '<thead><tr>';

        for (var i = 0; i < 7; i++) {
            template += '<td>' + self.days[i] + '</td>';
        }

        template += '</tr></thead>';
        template += '<tbody></tbody>';
        template += '</table>';
        template += '</div></div>';
        
        this.node.append(template)
        .on('click', '.calendar-previous-month', function()
        {
            self.previous();
        })
        .on('click', '.calendar-next-month', function()
        {
            self.next();
        })
        .on('click', '.calendar-previous-year', function()
        {
            self.previousYear();
        })
        .on('click', '.calendar-next-year', function()
        {
            self.nextYear();
        })
        .css('user-select', 'none')
        .on('selectstart', function(evt)
        {
            evt.preventDefault();
            return false;        
        });

        this.draw_month(0);
    }

    this.previous = function(callback)
    {
        this.fade_month(this.offset - 1, false, callback)
    }

    this.previousYear = function()
    {
        this.fade_month(this.offset - 12, true)
    }

    this.next = function(callback)
    {
        this.fade_month(this.offset + 1, false, callback)
    }

    this.nextYear = function()
    {
        this.fade_month(this.offset + 12, true)
    }

    this.fade_month = function(offset, fade_year, callback)
    {
        if (fade_year) {
            $('.calendar-year', this.node).fadeOut(200);
        } else {
            $('.calendar-month', this.node).fadeOut(200);
        }

        $('tbody', this.node).fadeOut(200, function()
        {
            self.draw_month(offset);
            if (callback) {
                callback();
            }
            $(self).trigger('change');
            $(this).fadeIn(200);
            if (fade_year) {
                $('.calendar-year', this.node).fadeIn(200);
            } else {
                $('.calendar-month', this.node).fadeIn(200);
            }
        });
    }

    this.draw_month = function(offset)
    {
        this.offset = offset;
        var tbody  = $('tbody', this.node);
        tbody.empty();

        var today = new Date();
        var now = this.start_date;

        var  first = this.date = new Date(now.getFullYear(), now.getMonth() + this.offset, 1);
        var month = first.getMonth();
        var year =  first.getFullYear();

        if (this.cache_ttl) {
            Cache.store(this.cache_prefix + 'calendar_year', year, this.cache_ttl);
            Cache.store(this.cache_prefix + 'calendar_month', month, this.cache_ttl);
        }

        $('.calendar-month', this.node).text(this.months[month]);
        $('.calendar-year', this.node).text(year);
        
        var last  = new Date(year, month + 1, 0); 
        var total = first.getDay() + last.getDate() + (7 - last.getDay());

        var dayOffset = - first.getDay();
        var str = "";
        for (var i = 1; i < total; i++) {
            var date = new Date(year, month, dayOffset + i); 
            var day = date.getDate();

            if (i % 7 == 1) {
                str += "<tr>";
            }

            if (date.getMonth() < month) {
                var className = 'calendar-day-previous';
            } else if (date.getMonth() == month) {
                var className = 'calendar-day-current';
                if (today.getFullYear() == year && today.getMonth() == month && today.getDate() == day) {
                    className += ' calendar-today';
                }
            } else {
                var className = 'calendar-day-next';
            } 

            str += '<td class="' + className + '" data-date="' + date.toString() + '">' + day + '</td>';

            if (i % 7 == 0) {
                str += "</tr>";
            }
        }

        $(tbody).append(str);
    }

    this.getMonth = function()
    {
        return this.date.getMonth() + 1;
    }

    this.getYear = function()
    {
        return this.date.getFullYear();
    }
}
