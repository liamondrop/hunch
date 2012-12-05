(function ($) {
    'use strict';

    var $target = $('#search-textbox'),
        $dataElements = $('.artist'),
        data = [], // store autocomplete data here
        js = 'https://raw.github.com/liamondrop/hunch/master/hunch.js',
        css = ['.hunch-dd{position:absolute;top:100%;left:0;z-index:1000;display:none;float:left;min-width:260px;padding:5px 0;margin:2px 0 0;list-style:none;background-color:#fff;border:1px solid rgba(0,0,0,0.2)}',
            '.hunch-dd a{display:block;padding:3px 20px;clear:both;font-weight:normal;line-height:20px;color:#333;white-space:nowrap}',
            '.hunch-dd .active>a,.hunch-dd li>a:hover{color:#fff;text-decoration:none;background-color:#333;outline:0}'].join('');

    function addToHead(type, src) {
        var tag = type === 'css' ? 'style' : 'script',
            t = document.createElement(tag),
            h = document.getElementsByTagName('head')[0];
        if (type === 'js') {
            t.src = src;
        }
        if (type === 'css') {
            t.appendChild(document.createTextNode(src));
        }
        h.appendChild(t);
    }

    // add dropdown styles to the head
    addToHead('css', css);

    // add autocomplete src to the head
    addToHead('js', js);

    // grab all artist names to store in autocomplete
    $dataElements.each(function () {
        var d = $(this).text().trim();
        data.push(d);
    });

    // wait until hunch script loads to invoke
    window.setTimeout(function async() {
        if (typeof $target.hunch === 'function') {
            $target.hunch(data);
        } else {
            window.setTimeout(async, 50);
        }
    }, 50);

}(window.jQuery));
