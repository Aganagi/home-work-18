!(function (e, a) {
  "function" == typeof define && define.amd
    ? define(["jquery"], a)
    : "object" == typeof module && module.exports
    ? a(require("jquery"))
    : a(e.jQuery);
})(this, function (n) {
  (n.fn.appear = function (r, e) {
    var l = n.extend({ data: void 0, one: !0, accX: 0, accY: 0 }, e);
    return this.each(function () {
      var u = n(this);
      if (((u.appeared = !1), r)) {
        var d = n(window),
          a = function () {
            if (u.is(":visible")) {
              var e = d.scrollLeft(),
                a = d.scrollTop(),
                r = u.offset(),
                n = r.left,
                p = r.top,
                t = l.accX,
                i = l.accY,
                c = u.height(),
                o = d.height(),
                f = u.width(),
                s = d.width();
              a <= p + c + i &&
              p <= a + o + i &&
              e <= n + f + t &&
              n <= e + s + t
                ? u.appeared || u.trigger("appear", l.data)
                : (u.appeared = !1);
            } else u.appeared = !1;
          },
          e = function () {
            if (((u.appeared = !0), l.one)) {
              d.unbind("scroll", a);
              var e = n.inArray(a, n.fn.appear.checks);
              0 <= e && n.fn.appear.checks.splice(e, 1);
            }
            r.apply(this, arguments);
          };
        l.one ? u.one("appear", l.data, e) : u.bind("appear", l.data, e),
          d.scroll(a),
          n.fn.appear.checks.push(a),
          a();
      } else u.trigger("appear", l.data);
    });
  }),
    n.extend(n.fn.appear, {
      checks: [],
      timeout: null,
      checkAll: function () {
        var e = n.fn.appear.checks.length;
        if (0 < e) for (; e--; ) n.fn.appear.checks[e]();
      },
      run: function () {
        n.fn.appear.timeout && clearTimeout(n.fn.appear.timeout),
          (n.fn.appear.timeout = setTimeout(n.fn.appear.checkAll, 20));
      },
    }),
    n.each(
      [
        "append",
        "prepend",
        "after",
        "before",
        "attr",
        "removeAttr",
        "addClass",
        "removeClass",
        "toggleClass",
        "remove",
        "css",
        "show",
        "hide",
      ],
      function (e, a) {
        var r = n.fn[a];
        r &&
          (n.fn[a] = function () {
            var e = r.apply(this, arguments);
            return n.fn.appear.run(), e;
          });
      }
    );
});
