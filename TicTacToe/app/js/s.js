/**
 * Helper functions to minimize absence of jQuery
 * jQuery like selectors and each iterators
 */
_ttt.S = ( function (s) {

    s.logStatus = false;

    /**
     * Html selector for one element
     * @param {[string]} selector [css based selector]
     * @return {[object]} selected html object
     */
    s.elem = function(selector) {
        return document.querySelector(selector);
    };

    s.Id = function(id) {
        return document.getElementById(id);
    };

    /**
     * Select every element based on selector
     * Add support to each iterating over items
     * @param  {[string]} selector [css based selector]
     * @return {[object array]} [Array of html objects]
     * @example
     *  SS('[data-column="1"]').each(function() {
     *       this.className += ' win';
     *  });
     */
    s.S = function(selector) {
        var items = {},
            results = [],
            length = 0,
            i = 0;

        // this doesn't work on IE 8- and Blackberry Browser
        results = Array.prototype.slice.call(document.querySelectorAll(selector));

        length = results.length;

        // add the results to the items object
        for ( ; i < length; ) {
            items[i] = results[i];
            i++;
        }

        // add some additional properties to this items object to 
        // make it look like an array
        items.length = length;
        items.splice = [].splice();

        // add an 'each' method to the items
        items.each = function(callback) {
            var i = 0;
            for ( ; i < length; ) {
                callback.call(items[i]);
                i++;
            }
        };

        return items;
    };


    /**
     * format string ("Hi {0}, you are {1}!", "Foo", 100) --> Hi Foo you are 100        
     * @return {[string]} [formated string]
     * @example console.log(S.format("Hi {0}, you are {1}!", "Foo", 100))
     */
    s.format = function () {
        var s = arguments[0];
        for (var i = 0; i < arguments.length - 1; i++) {
            s = s.replace("{" + i + "}", arguments[i + 1]);
        }
        return s;
    };

    /*
    * foreach loop for the arrays
    */
    s.each = function(arr, callback) {
        var i = 0;
            length = arr.length;
        for ( ; i < length; i++ ) {
            if( callback(arr[i], i) === false) {
                break;
            }
        }
    };

    /**
     * Iterate specific number of times
     * @param  {Intager}   n  number of times to iterate
     * @param  {Function} callback function that we will call
     */
    s.iterate = function(length, callback) {
        for (var i = 0 ; i < length; i++ ) {
            if( callback(i) === false) {
                break;
            }
        }
    };

    /**
     * Log the messages to console.log in case logStatus is set to true
     * @param  {string, object} log thing to log
     */
    s.log = function () {
        if(s.logStatus) {
            for (var i = 0; i < arguments.length; i++) {
                console.log(arguments[i]);
            }
        }
    };

    /**
     * Change properties values from object 1 with same properties from obj2 (equivalent to left join in sql)
     * @param  {Object} obj1 object in which we want to change properties
     * @param  {Object} obj2 properties that we will take
    */
    s.merge = function (obj1, obj2) {
        if (obj1 == null || obj2 == null) {
            return obj1;
        }

        for (var key in obj2) {
            if (obj2.hasOwnProperty(key)) {
                obj1[key] = obj2[key];
            }
        }
        
        return obj1;
    };

    return s;

}(_ttt.S || {}));
