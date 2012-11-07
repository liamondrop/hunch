// Proof of concept / WIP.
// Adapted from Bootstrap/Typeahead

(function ($) {
  "use strict";

  // basic constructor definition
  var Hunch = function (element, source) {
    this.options = {
      items: 8,
      menu: '<ul class="hunch-dd"></ul>',
      item: '<li><a href="#"></a></li>',
      minLength: 1
    };

    this.$element = $(element);
    this.$menu = $(this.options.menu).appendTo('body');
    this.source = source;
    this.shown = false;
    this.listen();
  };

  Hunch.prototype = {

    select: function () {
      var val = this.$menu.find('.active').attr('data-value');
      this.$element.val(this.updater(val))
        .change();
      return this.conceal();
    },

    updater: function (item) {
      return item;
    },

    reveal: function () {
      var pos = $.extend({}, this.$element.offset(), {
        height: this.$element[0].offsetHeight
      });

      this.$menu.css({
        top: pos.top + pos.height,
        left: pos.left
      });

      this.$menu.show();
      this.shown = true;
      return this;
    },

    conceal: function () {
      this.$menu.hide();
      this.shown = false;
      return this;
    },

    lookup: function () {
      var items = this.source;

      this.query = this.$element.val();

      if (!this.query || this.query.length < this.options.minLength) {
        return this.shown ? this.conceal() : this;
      }

      return items ? this.process(items) : this;
    },

    process: function (items) {
      var that = this;

      items = $.grep(items, function (item) {
        return that.matcher(item);
      });

      items = this.sorter(items);

      if (!items.length) {
        return this.shown ? this.conceal() : this;
      }

      return this.render(items.slice(0, this.options.items)).reveal();
    },

    matcher: function (item) {
      return~item.toLowerCase().indexOf(this.query.toLowerCase());
    },

    sorter: function (items) {
      var beginswith = [],
        caseSensitive = [],
        caseInsensitive = [],
        item;

      while (true) {
        item = items.shift();
        if (!item) {
          break;
        }
        if (!item.toLowerCase().indexOf(this.query.toLowerCase())) {
          beginswith.push(item);
        } else if (~item.indexOf(this.query)) {
          caseSensitive.push(item);
        } else {
          caseInsensitive.push(item);
        }
      }

      return beginswith.concat(caseSensitive, caseInsensitive);
    },

    highlighter: function (item) {
      var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
      return item.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
        return '<strong>' + match + '</strong>';
      });
    },

    render: function (items) {
      var that = this;

      items = $(items).map(function (i, item) {
        i = $(that.options.item).attr('data-value', item);
        i.find('a').html(that.highlighter(item));
        return i[0];
      });

      items.first().addClass('active');
      this.$menu.html(items);
      return this;
    },

    next: function () {
      var active = this.$menu.find('.active').removeClass('active'),
        next = active.next();

      if (!next.length) {
        next = $(this.$menu.find('li')[0]);
      }

      next.addClass('active');
    },

    prev: function (event) {
      var active = this.$menu.find('.active').removeClass('active'),
        prev = active.prev();

      if (!prev.length) {
        prev = this.$menu.find('li').last();
      }

      prev.addClass('active');
    },

    listen: function () {
      this.$element.on('blur', $.proxy(this.blur, this))
        .on('keypress', $.proxy(this.keypress, this))
        .on('keyup', $.proxy(this.keyup, this));

      if (this.eventSupported('keydown')) {
        this.$element.on('keydown', $.proxy(this.keydown, this));
      }

      this.$menu.on('click', $.proxy(this.click, this))
        .on('mouseenter', 'li', $.proxy(this.mouseenter, this));
    },

    eventSupported: function (eventName) {
      var isSupported = this.$element[eventName] !== undefined;
      if (!isSupported) {
        this.$element.setAttribute(eventName, 'return;');
        isSupported = typeof this.$element[eventName] === 'function';
      }
      return isSupported;
    },

    move: function (e) {
      if (!this.shown) {
        return;
      }

      switch (e.keyCode) {
        case 9:
          // tab
        case 13:
          // enter
        case 27:
          // escape
          e.preventDefault();
          break;
        case 38:
          // up arrow
          e.preventDefault();
          this.prev();
          break;
        case 40:
          // down arrow
          e.preventDefault();
          this.next();
          break;
      }

      e.stopPropagation();
    },

    keydown: function (e) {
      this.suppressKeyPressRepeat = !~$.inArray(e.keyCode, [40, 38, 9, 13, 27]);
      this.move(e);
    },

    keypress: function (e) {
      if (this.suppressKeyPressRepeat) {
        return;
      }
      this.move(e);
    },

    keyup: function (e) {
      switch (e.keyCode) {
        case 40:
          // down arrow
        case 38:
          // up arrow
        case 16:
          // shift
        case 17:
          // ctrl
        case 18:
          // alt
          break;
        case 9:
          // tab
        case 13:
          // enter
          if (!this.shown) {
            return;
          }
          this.select();
          break;
        case 27:
          // escape
          if (!this.shown) {
            return;
          }
          this.conceal();
          break;
        default:
          this.lookup();
      }

      e.stopPropagation();
      e.preventDefault();
    },

    blur: function () {
      var that = this;
      window.setTimeout(function () {
        that.conceal();
      }, 150);
    },

    click: function (e) {
      e.stopPropagation();
      e.preventDefault();
      this.select();
    },

    mouseenter: function (e) {
      this.$menu.find('.active').removeClass('active');
      $(e.currentTarget).addClass('active');
    }

  };

  // jQuery plugin definition
  $.fn.hunch = function (src) {
    return this.each(function () {
      var $this = $(this),
        hunch = $this.data('hunch');
      if (!hunch) {
        $this.data('hunch', new Hunch(this, src));
      }
    });
  };

}(window.jQuery));