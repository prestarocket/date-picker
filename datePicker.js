/**
 * A new UI for picking dates
 * 
 * @constructor
 * @dependencies jQuery 1.7
 * 
 * @param {HTMLElement} input The input you want to make a date picker
 * @param {Object} options Overide the config defaults if you want to.
 */
function DatePicker(input, options) {
    this.input  = input;
    this.config = {
        spacer: '/',
        year: {
            start: 2004,
            end: 2012,
            rangeChange: 0,
            infinite: true
        },
        selected: {
            year: '',
            month: '',
            day: ''
        },
        months: {
            '0': 'January',
            '1': 'February',
            '2': 'March',
            '3': 'April',
            '4': 'May',
            '5': 'June',
            '6': 'July',
            '7': 'August',
            '8': 'September',
            '9': 'October',
            '10': 'November',
            '11': 'December'
        },
//            'January',
//            'February',
//            'March',
//            'April',
//            'May',
//            'June',
//            'July',
//            'August',
//            'September',
//            'October',
//            'November',
//            'December'
//        ],
        position: 'absolute',
        where: 'top'
    }
    this.uniqueClass = 'dp_input_' + Math.floor(Math.random()*11);
    this.wrapper     = undefined;
    
    $.extend({}, this.config, options);
}

/**
 * @return {boolean}
 */
DatePicker.prototype.init = function() {
    if ( this.input.size() == 0 ) return false;
    
    this.hideInput();
    
    this.wrapper = $(this.buildTagBox());
    this.wrapper.insertAfter(this.input);
    
    // Next: positioning
    
    this.bind.focusTagBoxInput(this);
    this.bind.pickYear(this);
    this.bind.pickMonth(this);
    this.bind.pickDay(this);
    this.bind.updateYear(this);
    this.bind.updateMonth(this);
    this.bind.updateDay(this);
    this.bind.backspaceTagBoxInput(this);
    this.bind.blurTagBoxInput(this);
    this.bind.yearFuture(this);
    this.bind.yearPast(this);
    
    return true;
}

/**
 * Prepends the years, months or days into wrapper.
 * 
 * @return {undefined}
 */
DatePicker.prototype.insertDateChoice = function(content) {
    this.wrapper.find('.dp_choice').remove();
    this.wrapper.prepend(content);
}

/**
 *
 */
DatePicker.prototype.showCorrectDateChoice = function() {
    var that    = this,
        year    = that.wrapper.find('.dp_tag.dp_tag_year'),
        month   = that.wrapper.find('.dp_tag.dp_tag_month'),
        day     = that.wrapper.find('.dp_tag.dp_tag_day'),
        choice;
    
    // Nothing choosen yet
    if ( year.size() == 0 ) {
        choice = $(that.build.yearRange(that, {start: that.config.year.start, 
                                                 end: that.config.year.end}));
            
        that.insertDateChoice(choice);
        return;
    }
    
    // Year is already choosen
    if ( year.size() > 0 && month.size() == 0 ) {
        choice = $(that.build.months(that));
        that.insertDateChoice(choice);
        return;
    }
    
    // Year and Month is already choosen
    if ( year.size() > 0 && month.size() > 0 && day.size() == 0 ) {
        choice = $(that.build.days(that));
        that.insertDateChoice(choice);
        return;
    }
    
    // Year, Month and day is already choosen
//    if ( year.size() > 0 && month.size() > 0 && day.size() > 0 ) {
//        choice = $(that.build.days(that));
//        that.insertDateChoice(choice);
//        return;
//    }
    
}

/**
 * Methods that build markup.
 * 
 * @return {string}
 */
DatePicker.prototype.build = {
    /**
     * Build the list of years to choose from.
     * 
     * @param {!DatePicker} dpObj
     * @param {Object} range
     * @return {string}
     */
    yearRange: function(dpObj, range) {
        var that  = dpObj,
            div   = ['<div class="dp_years dp_choice">'],
            start = range.start,
            end   = range.end;
            
        div.push('<div class="dp_year_wrapper">');
        
        if ( that.config.year.infinite ) {
            div.push('<span class="dp_year_past">Up</span>');
        }

        // Build year list
        for ( var i=start; i<(end + 1); i++ ) {
            div.push('<span class="dp_year">' + i + '</span>');
        }
        
        if ( that.config.year.infinite ) {
            div.push('<span class="dp_year_future">Down</span>');
        }
        
        div.push('</div>');

        return div.join('');
    },
    /**
     * Build the months to pick from.
     * 
     * @param {!DatePicker} dpObj
     * @return {string}
     */
    months: function(dpObj) {
        var that   = dpObj,
            months = that.config.months,
            div    = ['<div class="dp_month_wrapper dp_choice">'];

        for ( var month in months ) {
            if ( months.hasOwnProperty(month) ) {
                div.push('<span class="dp_month" data-month="' + month + '">' + months[month] + '</span>');
            }
        }

        div.push('</div>');

        return div.join('');
    },
    days: function(dpObj) {
        var that               = dpObj,
            days_in_each_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
            year               = that.config.selected.year,
            month              = that.config.selected.month,
            howManyDays        = days_in_each_month[month];
            
        // February Leap Year Check
        if ( month == 1 ) {
            if ( (year % 4 == 0 && year % 100 != 0) || year % 400 == 0 ) {
                howManyDays = 29;
            }
        }
                
        var date = new Date(year, month, 1),
            day  = date.getDay(),
            days = ['<div class="dp_choice dp_days>">', '<ul>'];
        
        // Prepend Days of Week Headers
        days.push('<li class="dp_day dp_day_header size1of7">S</li>');
        days.push('<li class="dp_day dp_day_header size1of7">M</li>');
        days.push('<li class="dp_day dp_day_header size1of7">T</li>');
        days.push('<li class="dp_day dp_day_header size1of7">W</li>');
        days.push('<li class="dp_day dp_day_header size1of7">T</li>');
        days.push('<li class="dp_day dp_day_header size1of7">F</li>');
        days.push('<li class="dp_day dp_day_header size1of7">S</li>');
        
        
        // Prepend empty days
        for ( var p=0; p<day; p++ ) {
            days.push('<li class="dp_day dp_empty_day size1of7">-</li>');
        }
        
        // Build days
        for ( var i=1; i<howManyDays; i++ ) {
            days.push('<li class="dp_day size1of7 dp_day_' + day + '">' + i + '</li>');
            
            if ( 6 == day ) {
                day = 0;
            } else {
                day++;
            }
        }
        
        days.push('</ul>');
        days.push('</div>');
        
        return days.join('');
    }
};

/**
 * 
 */
DatePicker.prototype.bind = {
    /**
     * What happens when you focus the dynamic input?
     * 
     * @param {!DatePicker} dpObj
     * @return {undefined}
     */
    focusTagBoxInput: function(dpObj) {
        var that = dpObj;

        that.wrapper.on('focus', 'input', function() {
            that.showCorrectDateChoice();
        });
    },
    /**
     * What happens when you blur the dynamic input?
     * 
     * @param {!DatePicker} dpObj
     * @return {undefined}
     */
    blurTagBoxInput: function(dpObj) {
        var that = dpObj;
        
        that.wrapper.on('blur', 'input', function() {
            console.log('blur');
            //that.wrapper.find('.dp_choice').remove();
        });
    },
    /**
     * What happens once you pick a year?
     * 
     * @param {!DatePicker} dpObj
     * @return {undefined}
     */
    pickYear: function(dpObj) {
        var that = dpObj;

        that.wrapper.on('click', '.dp_year', function() {
            var year = $(this).text();
            
            that.insertTag('year', year);
            that.config.selected.year = year;

            // Build the months after picking a year
            var months = $(that.build.months(that));
            that.insertDateChoice(months);
            
            // Remove dependant tags
            that.wrapper.find('.dp_tag_month, .dp_tag_day').remove();
            
            that.updateHiddenInput();
        });
    },
    /**
     * @param {!DatePicker} dpObj
     * @return {undefined}
     */
    pickMonth: function(dpObj) {
        var that = dpObj;
        
        that.wrapper.on('click', '.dp_month', function() {
            var month = $(this).text();
            
            that.insertTag('month', month);
            that.config.selected.month = $(this).data('month');
            
            // Build the days after picking a month
            var days = $(that.build.days(that));
            that.insertDateChoice(days);
            
            // Remove dependant tags
            that.wrapper.find('.dp_tag_day').remove();
            
            that.updateHiddenInput();
        });
    },
    /**
     * @param {!DatePicker} dpObj
     * @return {undefined}
     */
    pickDay: function(dpObj) {
        var that = dpObj;
        
        that.wrapper.on('click', '.dp_day', function() {
            var day = $(this).text();
            
            that.insertTag('day', day);
            that.config.selected.day = day;
            
            that.updateHiddenInput();
            that.wrapper.find('.dp_choice').remove();
        });
    },
    /**
     * @param {!DatePicker} dpObj
     * @return {undefined}
     */
    updateYear: function(dpObj) {
        var that = dpObj;
        
        that.wrapper.on('click', '.dp_tag_year', function() {
            var yearConfig = that.config.year,
                rangeChange =  yearConfig.rangeChange,
                newStart  = yearConfig.start + rangeChange,
                newEnd    = yearConfig.end + rangeChange,
                years = $(that.build.yearRange(that, {start: newStart, end: newEnd}));
                
            that.insertDateChoice(years);
        });
    },
    /**
     * @param {!DatePicker} dpObj
     * @return {undefined}
     */
    updateMonth: function(dpObj) {
        var that = dpObj;
        
        that.wrapper.on('click', '.dp_tag_month', function() {
            // Build the days
            var months = $(that.build.months(that));
            that.insertDateChoice(months);
        });
    },
    /**
     * @param {!DatePicker} dpObj
     * @return {undefined}
     */
    updateDay: function(dpObj) {
        var that = dpObj;
        
        that.wrapper.on('click', '.dp_tag_day', function() {
            // Build the days
            var days = $(that.build.days(that));
            that.insertDateChoice(days);
        });
    },
    /**
     * @param {!DatePicker} dpObj
     * @return {undefined}
     */
    backspaceTagBoxInput: function(dpObj) {
        var that = dpObj;
        
        that.wrapper.on('keyup', 'input', function(e) {
            var key = e.keyCode,
                backspace = 8;
            
            if ( key == backspace ) {
                that.wrapper.find('.dp_tag:first').remove();
                that.showCorrectDateChoice();
                that.updateHiddenInput();
            }
        });
    },
    /**
     * @param {!DatePicker} dpObj
     * @return {undefined}
     */
    yearFuture: function(dpObj) {
        var that       = dpObj,
            yearConfig = that.config.year;
            
        that.wrapper.on('click', '.dp_year_future', function(e) {
            e.preventDefault();
            
            yearConfig.rangeChange = yearConfig.rangeChange + 9;
            
            var newStart = yearConfig.start + yearConfig.rangeChange,
                newEnd   = yearConfig.end + yearConfig.rangeChange,
                years    = $(that.build.yearRange(that, {start: newStart, end: newEnd}));
        
            that.insertDateChoice(years);    
        });
    },
    /**
     * @param {!DatePicker} dpObj
     * @return {undefined}
     */
    yearPast: function(dpObj) {
        var that       = dpObj,
            yearConfig = that.config.year;
            
        that.wrapper.on('click', '.dp_year_past', function(e) {
            e.preventDefault();
            
            yearConfig.rangeChange = yearConfig.rangeChange - 9;
            
            var newStart = yearConfig.start + yearConfig.rangeChange,
                newEnd   = yearConfig.end + yearConfig.rangeChange,
                years    = $(that.build.yearRange(that, {start: newStart, end: newEnd}));
        
            that.insertDateChoice(years);    
        });
    }
}

/**
 * @return {undefined}
 */
DatePicker.prototype.updateHiddenInput = function() {
    var that  = this,
        tag   = that.wrapper.find('.dp_tag'),
        value = '';
    
    that.input.val('');
    
    tag.each(function(i) {
        if ( i < 2 ) {
            value += $(this).text() + that.config.spacer;
        } else {
            value += $(this).text();
        }
    });
    
    that.input.val(value);
}

/**
 * @param {string} type The type of tag it is. (year, month, day)
 * @param {string} value The value of the tag.
 * @return {undefined}
 */
DatePicker.prototype.insertTag = function(type, value) {
    var that   = this,
        tagBox = that.wrapper.find('.dp_tagBox'),
        tag    = tagBox.find('.dp_tag.dp_tag_' + type);

    if ( tag.size() > 0 ) {
        tag.text(value);
    } else {
        tagBox.prepend('<span class="dp_tag dp_tag_' + type + '">' + value + '</span>');
    }
}

/**
 * @return {undefined}
 */
DatePicker.prototype.buildTagBox = function() {
    var classes = 'dp_wrapper ' + this.uniqueClass,
        config  = this.config;
    
    if ( 'absolute' == config.position ) {
        classes += (' ' + config.position + ' ' + config.where);
    }
    
    var div = '<div class="' + classes + '"><div class="dp_tagBox"><input type="text"></div></div>';
    
    return div;
}

/**
 * @return {undefined}
 */
DatePicker.prototype.hideInput = function() {
    this.input.hide();
}

/**
 * @param {string} month
 * 
 * return {Array} days
 */
DatePicker.prototype.getMonth = function(month) {
    return 'month';
}

/**
 * return {Array}
 */
DatePicker.prototype.getYearList = function() {
    var that  = this,
        years = [];
    
    for ( var i=that.config.year.start; i<that.config.year.end + 1; i++) {
        years.push(i);
    }
    
    return years;
}

var datePicker = new DatePicker($('#datePicker'));
datePicker.init();