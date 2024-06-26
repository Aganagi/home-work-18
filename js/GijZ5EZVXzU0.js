!(function () {
  "use strict";
  function t(o) {
    if (!o) throw new Error("No options passed to Waypoint constructor");
    if (!o.element)
      throw new Error("No element option passed to Waypoint constructor");
    if (!o.handler)
      throw new Error("No handler option passed to Waypoint constructor");
    (this.key = "waypoint-" + e),
      (this.options = t.Adapter.extend({}, t.defaults, o)),
      (this.element = this.options.element),
      (this.adapter = new t.Adapter(this.element)),
      (this.callback = o.handler),
      (this.axis = this.options.horizontal ? "horizontal" : "vertical"),
      (this.enabled = this.options.enabled),
      (this.triggerPoint = null),
      (this.group = t.Group.findOrCreate({
        name: this.options.group,
        axis: this.axis,
      })),
      (this.context = t.Context.findOrCreateByElement(this.options.context)),
      t.offsetAliases[this.options.offset] &&
        (this.options.offset = t.offsetAliases[this.options.offset]),
      this.group.add(this),
      this.context.add(this),
      (i[this.key] = this),
      (e += 1);
  }
  var e = 0,
    i = {};
  (t.prototype.queueTrigger = function (t) {
    this.group.queueTrigger(this, t);
  }),
    (t.prototype.trigger = function (t) {
      this.enabled && this.callback && this.callback.apply(this, t);
    }),
    (t.prototype.destroy = function () {
      this.context.remove(this), this.group.remove(this), delete i[this.key];
    }),
    (t.prototype.disable = function () {
      return (this.enabled = !1), this;
    }),
    (t.prototype.enable = function () {
      return this.context.refresh(), (this.enabled = !0), this;
    }),
    (t.prototype.next = function () {
      return this.group.next(this);
    }),
    (t.prototype.previous = function () {
      return this.group.previous(this);
    }),
    (t.invokeAll = function (t) {
      var e = [];
      for (var o in i) e.push(i[o]);
      for (var s = 0, n = e.length; n > s; s++) e[s][t]();
    }),
    (t.destroyAll = function () {
      t.invokeAll("destroy");
    }),
    (t.disableAll = function () {
      t.invokeAll("disable");
    }),
    (t.enableAll = function () {
      for (var e in (t.Context.refreshAll(), i)) i[e].enabled = !0;
      return this;
    }),
    (t.refreshAll = function () {
      t.Context.refreshAll();
    }),
    (t.viewportHeight = function () {
      return window.innerHeight || document.documentElement.clientHeight;
    }),
    (t.viewportWidth = function () {
      return document.documentElement.clientWidth;
    }),
    (t.adapters = []),
    (t.defaults = {
      context: window,
      continuous: !0,
      enabled: !0,
      group: "default",
      horizontal: !1,
      offset: 0,
    }),
    (t.offsetAliases = {
      "bottom-in-view": function () {
        return this.context.innerHeight() - this.adapter.outerHeight();
      },
      "right-in-view": function () {
        return this.context.innerWidth() - this.adapter.outerWidth();
      },
    }),
    (window.Waypoint = t);
})(),
  (function () {
    "use strict";
    function t(t) {
      window.setTimeout(t, 1e3 / 60);
    }
    function e(t) {
      (this.element = t),
        (this.Adapter = s.Adapter),
        (this.adapter = new this.Adapter(t)),
        (this.key = "waypoint-context-" + i),
        (this.didScroll = !1),
        (this.didResize = !1),
        (this.oldScroll = {
          x: this.adapter.scrollLeft(),
          y: this.adapter.scrollTop(),
        }),
        (this.waypoints = { vertical: {}, horizontal: {} }),
        (t.waypointContextKey = this.key),
        (o[t.waypointContextKey] = this),
        (i += 1),
        s.windowContext ||
          ((s.windowContext = !0), (s.windowContext = new e(window))),
        this.createThrottledScrollHandler(),
        this.createThrottledResizeHandler();
    }
    var i = 0,
      o = {},
      s = window.Waypoint,
      n = window.onload;
    (e.prototype.add = function (t) {
      var e = t.options.horizontal ? "horizontal" : "vertical";
      (this.waypoints[e][t.key] = t), this.refresh();
    }),
      (e.prototype.checkEmpty = function () {
        var t = this.Adapter.isEmptyObject(this.waypoints.horizontal),
          e = this.Adapter.isEmptyObject(this.waypoints.vertical),
          i = this.element == this.element.window;
        t && e && !i && (this.adapter.off(".waypoints"), delete o[this.key]);
      }),
      (e.prototype.createThrottledResizeHandler = function () {
        function t() {
          e.handleResize(), (e.didResize = !1);
        }
        var e = this;
        this.adapter.on("resize.waypoints", function () {
          e.didResize || ((e.didResize = !0), s.requestAnimationFrame(t));
        });
      }),
      (e.prototype.createThrottledScrollHandler = function () {
        function t() {
          e.handleScroll(), (e.didScroll = !1);
        }
        var e = this;
        this.adapter.on("scroll.waypoints", function () {
          (!e.didScroll || s.isTouch) &&
            ((e.didScroll = !0), s.requestAnimationFrame(t));
        });
      }),
      (e.prototype.handleResize = function () {
        s.Context.refreshAll();
      }),
      (e.prototype.handleScroll = function () {
        var t = {},
          e = {
            horizontal: {
              newScroll: this.adapter.scrollLeft(),
              oldScroll: this.oldScroll.x,
              forward: "right",
              backward: "left",
            },
            vertical: {
              newScroll: this.adapter.scrollTop(),
              oldScroll: this.oldScroll.y,
              forward: "down",
              backward: "up",
            },
          };
        for (var i in e) {
          var o = e[i],
            s = o.newScroll > o.oldScroll ? o.forward : o.backward;
          for (var n in this.waypoints[i]) {
            var r = this.waypoints[i][n];
            if (null !== r.triggerPoint) {
              var a = o.oldScroll < r.triggerPoint,
                h = o.newScroll >= r.triggerPoint;
              ((a && h) || (!a && !h)) &&
                (r.queueTrigger(s), (t[r.group.id] = r.group));
            }
          }
        }
        for (var l in t) t[l].flushTriggers();
        this.oldScroll = { x: e.horizontal.newScroll, y: e.vertical.newScroll };
      }),
      (e.prototype.innerHeight = function () {
        return this.element == this.element.window
          ? s.viewportHeight()
          : this.adapter.innerHeight();
      }),
      (e.prototype.remove = function (t) {
        delete this.waypoints[t.axis][t.key], this.checkEmpty();
      }),
      (e.prototype.innerWidth = function () {
        return this.element == this.element.window
          ? s.viewportWidth()
          : this.adapter.innerWidth();
      }),
      (e.prototype.destroy = function () {
        var t = [];
        for (var e in this.waypoints)
          for (var i in this.waypoints[e]) t.push(this.waypoints[e][i]);
        for (var o = 0, s = t.length; s > o; o++) t[o].destroy();
      }),
      (e.prototype.refresh = function () {
        var t,
          e = this.element == this.element.window,
          i = e ? void 0 : this.adapter.offset(),
          o = {};
        for (var n in (this.handleScroll(),
        (t = {
          horizontal: {
            contextOffset: e ? 0 : i.left,
            contextScroll: e ? 0 : this.oldScroll.x,
            contextDimension: this.innerWidth(),
            oldScroll: this.oldScroll.x,
            forward: "right",
            backward: "left",
            offsetProp: "left",
          },
          vertical: {
            contextOffset: e ? 0 : i.top,
            contextScroll: e ? 0 : this.oldScroll.y,
            contextDimension: this.innerHeight(),
            oldScroll: this.oldScroll.y,
            forward: "down",
            backward: "up",
            offsetProp: "top",
          },
        }))) {
          var r = t[n];
          for (var a in this.waypoints[n]) {
            var h,
              l,
              p,
              c,
              d = this.waypoints[n][a],
              u = d.options.offset,
              m = d.triggerPoint,
              f = 0,
              g = null == m;
            d.element !== d.element.window &&
              (f = d.adapter.offset()[r.offsetProp]),
              "function" == typeof u
                ? (u = u.apply(d))
                : "string" == typeof u &&
                  ((u = parseFloat(u)),
                  d.options.offset.indexOf("%") > -1 &&
                    (u = Math.ceil((r.contextDimension * u) / 100))),
              (h = r.contextScroll - r.contextOffset),
              (d.triggerPoint = Math.floor(f + h - u)),
              (l = m < r.oldScroll),
              (p = d.triggerPoint >= r.oldScroll),
              (c = !l && !p),
              !g && l && p
                ? (d.queueTrigger(r.backward), (o[d.group.id] = d.group))
                : ((!g && c) || (g && r.oldScroll >= d.triggerPoint)) &&
                  (d.queueTrigger(r.forward), (o[d.group.id] = d.group));
          }
        }
        return (
          s.requestAnimationFrame(function () {
            for (var t in o) o[t].flushTriggers();
          }),
          this
        );
      }),
      (e.findOrCreateByElement = function (t) {
        return e.findByElement(t) || new e(t);
      }),
      (e.refreshAll = function () {
        for (var t in o) o[t].refresh();
      }),
      (e.findByElement = function (t) {
        return o[t.waypointContextKey];
      }),
      (window.onload = function () {
        n && n(), e.refreshAll();
      }),
      (s.requestAnimationFrame = function (e) {
        (
          window.requestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          t
        ).call(window, e);
      }),
      (s.Context = e);
  })(),
  (function () {
    "use strict";
    function t(t, e) {
      return t.triggerPoint - e.triggerPoint;
    }
    function e(t, e) {
      return e.triggerPoint - t.triggerPoint;
    }
    function i(t) {
      (this.name = t.name),
        (this.axis = t.axis),
        (this.id = this.name + "-" + this.axis),
        (this.waypoints = []),
        this.clearTriggerQueues(),
        (o[this.axis][this.name] = this);
    }
    var o = { vertical: {}, horizontal: {} },
      s = window.Waypoint;
    (i.prototype.add = function (t) {
      this.waypoints.push(t);
    }),
      (i.prototype.clearTriggerQueues = function () {
        this.triggerQueues = { up: [], down: [], left: [], right: [] };
      }),
      (i.prototype.flushTriggers = function () {
        for (var i in this.triggerQueues) {
          var o = this.triggerQueues[i],
            s = "up" === i || "left" === i;
          o.sort(s ? e : t);
          for (var n = 0, r = o.length; r > n; n += 1) {
            var a = o[n];
            (a.options.continuous || n === o.length - 1) && a.trigger([i]);
          }
        }
        this.clearTriggerQueues();
      }),
      (i.prototype.next = function (e) {
        this.waypoints.sort(t);
        var i = s.Adapter.inArray(e, this.waypoints);
        return i === this.waypoints.length - 1 ? null : this.waypoints[i + 1];
      }),
      (i.prototype.previous = function (e) {
        this.waypoints.sort(t);
        var i = s.Adapter.inArray(e, this.waypoints);
        return i ? this.waypoints[i - 1] : null;
      }),
      (i.prototype.queueTrigger = function (t, e) {
        this.triggerQueues[e].push(t);
      }),
      (i.prototype.remove = function (t) {
        var e = s.Adapter.inArray(t, this.waypoints);
        e > -1 && this.waypoints.splice(e, 1);
      }),
      (i.prototype.first = function () {
        return this.waypoints[0];
      }),
      (i.prototype.last = function () {
        return this.waypoints[this.waypoints.length - 1];
      }),
      (i.findOrCreate = function (t) {
        return o[t.axis][t.name] || new i(t);
      }),
      (s.Group = i);
  })(),
  (function () {
    "use strict";
    function t(t) {
      this.$element = e(t);
    }
    var e = window.jQuery,
      i = window.Waypoint;
    e.each(
      [
        "innerHeight",
        "innerWidth",
        "off",
        "offset",
        "on",
        "outerHeight",
        "outerWidth",
        "scrollLeft",
        "scrollTop",
      ],
      function (e, i) {
        t.prototype[i] = function () {
          var t = Array.prototype.slice.call(arguments);
          return this.$element[i].apply(this.$element, t);
        };
      }
    ),
      e.each(["extend", "inArray", "isEmptyObject"], function (i, o) {
        t[o] = e[o];
      }),
      i.adapters.push({ name: "jquery", Adapter: t }),
      (i.Adapter = t);
  })(),
  (function () {
    "use strict";
    function t(t) {
      return function () {
        var i = [],
          o = arguments[0];
        return (
          t.isFunction(arguments[0]) &&
            ((o = t.extend({}, arguments[1])).handler = arguments[0]),
          this.each(function () {
            var s = t.extend({}, o, { element: this });
            "string" == typeof s.context &&
              (s.context = t(this).closest(s.context)[0]),
              i.push(new e(s));
          }),
          i
        );
      };
    }
    var e = window.Waypoint;
    window.jQuery && (window.jQuery.fn.waypoint = t(window.jQuery)),
      window.Zepto && (window.Zepto.fn.waypoint = t(window.Zepto));
  })(),
  (function (t) {
    t.fn.hoverIntent = function (e, i, o) {
      var s,
        n,
        r,
        a,
        h = { interval: 100, sensitivity: 7, timeout: 0 };
      h =
        "object" == typeof e
          ? t.extend(h, e)
          : t.isFunction(i)
          ? t.extend(h, { over: e, out: i, selector: o })
          : t.extend(h, { over: e, out: e, selector: i });
      var l = function (t) {
          (s = t.pageX), (n = t.pageY);
        },
        p = function (e, i) {
          if (
            ((i.hoverIntent_t = clearTimeout(i.hoverIntent_t)),
            Math.abs(r - s) + Math.abs(a - n) < h.sensitivity)
          )
            return (
              t(i).off("mousemove.hoverIntent", l),
              (i.hoverIntent_s = 1),
              h.over.apply(i, [e])
            );
          (r = s),
            (a = n),
            (i.hoverIntent_t = setTimeout(function () {
              p(e, i);
            }, h.interval));
        },
        c = function (e) {
          var i = jQuery.extend({}, e),
            o = this;
          o.hoverIntent_t && (o.hoverIntent_t = clearTimeout(o.hoverIntent_t)),
            "mouseenter" == e.type
              ? ((r = i.pageX),
                (a = i.pageY),
                t(o).on("mousemove.hoverIntent", l),
                1 != o.hoverIntent_s &&
                  (o.hoverIntent_t = setTimeout(function () {
                    p(i, o);
                  }, h.interval)))
              : (t(o).off("mousemove.hoverIntent", l),
                1 == o.hoverIntent_s &&
                  (o.hoverIntent_t = setTimeout(function () {
                    !(function (t, e) {
                      (e.hoverIntent_t = clearTimeout(e.hoverIntent_t)),
                        (e.hoverIntent_s = 0),
                        h.out.apply(e, [t]);
                    })(i, o);
                  }, h.timeout)));
        };
      return this.on(
        { "mouseenter.hoverIntent": c, "mouseleave.hoverIntent": c },
        h.selector
      );
    };
  })(jQuery),
  (function (t) {
    "function" == typeof define && define.amd
      ? define(["jquery"], t)
      : "object" == typeof module && module.exports
      ? (module.exports = function (e, i) {
          return (
            void 0 === i &&
              (i =
                "undefined" != typeof window
                  ? require("jquery")
                  : require("jquery")(e)),
            t(i),
            i
          );
        })
      : t(jQuery);
  })(function (t) {
    "use strict";
    var e = 0;
    t.fn.TouchSpin = function (i) {
      var o = {
          min: 0,
          max: 100,
          initval: "",
          replacementval: "",
          step: 1,
          decimals: 0,
          stepinterval: 100,
          forcestepdivisibility: "round",
          stepintervaldelay: 500,
          verticalbuttons: !1,
          verticalup: "+",
          verticaldown: "-",
          verticalupclass: "",
          verticaldownclass: "",
          prefix: "",
          postfix: "",
          prefix_extraclass: "",
          postfix_extraclass: "",
          booster: !0,
          boostat: 10,
          maxboostedstep: !1,
          mousewheel: !0,
          buttondown_class: "btn btn-primary",
          buttonup_class: "btn btn-primary",
          buttondown_txt: "-",
          buttonup_txt: "+",
          callback_before_calculation: function (t) {
            return t;
          },
          callback_after_calculation: function (t) {
            return t;
          },
        },
        s = {
          min: "min",
          max: "max",
          initval: "init-val",
          replacementval: "replacement-val",
          step: "step",
          decimals: "decimals",
          stepinterval: "step-interval",
          verticalbuttons: "vertical-buttons",
          verticalupclass: "vertical-up-class",
          verticaldownclass: "vertical-down-class",
          forcestepdivisibility: "force-step-divisibility",
          stepintervaldelay: "step-interval-delay",
          prefix: "prefix",
          postfix: "postfix",
          prefix_extraclass: "prefix-extra-class",
          postfix_extraclass: "postfix-extra-class",
          booster: "booster",
          boostat: "boostat",
          maxboostedstep: "max-boosted-step",
          mousewheel: "mouse-wheel",
          buttondown_class: "button-down-class",
          buttonup_class: "button-up-class",
          buttondown_txt: "button-down-txt",
          buttonup_txt: "button-up-txt",
        };
      return this.each(function () {
        var n,
          r,
          a,
          h,
          l,
          p,
          c,
          d,
          u,
          m,
          f = t(this),
          g = f.data(),
          w = 0,
          v = !1;
        function y() {
          "" === n.prefix && (r = l.prefix.detach()),
            "" === n.postfix && (a = l.postfix.detach());
        }
        function z() {
          var t, e, i;
          "" !== (t = n.callback_before_calculation(f.val()))
            ? (0 < n.decimals && "." === t) ||
              ((e = parseFloat(t)),
              isNaN(e) && (e = "" !== n.replacementval ? n.replacementval : 0),
              (i = e).toString() !== t && (i = e),
              null !== n.min && e < n.min && (i = n.min),
              null !== n.max && e > n.max && (i = n.max),
              (i = (function (t) {
                switch (n.forcestepdivisibility) {
                  case "round":
                    return (Math.round(t / n.step) * n.step).toFixed(
                      n.decimals
                    );
                  case "floor":
                    return (Math.floor(t / n.step) * n.step).toFixed(
                      n.decimals
                    );
                  case "ceil":
                    return (Math.ceil(t / n.step) * n.step).toFixed(n.decimals);
                  default:
                    return t;
                }
              })(i)),
              Number(t).toString() !== i.toString() &&
                (f.val(i), f.trigger("change")))
            : "" !== n.replacementval &&
              (f.val(n.replacementval), f.trigger("change"));
        }
        function x() {
          if (n.booster) {
            var t = Math.pow(2, Math.floor(w / n.boostat)) * n.step;
            return (
              n.maxboostedstep &&
                t > n.maxboostedstep &&
                ((t = n.maxboostedstep), (p = Math.round(p / t) * t)),
              Math.max(n.step, t)
            );
          }
          return n.step;
        }
        function b() {
          z(),
            (p = parseFloat(n.callback_before_calculation(l.input.val()))),
            isNaN(p) && (p = 0);
          var t = p,
            e = x();
          (p += e),
            null !== n.max &&
              p > n.max &&
              ((p = n.max), f.trigger("touchspin.on.max"), W()),
            l.input.val(
              n.callback_after_calculation(Number(p).toFixed(n.decimals))
            ),
            t !== p && f.trigger("change");
        }
        function _() {
          z(),
            (p = parseFloat(n.callback_before_calculation(l.input.val()))),
            isNaN(p) && (p = 0);
          var t = p,
            e = x();
          (p -= e),
            null !== n.min &&
              p < n.min &&
              ((p = n.min), f.trigger("touchspin.on.min"), W()),
            l.input.val(
              n.callback_after_calculation(Number(p).toFixed(n.decimals))
            ),
            t !== p && f.trigger("change");
        }
        function C() {
          W(),
            (w = 0),
            (v = "down"),
            f.trigger("touchspin.on.startspin"),
            f.trigger("touchspin.on.startdownspin"),
            (u = setTimeout(function () {
              c = setInterval(function () {
                w++, _();
              }, n.stepinterval);
            }, n.stepintervaldelay));
        }
        function T() {
          W(),
            (w = 0),
            (v = "up"),
            f.trigger("touchspin.on.startspin"),
            f.trigger("touchspin.on.startupspin"),
            (m = setTimeout(function () {
              d = setInterval(function () {
                w++, b();
              }, n.stepinterval);
            }, n.stepintervaldelay));
        }
        function W() {
          switch (
            (clearTimeout(u),
            clearTimeout(m),
            clearInterval(c),
            clearInterval(d),
            v)
          ) {
            case "up":
              f.trigger("touchspin.on.stopupspin"),
                f.trigger("touchspin.on.stopspin");
              break;
            case "down":
              f.trigger("touchspin.on.stopdownspin"),
                f.trigger("touchspin.on.stopspin");
          }
          (w = 0), (v = !1);
        }
        !(function () {
          var p;
          f.data("alreadyinitialized") ||
            (f.data("alreadyinitialized", !0),
            (e += 1),
            f.data("spinnerid", e),
            f.is("input")
              ? ("" !==
                  (n = t.extend(
                    {},
                    o,
                    g,
                    ((p = {}),
                    t.each(s, function (t, e) {
                      var i = "bts-" + e;
                      f.is("[data-" + i + "]") && (p[t] = f.data(i));
                    }),
                    p),
                    i
                  )).initval &&
                  "" === f.val() &&
                  f.val(n.initval),
                z(),
                (function () {
                  var e = f.val(),
                    i = f.parent();
                  "" !== e &&
                    (e = n.callback_after_calculation(
                      Number(e).toFixed(n.decimals)
                    )),
                    f.data("initvalue", e).val(e),
                    f.addClass("form-control"),
                    i.hasClass("input-group")
                      ? (function (e) {
                          e.addClass("bootstrap-touchspin");
                          var i,
                            o,
                            s = f.prev(),
                            r = f.next(),
                            a =
                              '<span class="input-group-addon input-group-prepend bootstrap-touchspin-prefix input-group-prepend bootstrap-touchspin-injected"><span class="input-group-text">' +
                              n.prefix +
                              "</span></span>",
                            l =
                              '<span class="input-group-addon input-group-append bootstrap-touchspin-postfix input-group-append bootstrap-touchspin-injected"><span class="input-group-text">' +
                              n.postfix +
                              "</span></span>";
                          s.hasClass("input-group-btn") ||
                          s.hasClass("input-group-prepend")
                            ? ((i =
                                '<button class="' +
                                n.buttondown_class +
                                ' bootstrap-touchspin-down bootstrap-touchspin-injected" type="button">' +
                                n.buttondown_txt +
                                "</button>"),
                              s.append(i))
                            : ((i =
                                '<span class="input-group-btn input-group-prepend bootstrap-touchspin-injected"><button class="' +
                                n.buttondown_class +
                                ' bootstrap-touchspin-down" type="button">' +
                                n.buttondown_txt +
                                "</button></span>"),
                              t(i).insertBefore(f)),
                            r.hasClass("input-group-btn") ||
                            r.hasClass("input-group-append")
                              ? ((o =
                                  '<button class="' +
                                  n.buttonup_class +
                                  ' bootstrap-touchspin-up bootstrap-touchspin-injected" type="button">' +
                                  n.buttonup_txt +
                                  "</button>"),
                                r.prepend(o))
                              : ((o =
                                  '<span class="input-group-btn input-group-append bootstrap-touchspin-injected"><button class="' +
                                  n.buttonup_class +
                                  ' bootstrap-touchspin-up" type="button">' +
                                  n.buttonup_txt +
                                  "</button></span>"),
                                t(o).insertAfter(f)),
                            t(a).insertBefore(f),
                            t(l).insertAfter(f),
                            (h = e);
                        })(i)
                      : (function () {
                          var e,
                            i = "";
                          f.hasClass("input-sm") && (i = "input-group-sm"),
                            f.hasClass("input-lg") && (i = "input-group-lg"),
                            (e = n.verticalbuttons
                              ? '<div class="input-group ' +
                                i +
                                ' bootstrap-touchspin bootstrap-touchspin-injected"><span class="input-group-addon input-group-prepend bootstrap-touchspin-prefix"><span class="input-group-text">' +
                                n.prefix +
                                '</span></span><span class="input-group-addon bootstrap-touchspin-postfix input-group-append"><span class="input-group-text">' +
                                n.postfix +
                                '</span></span><span class="input-group-btn-vertical"><button class="' +
                                n.buttondown_class +
                                " bootstrap-touchspin-up " +
                                n.verticalupclass +
                                '" type="button">' +
                                n.verticalup +
                                '</button><button class="' +
                                n.buttonup_class +
                                " bootstrap-touchspin-down " +
                                n.verticaldownclass +
                                '" type="button">' +
                                n.verticaldown +
                                "</button></span></div>"
                              : '<div class="input-group bootstrap-touchspin bootstrap-touchspin-injected"><span class="input-group-btn input-group-prepend"><button class="' +
                                n.buttondown_class +
                                ' bootstrap-touchspin-down" type="button">' +
                                n.buttondown_txt +
                                '</button></span><span class="input-group-addon bootstrap-touchspin-prefix input-group-prepend"><span class="input-group-text">' +
                                n.prefix +
                                '</span></span><span class="input-group-addon bootstrap-touchspin-postfix input-group-append"><span class="input-group-text">' +
                                n.postfix +
                                '</span></span><span class="input-group-btn input-group-append"><button class="' +
                                n.buttonup_class +
                                ' bootstrap-touchspin-up" type="button">' +
                                n.buttonup_txt +
                                "</button></span></div>"),
                            (h = t(e).insertBefore(f)),
                            t(".bootstrap-touchspin-prefix", h).after(f),
                            f.hasClass("input-sm")
                              ? h.addClass("input-group-sm")
                              : f.hasClass("input-lg") &&
                                h.addClass("input-group-lg");
                        })();
                })(),
                (l = {
                  down: t(".bootstrap-touchspin-down", h),
                  up: t(".bootstrap-touchspin-up", h),
                  input: t("input", h),
                  prefix: t(".bootstrap-touchspin-prefix", h).addClass(
                    n.prefix_extraclass
                  ),
                  postfix: t(".bootstrap-touchspin-postfix", h).addClass(
                    n.postfix_extraclass
                  ),
                }),
                y(),
                f.on("keydown.touchspin", function (t) {
                  var e = t.keyCode || t.which;
                  38 === e
                    ? ("up" !== v && (b(), T()), t.preventDefault())
                    : 40 === e &&
                      ("down" !== v && (_(), C()), t.preventDefault());
                }),
                f.on("keyup.touchspin", function (t) {
                  var e = t.keyCode || t.which;
                  (38 === e || 40 === e) && W();
                }),
                f.on("blur.touchspin", function () {
                  z(), f.val(n.callback_after_calculation(f.val()));
                }),
                l.down.on("keydown", function (t) {
                  var e = t.keyCode || t.which;
                  (32 !== e && 13 !== e) ||
                    ("down" !== v && (_(), C()), t.preventDefault());
                }),
                l.down.on("keyup.touchspin", function (t) {
                  var e = t.keyCode || t.which;
                  (32 !== e && 13 !== e) || W();
                }),
                l.up.on("keydown.touchspin", function (t) {
                  var e = t.keyCode || t.which;
                  (32 !== e && 13 !== e) ||
                    ("up" !== v && (b(), T()), t.preventDefault());
                }),
                l.up.on("keyup.touchspin", function (t) {
                  var e = t.keyCode || t.which;
                  (32 !== e && 13 !== e) || W();
                }),
                l.down.on("mousedown.touchspin", function (t) {
                  l.down.off("touchstart.touchspin"),
                    f.is(":disabled") ||
                      (_(), C(), t.preventDefault(), t.stopPropagation());
                }),
                l.down.on("touchstart.touchspin", function (t) {
                  l.down.off("mousedown.touchspin"),
                    f.is(":disabled") ||
                      (_(), C(), t.preventDefault(), t.stopPropagation());
                }),
                l.up.on("mousedown.touchspin", function (t) {
                  l.up.off("touchstart.touchspin"),
                    f.is(":disabled") ||
                      (b(), T(), t.preventDefault(), t.stopPropagation());
                }),
                l.up.on("touchstart.touchspin", function (t) {
                  l.up.off("mousedown.touchspin"),
                    f.is(":disabled") ||
                      (b(), T(), t.preventDefault(), t.stopPropagation());
                }),
                l.up.on(
                  "mouseup.touchspin mouseout.touchspin touchleave.touchspin touchend.touchspin touchcancel.touchspin",
                  function (t) {
                    v && (t.stopPropagation(), W());
                  }
                ),
                l.down.on(
                  "mouseup.touchspin mouseout.touchspin touchleave.touchspin touchend.touchspin touchcancel.touchspin",
                  function (t) {
                    v && (t.stopPropagation(), W());
                  }
                ),
                l.down.on(
                  "mousemove.touchspin touchmove.touchspin",
                  function (t) {
                    v && (t.stopPropagation(), t.preventDefault());
                  }
                ),
                l.up.on(
                  "mousemove.touchspin touchmove.touchspin",
                  function (t) {
                    v && (t.stopPropagation(), t.preventDefault());
                  }
                ),
                f.on(
                  "mousewheel.touchspin DOMMouseScroll.touchspin",
                  function (t) {
                    if (n.mousewheel && f.is(":focus")) {
                      var e =
                        t.originalEvent.wheelDelta ||
                        -t.originalEvent.deltaY ||
                        -t.originalEvent.detail;
                      t.stopPropagation(),
                        t.preventDefault(),
                        e < 0 ? _() : b();
                    }
                  }
                ),
                f.on("touchspin.destroy", function () {
                  var e;
                  (e = f.parent()),
                    W(),
                    f.off(".touchspin"),
                    e.hasClass("bootstrap-touchspin-injected")
                      ? (f.siblings().remove(), f.unwrap())
                      : (t(".bootstrap-touchspin-injected", e).remove(),
                        e.removeClass("bootstrap-touchspin")),
                    f.data("alreadyinitialized", !1);
                }),
                f.on("touchspin.uponce", function () {
                  W(), b();
                }),
                f.on("touchspin.downonce", function () {
                  W(), _();
                }),
                f.on("touchspin.startupspin", function () {
                  T();
                }),
                f.on("touchspin.startdownspin", function () {
                  C();
                }),
                f.on("touchspin.stopspin", function () {
                  W();
                }),
                f.on("touchspin.updatesettings", function (e, i) {
                  !(function (e) {
                    (function (e) {
                      (n = t.extend({}, n, e)),
                        e.postfix &&
                          (0 ===
                            f.parent().find(".bootstrap-touchspin-postfix")
                              .length && a.insertAfter(f),
                          f
                            .parent()
                            .find(
                              ".bootstrap-touchspin-postfix .input-group-text"
                            )
                            .text(e.postfix)),
                        e.prefix &&
                          (0 ===
                            f.parent().find(".bootstrap-touchspin-prefix")
                              .length && r.insertBefore(f),
                          f
                            .parent()
                            .find(
                              ".bootstrap-touchspin-prefix .input-group-text"
                            )
                            .text(e.prefix)),
                        y();
                    })(e),
                      z();
                    var i = l.input.val();
                    "" !== i &&
                      ((i = Number(
                        n.callback_before_calculation(l.input.val())
                      )),
                      l.input.val(
                        n.callback_after_calculation(
                          Number(i).toFixed(n.decimals)
                        )
                      ));
                  })(i);
                }))
              : console.log("Must be an input."));
        })();
      });
    };
  }),
  (function (t) {
    "function" == typeof define && define.amd
      ? define(["jquery"], t)
      : "object" == typeof exports
      ? t(require("jquery"))
      : t(jQuery);
  })(function (t) {
    var e = function (i, o) {
      (this.$element = t(i)),
        (this.options = t.extend({}, e.DEFAULTS, this.dataOptions(), o)),
        this.init();
    };
    (e.DEFAULTS = {
      from: 0,
      to: 0,
      speed: 1e3,
      refreshInterval: 100,
      decimals: 0,
      formatter: function (t, e) {
        return t.toFixed(e.decimals);
      },
      onUpdate: null,
      onComplete: null,
    }),
      (e.prototype.init = function () {
        (this.value = this.options.from),
          (this.loops = Math.ceil(
            this.options.speed / this.options.refreshInterval
          )),
          (this.loopCount = 0),
          (this.increment = (this.options.to - this.options.from) / this.loops);
      }),
      (e.prototype.dataOptions = function () {
        var t = {
            from: this.$element.data("from"),
            to: this.$element.data("to"),
            speed: this.$element.data("speed"),
            refreshInterval: this.$element.data("refresh-interval"),
            decimals: this.$element.data("decimals"),
          },
          e = Object.keys(t);
        for (var i in e) {
          var o = e[i];
          void 0 === t[o] && delete t[o];
        }
        return t;
      }),
      (e.prototype.update = function () {
        (this.value += this.increment),
          this.loopCount++,
          this.render(),
          "function" == typeof this.options.onUpdate &&
            this.options.onUpdate.call(this.$element, this.value),
          this.loopCount >= this.loops &&
            (clearInterval(this.interval),
            (this.value = this.options.to),
            "function" == typeof this.options.onComplete &&
              this.options.onComplete.call(this.$element, this.value));
      }),
      (e.prototype.render = function () {
        var t = this.options.formatter.call(
          this.$element,
          this.value,
          this.options
        );
        this.$element.text(t);
      }),
      (e.prototype.restart = function () {
        this.stop(), this.init(), this.start();
      }),
      (e.prototype.start = function () {
        this.stop(),
          this.render(),
          (this.interval = setInterval(
            this.update.bind(this),
            this.options.refreshInterval
          ));
      }),
      (e.prototype.stop = function () {
        this.interval && clearInterval(this.interval);
      }),
      (e.prototype.toggle = function () {
        this.interval ? this.stop() : this.start();
      }),
      (t.fn.countTo = function (i) {
        return this.each(function () {
          var o = t(this),
            s = o.data("countTo"),
            n = "object" == typeof i ? i : {},
            r = "string" == typeof i ? i : "start";
          (!s || "object" == typeof i) &&
            (s && s.stop(), o.data("countTo", (s = new e(this, n)))),
            s[r].call(s);
        });
      });
  }),
  (function (t) {
    "function" == typeof define && define.amd
      ? define(["jquery"], t)
      : t(
          "object" == typeof exports
            ? require("jquery")
            : window.jQuery || window.Zepto
        );
  })(function (t) {
    var e,
      i,
      o,
      s,
      n,
      r,
      a = "Close",
      h = "BeforeClose",
      l = "MarkupParse",
      p = "Open",
      c = "Change",
      d = ".mfp",
      u = "mfp-ready",
      m = "mfp-removing",
      f = "mfp-prevent-close",
      g = function () {},
      w = !!window.jQuery,
      v = t(window),
      y = function (t, i) {
        e.ev.on("mfp" + t + d, i);
      },
      z = function (e, i, o, s) {
        var n = document.createElement("div");
        return (
          (n.className = "mfp-" + e),
          o && (n.innerHTML = o),
          s ? i && i.appendChild(n) : ((n = t(n)), i && n.appendTo(i)),
          n
        );
      },
      x = function (i, o) {
        e.ev.triggerHandler("mfp" + i, o),
          e.st.callbacks &&
            ((i = i.charAt(0).toLowerCase() + i.slice(1)),
            e.st.callbacks[i] &&
              e.st.callbacks[i].apply(e, t.isArray(o) ? o : [o]));
      },
      b = function (i) {
        return (
          (i === r && e.currTemplate.closeBtn) ||
            ((e.currTemplate.closeBtn = t(
              e.st.closeMarkup.replace("%title%", e.st.tClose)
            )),
            (r = i)),
          e.currTemplate.closeBtn
        );
      },
      _ = function () {
        t.magnificPopup.instance ||
          ((e = new g()).init(), (t.magnificPopup.instance = e));
      };
    (g.prototype = {
      constructor: g,
      init: function () {
        var i = navigator.appVersion;
        (e.isLowIE = e.isIE8 = document.all && !document.addEventListener),
          (e.isAndroid = /android/gi.test(i)),
          (e.isIOS = /iphone|ipad|ipod/gi.test(i)),
          (e.supportsTransition = (function () {
            var t = document.createElement("p").style,
              e = ["ms", "O", "Moz", "Webkit"];
            if (void 0 !== t.transition) return !0;
            for (; e.length; ) if (e.pop() + "Transition" in t) return !0;
            return !1;
          })()),
          (e.probablyMobile =
            e.isAndroid ||
            e.isIOS ||
            /(Opera Mini)|Kindle|webOS|BlackBerry|(Opera Mobi)|(Windows Phone)|IEMobile/i.test(
              navigator.userAgent
            )),
          (o = t(document)),
          (e.popupsCache = {});
      },
      open: function (i) {
        var s;
        if (!1 === i.isObj) {
          (e.items = i.items.toArray()), (e.index = 0);
          var r,
            a = i.items;
          for (s = 0; s < a.length; s++)
            if (((r = a[s]).parsed && (r = r.el[0]), r === i.el[0])) {
              e.index = s;
              break;
            }
        } else
          (e.items = t.isArray(i.items) ? i.items : [i.items]),
            (e.index = i.index || 0);
        if (!e.isOpen) {
          (e.types = []),
            (n = ""),
            i.mainEl && i.mainEl.length ? (e.ev = i.mainEl.eq(0)) : (e.ev = o),
            i.key
              ? (e.popupsCache[i.key] || (e.popupsCache[i.key] = {}),
                (e.currTemplate = e.popupsCache[i.key]))
              : (e.currTemplate = {}),
            (e.st = t.extend(!0, {}, t.magnificPopup.defaults, i)),
            (e.fixedContentPos =
              "auto" === e.st.fixedContentPos
                ? !e.probablyMobile
                : e.st.fixedContentPos),
            e.st.modal &&
              ((e.st.closeOnContentClick = !1),
              (e.st.closeOnBgClick = !1),
              (e.st.showCloseBtn = !1),
              (e.st.enableEscapeKey = !1)),
            e.bgOverlay ||
              ((e.bgOverlay = z("bg").on("click" + d, function () {
                e.close();
              })),
              (e.wrap = z("wrap")
                .attr("tabindex", -1)
                .on("click" + d, function (t) {
                  e._checkIfClose(t.target) && e.close();
                })),
              (e.container = z("container", e.wrap))),
            (e.contentContainer = z("content")),
            e.st.preloader &&
              (e.preloader = z("preloader", e.container, e.st.tLoading));
          var h = t.magnificPopup.modules;
          for (s = 0; s < h.length; s++) {
            var c = h[s];
            (c = c.charAt(0).toUpperCase() + c.slice(1)), e["init" + c].call(e);
          }
          x("BeforeOpen"),
            e.st.showCloseBtn &&
              (e.st.closeBtnInside
                ? (y(l, function (t, e, i, o) {
                    i.close_replaceWith = b(o.type);
                  }),
                  (n += " mfp-close-btn-in"))
                : e.wrap.append(b())),
            e.st.alignTop && (n += " mfp-align-top"),
            e.fixedContentPos
              ? e.wrap.css({
                  overflow: e.st.overflowY,
                  overflowX: "hidden",
                  overflowY: e.st.overflowY,
                })
              : e.wrap.css({ top: v.scrollTop(), position: "absolute" }),
            (!1 === e.st.fixedBgPos ||
              ("auto" === e.st.fixedBgPos && !e.fixedContentPos)) &&
              e.bgOverlay.css({ height: o.height(), position: "absolute" }),
            e.st.enableEscapeKey &&
              o.on("keyup" + d, function (t) {
                27 === t.keyCode && e.close();
              }),
            v.on("resize" + d, function () {
              e.updateSize();
            }),
            e.st.closeOnContentClick || (n += " mfp-auto-cursor"),
            n && e.wrap.addClass(n);
          var m = (e.wH = v.height()),
            f = {};
          if (e.fixedContentPos && e._hasScrollBar(m)) {
            var g = e._getScrollbarSize();
            g && (f.marginRight = g);
          }
          e.fixedContentPos &&
            (e.isIE7
              ? t("body, html").css("overflow", "hidden")
              : (f.overflow = "hidden"));
          var w = e.st.mainClass;
          return (
            e.isIE7 && (w += " mfp-ie7"),
            w && e._addClassToMFP(w),
            e.updateItemHTML(),
            x("BuildControls"),
            t("html").css(f),
            e.bgOverlay
              .add(e.wrap)
              .prependTo(e.st.prependTo || t(document.body)),
            (e._lastFocusedEl = document.activeElement),
            setTimeout(function () {
              e.content
                ? (e._addClassToMFP(u), e._setFocus())
                : e.bgOverlay.addClass(u),
                o.on("focusin" + d, e._onFocusIn);
            }, 16),
            (e.isOpen = !0),
            e.updateSize(m),
            x(p),
            i
          );
        }
        e.updateItemHTML();
      },
      close: function () {
        e.isOpen &&
          (x(h),
          (e.isOpen = !1),
          e.st.removalDelay && !e.isLowIE && e.supportsTransition
            ? (e._addClassToMFP(m),
              setTimeout(function () {
                e._close();
              }, e.st.removalDelay))
            : e._close());
      },
      _close: function () {
        x(a);
        var i = m + " " + u + " ";
        if (
          (e.bgOverlay.detach(),
          e.wrap.detach(),
          e.container.empty(),
          e.st.mainClass && (i += e.st.mainClass + " "),
          e._removeClassFromMFP(i),
          e.fixedContentPos)
        ) {
          var s = { marginRight: "" };
          e.isIE7 ? t("body, html").css("overflow", "") : (s.overflow = ""),
            t("html").css(s);
        }
        o.off("keyup.mfp focusin" + d),
          e.ev.off(d),
          e.wrap.attr("class", "mfp-wrap").removeAttr("style"),
          e.bgOverlay.attr("class", "mfp-bg"),
          e.container.attr("class", "mfp-container"),
          !e.st.showCloseBtn ||
            (e.st.closeBtnInside && !0 !== e.currTemplate[e.currItem.type]) ||
            (e.currTemplate.closeBtn && e.currTemplate.closeBtn.detach()),
          e.st.autoFocusLast && e._lastFocusedEl && t(e._lastFocusedEl).focus(),
          (e.currItem = null),
          (e.content = null),
          (e.currTemplate = null),
          (e.prevHeight = 0),
          x("AfterClose");
      },
      updateSize: function (t) {
        if (e.isIOS) {
          var i = document.documentElement.clientWidth / window.innerWidth,
            o = window.innerHeight * i;
          e.wrap.css("height", o), (e.wH = o);
        } else e.wH = t || v.height();
        e.fixedContentPos || e.wrap.css("height", e.wH), x("Resize");
      },
      updateItemHTML: function () {
        var i = e.items[e.index];
        e.contentContainer.detach(),
          e.content && e.content.detach(),
          i.parsed || (i = e.parseEl(e.index));
        var o = i.type;
        if (
          (x("BeforeChange", [e.currItem ? e.currItem.type : "", o]),
          (e.currItem = i),
          !e.currTemplate[o])
        ) {
          var n = !!e.st[o] && e.st[o].markup;
          x("FirstMarkupParse", n), (e.currTemplate[o] = !n || t(n));
        }
        s && s !== i.type && e.container.removeClass("mfp-" + s + "-holder");
        var r = e["get" + o.charAt(0).toUpperCase() + o.slice(1)](
          i,
          e.currTemplate[o]
        );
        e.appendContent(r, o),
          (i.preloaded = !0),
          x(c, i),
          (s = i.type),
          e.container.prepend(e.contentContainer),
          x("AfterChange");
      },
      appendContent: function (t, i) {
        (e.content = t),
          t
            ? e.st.showCloseBtn &&
              e.st.closeBtnInside &&
              !0 === e.currTemplate[i]
              ? e.content.find(".mfp-close").length || e.content.append(b())
              : (e.content = t)
            : (e.content = ""),
          x("BeforeAppend"),
          e.container.addClass("mfp-" + i + "-holder"),
          e.contentContainer.append(e.content);
      },
      parseEl: function (i) {
        var o,
          s = e.items[i];
        if (
          (s.tagName
            ? (s = { el: t(s) })
            : ((o = s.type), (s = { data: s, src: s.src })),
          s.el)
        ) {
          for (var n = e.types, r = 0; r < n.length; r++)
            if (s.el.hasClass("mfp-" + n[r])) {
              o = n[r];
              break;
            }
          (s.src = s.el.attr("data-mfp-src")),
            s.src || (s.src = s.el.attr("href"));
        }
        return (
          (s.type = o || e.st.type || "inline"),
          (s.index = i),
          (s.parsed = !0),
          (e.items[i] = s),
          x("ElementParse", s),
          e.items[i]
        );
      },
      addGroup: function (t, i) {
        var o = function (o) {
          (o.mfpEl = this), e._openClick(o, t, i);
        };
        i || (i = {});
        var s = "click.magnificPopup";
        (i.mainEl = t),
          i.items
            ? ((i.isObj = !0), t.off(s).on(s, o))
            : ((i.isObj = !1),
              i.delegate
                ? t.off(s).on(s, i.delegate, o)
                : ((i.items = t), t.off(s).on(s, o)));
      },
      _openClick: function (i, o, s) {
        if (
          (void 0 !== s.midClick
            ? s.midClick
            : t.magnificPopup.defaults.midClick) ||
          !(2 === i.which || i.ctrlKey || i.metaKey || i.altKey || i.shiftKey)
        ) {
          var n =
            void 0 !== s.disableOn
              ? s.disableOn
              : t.magnificPopup.defaults.disableOn;
          if (n)
            if (t.isFunction(n)) {
              if (!n.call(e)) return !0;
            } else if (v.width() < n) return !0;
          i.type && (i.preventDefault(), e.isOpen && i.stopPropagation()),
            (s.el = t(i.mfpEl)),
            s.delegate && (s.items = o.find(s.delegate)),
            e.open(s);
        }
      },
      updateStatus: function (t, o) {
        if (e.preloader) {
          i !== t && e.container.removeClass("mfp-s-" + i),
            o || "loading" !== t || (o = e.st.tLoading);
          var s = { status: t, text: o };
          x("UpdateStatus", s),
            (t = s.status),
            (o = s.text),
            e.preloader.html(o),
            e.preloader.find("a").on("click", function (t) {
              t.stopImmediatePropagation();
            }),
            e.container.addClass("mfp-s-" + t),
            (i = t);
        }
      },
      _checkIfClose: function (i) {
        if (!t(i).hasClass(f)) {
          var o = e.st.closeOnContentClick,
            s = e.st.closeOnBgClick;
          if (o && s) return !0;
          if (
            !e.content ||
            t(i).hasClass("mfp-close") ||
            (e.preloader && i === e.preloader[0])
          )
            return !0;
          if (i === e.content[0] || t.contains(e.content[0], i)) {
            if (o) return !0;
          } else if (s && t.contains(document, i)) return !0;
          return !1;
        }
      },
      _addClassToMFP: function (t) {
        e.bgOverlay.addClass(t), e.wrap.addClass(t);
      },
      _removeClassFromMFP: function (t) {
        this.bgOverlay.removeClass(t), e.wrap.removeClass(t);
      },
      _hasScrollBar: function (t) {
        return (
          (e.isIE7 ? o.height() : document.body.scrollHeight) >
          (t || v.height())
        );
      },
      _setFocus: function () {
        (e.st.focus ? e.content.find(e.st.focus).eq(0) : e.wrap).focus();
      },
      _onFocusIn: function (i) {
        return i.target === e.wrap[0] || t.contains(e.wrap[0], i.target)
          ? void 0
          : (e._setFocus(), !1);
      },
      _parseMarkup: function (e, i, o) {
        var s;
        o.data && (i = t.extend(o.data, i)),
          x(l, [e, i, o]),
          t.each(i, function (i, o) {
            if (void 0 === o || !1 === o) return !0;
            if ((s = i.split("_")).length > 1) {
              var n = e.find(d + "-" + s[0]);
              if (n.length > 0) {
                var r = s[1];
                "replaceWith" === r
                  ? n[0] !== o[0] && n.replaceWith(o)
                  : "img" === r
                  ? n.is("img")
                    ? n.attr("src", o)
                    : n.replaceWith(
                        t("<img>").attr("src", o).attr("class", n.attr("class"))
                      )
                  : n.attr(s[1], o);
              }
            } else e.find(d + "-" + i).html(o);
          });
      },
      _getScrollbarSize: function () {
        if (void 0 === e.scrollbarSize) {
          var t = document.createElement("div");
          (t.style.cssText =
            "width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;"),
            document.body.appendChild(t),
            (e.scrollbarSize = t.offsetWidth - t.clientWidth),
            document.body.removeChild(t);
        }
        return e.scrollbarSize;
      },
    }),
      (t.magnificPopup = {
        instance: null,
        proto: g.prototype,
        modules: [],
        open: function (e, i) {
          return (
            _(),
            ((e = e ? t.extend(!0, {}, e) : {}).isObj = !0),
            (e.index = i || 0),
            this.instance.open(e)
          );
        },
        close: function () {
          return t.magnificPopup.instance && t.magnificPopup.instance.close();
        },
        registerModule: function (e, i) {
          i.options && (t.magnificPopup.defaults[e] = i.options),
            t.extend(this.proto, i.proto),
            this.modules.push(e);
        },
        defaults: {
          disableOn: 0,
          key: null,
          midClick: !1,
          mainClass: "",
          preloader: !0,
          focus: "",
          closeOnContentClick: !1,
          closeOnBgClick: !0,
          closeBtnInside: !0,
          showCloseBtn: !0,
          enableEscapeKey: !0,
          modal: !1,
          alignTop: !1,
          removalDelay: 0,
          prependTo: null,
          fixedContentPos: "auto",
          fixedBgPos: "auto",
          overflowY: "auto",
          closeMarkup:
            '<button title="%title%" type="button" class="mfp-close">&#215;</button>',
          tClose: "Close (Esc)",
          tLoading: "Loading...",
          autoFocusLast: !0,
        },
      }),
      (t.fn.magnificPopup = function (i) {
        _();
        var o = t(this);
        if ("string" == typeof i)
          if ("open" === i) {
            var s,
              n = w ? o.data("magnificPopup") : o[0].magnificPopup,
              r = parseInt(arguments[1], 10) || 0;
            n.items
              ? (s = n.items[r])
              : ((s = o),
                n.delegate && (s = s.find(n.delegate)),
                (s = s.eq(r))),
              e._openClick({ mfpEl: s }, o, n);
          } else
            e.isOpen && e[i].apply(e, Array.prototype.slice.call(arguments, 1));
        else
          (i = t.extend(!0, {}, i)),
            w ? o.data("magnificPopup", i) : (o[0].magnificPopup = i),
            e.addGroup(o, i);
        return o;
      });
    var C,
      T,
      W,
      S = "inline",
      L = function () {
        W && (T.after(W.addClass(C)).detach(), (W = null));
      };
    t.magnificPopup.registerModule(S, {
      options: {
        hiddenClass: "hide",
        markup: "",
        tNotFound: "Content not found",
      },
      proto: {
        initInline: function () {
          e.types.push(S),
            y(a + "." + S, function () {
              L();
            });
        },
        getInline: function (i, o) {
          if ((L(), i.src)) {
            var s = e.st.inline,
              n = t(i.src);
            if (n.length) {
              var r = n[0].parentNode;
              r &&
                r.tagName &&
                (T || ((C = s.hiddenClass), (T = z(C)), (C = "mfp-" + C)),
                (W = n.after(T).detach().removeClass(C))),
                e.updateStatus("ready");
            } else e.updateStatus("error", s.tNotFound), (n = t("<div>"));
            return (i.inlineElement = n), n;
          }
          return e.updateStatus("ready"), e._parseMarkup(o, {}, i), o;
        },
      },
    });
    var k,
      $ = "ajax",
      H = function () {
        k && t(document.body).removeClass(k);
      },
      I = function () {
        H(), e.req && e.req.abort();
      };
    t.magnificPopup.registerModule($, {
      options: {
        settings: null,
        cursor: "mfp-ajax-cur",
        tError: '<a href="%url%">The content</a> could not be loaded.',
      },
      proto: {
        initAjax: function () {
          e.types.push($),
            (k = e.st.ajax.cursor),
            y(a + "." + $, I),
            y("BeforeChange." + $, I);
        },
        getAjax: function (i) {
          k && t(document.body).addClass(k), e.updateStatus("loading");
          var o = t.extend(
            {
              url: i.src,
              success: function (o, s, n) {
                var r = { data: o, xhr: n };
                x("ParseAjax", r),
                  e.appendContent(t(r.data), $),
                  (i.finished = !0),
                  H(),
                  e._setFocus(),
                  setTimeout(function () {
                    e.wrap.addClass(u);
                  }, 16),
                  e.updateStatus("ready"),
                  x("AjaxContentAdded");
              },
              error: function () {
                H(),
                  (i.finished = i.loadError = !0),
                  e.updateStatus(
                    "error",
                    e.st.ajax.tError.replace("%url%", i.src)
                  );
              },
            },
            e.st.ajax.settings
          );
          return (e.req = t.ajax(o)), "";
        },
      },
    });
    var O,
      P,
      E = function (i) {
        if (i.data && void 0 !== i.data.title) return i.data.title;
        var o = e.st.image.titleSrc;
        if (o) {
          if (t.isFunction(o)) return o.call(e, i);
          if (i.el) return i.el.attr(o) || "";
        }
        return "";
      };
    t.magnificPopup.registerModule("image", {
      options: {
        markup:
          '<div class="mfp-figure"><div class="mfp-close"></div><figure><div class="mfp-img"></div><figcaption><div class="mfp-bottom-bar"><div class="mfp-title"></div><div class="mfp-counter"></div></div></figcaption></figure></div>',
        cursor: "mfp-zoom-out-cur",
        titleSrc: "title",
        verticalFit: !0,
        tError: '<a href="%url%">The image</a> could not be loaded.',
      },
      proto: {
        initImage: function () {
          var i = e.st.image,
            o = ".image";
          e.types.push("image"),
            y(p + o, function () {
              "image" === e.currItem.type &&
                i.cursor &&
                t(document.body).addClass(i.cursor);
            }),
            y(a + o, function () {
              i.cursor && t(document.body).removeClass(i.cursor),
                v.off("resize" + d);
            }),
            y("Resize" + o, e.resizeImage),
            e.isLowIE && y("AfterChange", e.resizeImage);
        },
        resizeImage: function () {
          var t = e.currItem;
          if (t && t.img && e.st.image.verticalFit) {
            var i = 0;
            e.isLowIE &&
              (i =
                parseInt(t.img.css("padding-top"), 10) +
                parseInt(t.img.css("padding-bottom"), 10)),
              t.img.css("max-height", e.wH - i);
          }
        },
        _onImageHasSize: function (t) {
          t.img &&
            ((t.hasSize = !0),
            O && clearInterval(O),
            (t.isCheckingImgSize = !1),
            x("ImageHasSize", t),
            t.imgHidden &&
              (e.content && e.content.removeClass("mfp-loading"),
              (t.imgHidden = !1)));
        },
        findImageSize: function (t) {
          var i = 0,
            o = t.img[0],
            s = function (n) {
              O && clearInterval(O),
                (O = setInterval(function () {
                  return o.naturalWidth > 0
                    ? void e._onImageHasSize(t)
                    : (i > 200 && clearInterval(O),
                      void (3 == ++i
                        ? s(10)
                        : 40 === i
                        ? s(50)
                        : 100 === i && s(500)));
                }, n));
            };
          s(1);
        },
        getImage: function (i, o) {
          var s = 0,
            n = function () {
              i &&
                (i.img[0].complete
                  ? (i.img.off(".mfploader"),
                    i === e.currItem &&
                      (e._onImageHasSize(i), e.updateStatus("ready")),
                    (i.hasSize = !0),
                    (i.loaded = !0),
                    x("ImageLoadComplete"))
                  : 200 > ++s
                  ? setTimeout(n, 100)
                  : r());
            },
            r = function () {
              i &&
                (i.img.off(".mfploader"),
                i === e.currItem &&
                  (e._onImageHasSize(i),
                  e.updateStatus("error", a.tError.replace("%url%", i.src))),
                (i.hasSize = !0),
                (i.loaded = !0),
                (i.loadError = !0));
            },
            a = e.st.image,
            h = o.find(".mfp-img");
          if (h.length) {
            var l = document.createElement("img");
            (l.className = "mfp-img"),
              i.el &&
                i.el.find("img").length &&
                (l.alt = i.el.find("img").attr("alt")),
              (i.img = t(l).on("load.mfploader", n).on("error.mfploader", r)),
              (l.src = i.src),
              h.is("img") && (i.img = i.img.clone()),
              (l = i.img[0]).naturalWidth > 0
                ? (i.hasSize = !0)
                : l.width || (i.hasSize = !1);
          }
          return (
            e._parseMarkup(o, { title: E(i), img_replaceWith: i.img }, i),
            e.resizeImage(),
            i.hasSize
              ? (O && clearInterval(O),
                i.loadError
                  ? (o.addClass("mfp-loading"),
                    e.updateStatus("error", a.tError.replace("%url%", i.src)))
                  : (o.removeClass("mfp-loading"), e.updateStatus("ready")),
                o)
              : (e.updateStatus("loading"),
                (i.loading = !0),
                i.hasSize ||
                  ((i.imgHidden = !0),
                  o.addClass("mfp-loading"),
                  e.findImageSize(i)),
                o)
          );
        },
      },
    }),
      t.magnificPopup.registerModule("zoom", {
        options: {
          enabled: !1,
          easing: "ease-in-out",
          duration: 300,
          opener: function (t) {
            return t.is("img") ? t : t.find("img");
          },
        },
        proto: {
          initZoom: function () {
            var t,
              i = e.st.zoom,
              o = ".zoom";
            if (i.enabled && e.supportsTransition) {
              var s,
                n,
                r = i.duration,
                l = function (t) {
                  var e = t
                      .clone()
                      .removeAttr("style")
                      .removeAttr("class")
                      .addClass("mfp-animated-image"),
                    o = "all " + i.duration / 1e3 + "s " + i.easing,
                    s = {
                      position: "fixed",
                      zIndex: 9999,
                      left: 0,
                      top: 0,
                      "-webkit-backface-visibility": "hidden",
                    },
                    n = "transition";
                  return (
                    (s["-webkit-" + n] =
                      s["-moz-" + n] =
                      s["-o-" + n] =
                      s[n] =
                        o),
                    e.css(s),
                    e
                  );
                },
                p = function () {
                  e.content.css("visibility", "visible");
                };
              y("BuildControls" + o, function () {
                if (e._allowZoom()) {
                  if (
                    (clearTimeout(s),
                    e.content.css("visibility", "hidden"),
                    !(t = e._getItemToZoom()))
                  )
                    return void p();
                  (n = l(t)).css(e._getOffset()),
                    e.wrap.append(n),
                    (s = setTimeout(function () {
                      n.css(e._getOffset(!0)),
                        (s = setTimeout(function () {
                          p(),
                            setTimeout(function () {
                              n.remove(),
                                (t = n = null),
                                x("ZoomAnimationEnded");
                            }, 16);
                        }, r));
                    }, 16));
                }
              }),
                y(h + o, function () {
                  if (e._allowZoom()) {
                    if ((clearTimeout(s), (e.st.removalDelay = r), !t)) {
                      if (!(t = e._getItemToZoom())) return;
                      n = l(t);
                    }
                    n.css(e._getOffset(!0)),
                      e.wrap.append(n),
                      e.content.css("visibility", "hidden"),
                      setTimeout(function () {
                        n.css(e._getOffset());
                      }, 16);
                  }
                }),
                y(a + o, function () {
                  e._allowZoom() && (p(), n && n.remove(), (t = null));
                });
            }
          },
          _allowZoom: function () {
            return "image" === e.currItem.type;
          },
          _getItemToZoom: function () {
            return !!e.currItem.hasSize && e.currItem.img;
          },
          _getOffset: function (i) {
            var o,
              s = (o = i
                ? e.currItem.img
                : e.st.zoom.opener(e.currItem.el || e.currItem)).offset(),
              n = parseInt(o.css("padding-top"), 10),
              r = parseInt(o.css("padding-bottom"), 10);
            s.top -= t(window).scrollTop() - n;
            var a = {
              width: o.width(),
              height: (w ? o.innerHeight() : o[0].offsetHeight) - r - n,
            };
            return (
              void 0 === P &&
                (P = void 0 !== document.createElement("p").style.MozTransform),
              P
                ? (a["-moz-transform"] = a.transform =
                    "translate(" + s.left + "px," + s.top + "px)")
                : ((a.left = s.left), (a.top = s.top)),
              a
            );
          },
        },
      });
    var A = "iframe",
      M = function (t) {
        if (e.currTemplate[A]) {
          var i = e.currTemplate[A].find("iframe");
          i.length &&
            (t || (i[0].src = "//about:blank"),
            e.isIE8 && i.css("display", t ? "block" : "none"));
        }
      };
    t.magnificPopup.registerModule(A, {
      options: {
        markup:
          '<div class="mfp-iframe-scaler"><div class="mfp-close"></div><iframe class="mfp-iframe" src="//about:blank" frameborder="0" allowfullscreen></iframe></div>',
        srcAction: "iframe_src",
        patterns: {
          youtube: {
            index: "youtube.com",
            id: "v=",
            src: "//www.youtube.com/embed/%id%?autoplay=1",
          },
          vimeo: {
            index: "vimeo.com/",
            id: "/",
            src: "//player.vimeo.com/video/%id%?autoplay=1",
          },
          gmaps: { index: "//maps.google.", src: "%id%&output=embed" },
        },
      },
      proto: {
        initIframe: function () {
          e.types.push(A),
            y("BeforeChange", function (t, e, i) {
              e !== i && (e === A ? M() : i === A && M(!0));
            }),
            y(a + "." + A, function () {
              M();
            });
        },
        getIframe: function (i, o) {
          var s = i.src,
            n = e.st.iframe;
          t.each(n.patterns, function () {
            return s.indexOf(this.index) > -1
              ? (this.id &&
                  (s =
                    "string" == typeof this.id
                      ? s.substr(
                          s.lastIndexOf(this.id) + this.id.length,
                          s.length
                        )
                      : this.id.call(this, s)),
                (s = this.src.replace("%id%", s)),
                !1)
              : void 0;
          });
          var r = {};
          return (
            n.srcAction && (r[n.srcAction] = s),
            e._parseMarkup(o, r, i),
            e.updateStatus("ready"),
            o
          );
        },
      },
    });
    var D = function (t) {
        var i = e.items.length;
        return t > i - 1 ? t - i : 0 > t ? i + t : t;
      },
      F = function (t, e, i) {
        return t.replace(/%curr%/gi, e + 1).replace(/%total%/gi, i);
      };
    t.magnificPopup.registerModule("gallery", {
      options: {
        enabled: !1,
        arrowMarkup:
          '<button title="%title%" type="button" class="mfp-arrow mfp-arrow-%dir%"></button>',
        preload: [0, 2],
        navigateByImgClick: !0,
        arrows: !0,
        tPrev: "Previous (Left arrow key)",
        tNext: "Next (Right arrow key)",
        tCounter: "%curr% of %total%",
      },
      proto: {
        initGallery: function () {
          var i = e.st.gallery,
            s = ".mfp-gallery";
          return (
            (e.direction = !0),
            !(!i || !i.enabled) &&
              ((n += " mfp-gallery"),
              y(p + s, function () {
                i.navigateByImgClick &&
                  e.wrap.on("click" + s, ".mfp-img", function () {
                    return e.items.length > 1 ? (e.next(), !1) : void 0;
                  }),
                  o.on("keydown" + s, function (t) {
                    37 === t.keyCode ? e.prev() : 39 === t.keyCode && e.next();
                  });
              }),
              y("UpdateStatus" + s, function (t, i) {
                i.text &&
                  (i.text = F(i.text, e.currItem.index, e.items.length));
              }),
              y(l + s, function (t, o, s, n) {
                var r = e.items.length;
                s.counter = r > 1 ? F(i.tCounter, n.index, r) : "";
              }),
              y("BuildControls" + s, function () {
                if (e.items.length > 1 && i.arrows && !e.arrowLeft) {
                  var o = i.arrowMarkup,
                    s = (e.arrowLeft = t(
                      o.replace(/%title%/gi, i.tPrev).replace(/%dir%/gi, "left")
                    ).addClass(f)),
                    n = (e.arrowRight = t(
                      o
                        .replace(/%title%/gi, i.tNext)
                        .replace(/%dir%/gi, "right")
                    ).addClass(f));
                  s.click(function () {
                    e.prev();
                  }),
                    n.click(function () {
                      e.next();
                    }),
                    e.container.append(s.add(n));
                }
              }),
              y(c + s, function () {
                e._preloadTimeout && clearTimeout(e._preloadTimeout),
                  (e._preloadTimeout = setTimeout(function () {
                    e.preloadNearbyImages(), (e._preloadTimeout = null);
                  }, 16));
              }),
              void y(a + s, function () {
                o.off(s),
                  e.wrap.off("click" + s),
                  (e.arrowRight = e.arrowLeft = null);
              }))
          );
        },
        next: function () {
          (e.direction = !0), (e.index = D(e.index + 1)), e.updateItemHTML();
        },
        prev: function () {
          (e.direction = !1), (e.index = D(e.index - 1)), e.updateItemHTML();
        },
        goTo: function (t) {
          (e.direction = t >= e.index), (e.index = t), e.updateItemHTML();
        },
        preloadNearbyImages: function () {
          var t,
            i = e.st.gallery.preload,
            o = Math.min(i[0], e.items.length),
            s = Math.min(i[1], e.items.length);
          for (t = 1; t <= (e.direction ? s : o); t++)
            e._preloadItem(e.index + t);
          for (t = 1; t <= (e.direction ? o : s); t++)
            e._preloadItem(e.index - t);
        },
        _preloadItem: function (i) {
          if (((i = D(i)), !e.items[i].preloaded)) {
            var o = e.items[i];
            o.parsed || (o = e.parseEl(i)),
              x("LazyLoad", o),
              "image" === o.type &&
                (o.img = t('<img class="mfp-img" />')
                  .on("load.mfploader", function () {
                    o.hasSize = !0;
                  })
                  .on("error.mfploader", function () {
                    (o.hasSize = !0), (o.loadError = !0), x("LazyLoadError", o);
                  })
                  .attr("src", o.src)),
              (o.preloaded = !0);
          }
        },
      },
    });
    var R = "retina";
    t.magnificPopup.registerModule(R, {
      options: {
        replaceSrc: function (t) {
          return t.src.replace(/\.\w+$/, function (t) {
            return "@2x" + t;
          });
        },
        ratio: 1,
      },
      proto: {
        initRetina: function () {
          if (window.devicePixelRatio > 1) {
            var t = e.st.retina,
              i = t.ratio;
            (i = isNaN(i) ? i() : i) > 1 &&
              (y("ImageHasSize." + R, function (t, e) {
                e.img.css({
                  "max-width": e.img[0].naturalWidth / i,
                  width: "100%",
                });
              }),
              y("ElementParse." + R, function (e, o) {
                o.src = t.replaceSrc(o, i);
              }));
          }
        },
      },
    }),
      _();
  }),
  (function (t, e, i, o) {
    function s(e, i) {
      (this.settings = null),
        (this.options = t.extend({}, s.Defaults, i)),
        (this.$element = t(e)),
        (this._handlers = {}),
        (this._plugins = {}),
        (this._supress = {}),
        (this._current = null),
        (this._speed = null),
        (this._coordinates = []),
        (this._breakpoint = null),
        (this._width = null),
        (this._items = []),
        (this._clones = []),
        (this._mergers = []),
        (this._widths = []),
        (this._invalidated = {}),
        (this._pipe = []),
        (this._drag = {
          time: null,
          target: null,
          pointer: null,
          stage: { start: null, current: null },
          direction: null,
        }),
        (this._states = {
          current: {},
          tags: {
            initializing: ["busy"],
            animating: ["busy"],
            dragging: ["interacting"],
          },
        }),
        t.each(
          ["onResize", "onThrottledResize"],
          t.proxy(function (e, i) {
            this._handlers[i] = t.proxy(this[i], this);
          }, this)
        ),
        t.each(
          s.Plugins,
          t.proxy(function (t, e) {
            this._plugins[t.charAt(0).toLowerCase() + t.slice(1)] = new e(this);
          }, this)
        ),
        t.each(
          s.Workers,
          t.proxy(function (e, i) {
            this._pipe.push({ filter: i.filter, run: t.proxy(i.run, this) });
          }, this)
        ),
        this.setup(),
        this.initialize();
    }
    (s.Defaults = {
      items: 3,
      loop: !1,
      center: !1,
      rewind: !1,
      checkVisibility: !0,
      mouseDrag: !0,
      touchDrag: !0,
      pullDrag: !0,
      freeDrag: !1,
      margin: 0,
      stagePadding: 0,
      merge: !1,
      mergeFit: !0,
      autoWidth: !1,
      startPosition: 0,
      rtl: !1,
      smartSpeed: 250,
      fluidSpeed: !1,
      dragEndSpeed: !1,
      responsive: {},
      responsiveRefreshRate: 200,
      responsiveBaseElement: e,
      fallbackEasing: "swing",
      slideTransition: "",
      info: !1,
      nestedItemSelector: !1,
      itemElement: "div",
      stageElement: "div",
      refreshClass: "owl-refresh",
      loadedClass: "owl-loaded",
      loadingClass: "owl-loading",
      rtlClass: "owl-rtl",
      responsiveClass: "owl-responsive",
      dragClass: "owl-drag",
      itemClass: "owl-item",
      stageClass: "owl-stage",
      stageOuterClass: "owl-stage-outer",
      grabClass: "owl-grab",
    }),
      (s.Width = { Default: "default", Inner: "inner", Outer: "outer" }),
      (s.Type = { Event: "event", State: "state" }),
      (s.Plugins = {}),
      (s.Workers = [
        {
          filter: ["width", "settings"],
          run: function () {
            this._width = this.$element.width();
          },
        },
        {
          filter: ["width", "items", "settings"],
          run: function (t) {
            t.current =
              this._items && this._items[this.relative(this._current)];
          },
        },
        {
          filter: ["items", "settings"],
          run: function () {
            this.$stage.children(".cloned").remove();
          },
        },
        {
          filter: ["width", "items", "settings"],
          run: function (t) {
            var e = this.settings.margin || "",
              i = !this.settings.autoWidth,
              o = this.settings.rtl,
              s = {
                width: "auto",
                "margin-left": o ? e : "",
                "margin-right": o ? "" : e,
              };
            !i && this.$stage.children().css(s), (t.css = s);
          },
        },
        {
          filter: ["width", "items", "settings"],
          run: function (t) {
            var e =
                (this.width() / this.settings.items).toFixed(3) -
                this.settings.margin,
              i = null,
              o = this._items.length,
              s = !this.settings.autoWidth,
              n = [];
            for (t.items = { merge: !1, width: e }; o--; )
              (i = this._mergers[o]),
                (i =
                  (this.settings.mergeFit &&
                    Math.min(i, this.settings.items)) ||
                  i),
                (t.items.merge = i > 1 || t.items.merge),
                (n[o] = s ? e * i : this._items[o].width());
            this._widths = n;
          },
        },
        {
          filter: ["items", "settings"],
          run: function () {
            var e = [],
              i = this._items,
              o = this.settings,
              s = Math.max(2 * o.items, 4),
              n = 2 * Math.ceil(i.length / 2),
              r = o.loop && i.length ? (o.rewind ? s : Math.max(s, n)) : 0,
              a = "",
              h = "";
            for (r /= 2; r > 0; )
              e.push(this.normalize(e.length / 2, !0)),
                (a += i[e[e.length - 1]][0].outerHTML),
                e.push(this.normalize(i.length - 1 - (e.length - 1) / 2, !0)),
                (h = i[e[e.length - 1]][0].outerHTML + h),
                (r -= 1);
            (this._clones = e),
              t(a).addClass("cloned").appendTo(this.$stage),
              t(h).addClass("cloned").prependTo(this.$stage);
          },
        },
        {
          filter: ["width", "items", "settings"],
          run: function () {
            for (
              var t = this.settings.rtl ? 1 : -1,
                e = this._clones.length + this._items.length,
                i = -1,
                o = 0,
                s = 0,
                n = [];
              ++i < e;

            )
              (o = n[i - 1] || 0),
                (s = this._widths[this.relative(i)] + this.settings.margin),
                n.push(o + s * t);
            this._coordinates = n;
          },
        },
        {
          filter: ["width", "items", "settings"],
          run: function () {
            var t = this.settings.stagePadding,
              e = this._coordinates,
              i = {
                width: Math.ceil(Math.abs(e[e.length - 1])) + 2 * t,
                "padding-left": t || "",
                "padding-right": t || "",
              };
            this.$stage.css(i);
          },
        },
        {
          filter: ["width", "items", "settings"],
          run: function (t) {
            var e = this._coordinates.length,
              i = !this.settings.autoWidth,
              o = this.$stage.children();
            if (i && t.items.merge)
              for (; e--; )
                (t.css.width = this._widths[this.relative(e)]),
                  o.eq(e).css(t.css);
            else i && ((t.css.width = t.items.width), o.css(t.css));
          },
        },
        {
          filter: ["items"],
          run: function () {
            this._coordinates.length < 1 && this.$stage.removeAttr("style");
          },
        },
        {
          filter: ["width", "items", "settings"],
          run: function (t) {
            (t.current = t.current
              ? this.$stage.children().index(t.current)
              : 0),
              (t.current = Math.max(
                this.minimum(),
                Math.min(this.maximum(), t.current)
              )),
              this.reset(t.current);
          },
        },
        {
          filter: ["position"],
          run: function () {
            this.animate(this.coordinates(this._current));
          },
        },
        {
          filter: ["width", "position", "items", "settings"],
          run: function () {
            var t,
              e,
              i,
              o,
              s = this.settings.rtl ? 1 : -1,
              n = 2 * this.settings.stagePadding,
              r = this.coordinates(this.current()) + n,
              a = r + this.width() * s,
              h = [];
            for (i = 0, o = this._coordinates.length; i < o; i++)
              (t = this._coordinates[i - 1] || 0),
                (e = Math.abs(this._coordinates[i]) + n * s),
                ((this.op(t, "<=", r) && this.op(t, ">", a)) ||
                  (this.op(e, "<", r) && this.op(e, ">", a))) &&
                  h.push(i);
            this.$stage.children(".active").removeClass("active"),
              this.$stage
                .children(":eq(" + h.join("), :eq(") + ")")
                .addClass("active"),
              this.$stage.children(".center").removeClass("center"),
              this.settings.center &&
                this.$stage.children().eq(this.current()).addClass("center");
          },
        },
      ]),
      (s.prototype.initializeStage = function () {
        (this.$stage = this.$element.find("." + this.settings.stageClass)),
          this.$stage.length ||
            (this.$element.addClass(this.options.loadingClass),
            (this.$stage = t("<" + this.settings.stageElement + ">", {
              class: this.settings.stageClass,
            }).wrap(t("<div/>", { class: this.settings.stageOuterClass }))),
            this.$element.append(this.$stage.parent()));
      }),
      (s.prototype.initializeItems = function () {
        var e = this.$element.find(".owl-item");
        if (e.length)
          return (
            (this._items = e.get().map(function (e) {
              return t(e);
            })),
            (this._mergers = this._items.map(function () {
              return 1;
            })),
            void this.refresh()
          );
        this.replace(this.$element.children().not(this.$stage.parent())),
          this.isVisible() ? this.refresh() : this.invalidate("width"),
          this.$element
            .removeClass(this.options.loadingClass)
            .addClass(this.options.loadedClass);
      }),
      (s.prototype.initialize = function () {
        var t, e, i;
        this.enter("initializing"),
          this.trigger("initialize"),
          this.$element.toggleClass(this.settings.rtlClass, this.settings.rtl),
          this.settings.autoWidth &&
            !this.is("pre-loading") &&
            ((t = this.$element.find("img")),
            (e = this.settings.nestedItemSelector
              ? "." + this.settings.nestedItemSelector
              : o),
            (i = this.$element.children(e).width()),
            t.length && i <= 0 && this.preloadAutoWidthImages(t)),
          this.initializeStage(),
          this.initializeItems(),
          this.registerEventHandlers(),
          this.leave("initializing"),
          this.trigger("initialized");
      }),
      (s.prototype.isVisible = function () {
        return !this.settings.checkVisibility || this.$element.is(":visible");
      }),
      (s.prototype.setup = function () {
        var e = this.viewport(),
          i = this.options.responsive,
          o = -1,
          s = null;
        i
          ? (t.each(i, function (t) {
              t <= e && t > o && (o = Number(t));
            }),
            "function" ==
              typeof (s = t.extend({}, this.options, i[o])).stagePadding &&
              (s.stagePadding = s.stagePadding()),
            delete s.responsive,
            s.responsiveClass &&
              this.$element.attr(
                "class",
                this.$element
                  .attr("class")
                  .replace(
                    new RegExp(
                      "(" + this.options.responsiveClass + "-)\\S+\\s",
                      "g"
                    ),
                    "$1" + o
                  )
              ))
          : (s = t.extend({}, this.options)),
          this.trigger("change", { property: { name: "settings", value: s } }),
          (this._breakpoint = o),
          (this.settings = s),
          this.invalidate("settings"),
          this.trigger("changed", {
            property: { name: "settings", value: this.settings },
          });
      }),
      (s.prototype.optionsLogic = function () {
        this.settings.autoWidth &&
          ((this.settings.stagePadding = !1), (this.settings.merge = !1));
      }),
      (s.prototype.prepare = function (e) {
        var i = this.trigger("prepare", { content: e });
        return (
          i.data ||
            (i.data = t("<" + this.settings.itemElement + "/>")
              .addClass(this.options.itemClass)
              .append(e)),
          this.trigger("prepared", { content: i.data }),
          i.data
        );
      }),
      (s.prototype.update = function () {
        for (
          var e = 0,
            i = this._pipe.length,
            o = t.proxy(function (t) {
              return this[t];
            }, this._invalidated),
            s = {};
          e < i;

        )
          (this._invalidated.all ||
            t.grep(this._pipe[e].filter, o).length > 0) &&
            this._pipe[e].run(s),
            e++;
        (this._invalidated = {}), !this.is("valid") && this.enter("valid");
      }),
      (s.prototype.width = function (t) {
        switch ((t = t || s.Width.Default)) {
          case s.Width.Inner:
          case s.Width.Outer:
            return this._width;
          default:
            return (
              this._width -
              2 * this.settings.stagePadding +
              this.settings.margin
            );
        }
      }),
      (s.prototype.refresh = function () {
        this.enter("refreshing"),
          this.trigger("refresh"),
          this.setup(),
          this.optionsLogic(),
          this.$element.addClass(this.options.refreshClass),
          this.update(),
          this.$element.removeClass(this.options.refreshClass),
          this.leave("refreshing"),
          this.trigger("refreshed");
      }),
      (s.prototype.onThrottledResize = function () {
        e.clearTimeout(this.resizeTimer),
          (this.resizeTimer = e.setTimeout(
            this._handlers.onResize,
            this.settings.responsiveRefreshRate
          ));
      }),
      (s.prototype.onResize = function () {
        return (
          !!this._items.length &&
          this._width !== this.$element.width() &&
          !!this.isVisible() &&
          (this.enter("resizing"),
          this.trigger("resize").isDefaultPrevented()
            ? (this.leave("resizing"), !1)
            : (this.invalidate("width"),
              this.refresh(),
              this.leave("resizing"),
              void this.trigger("resized")))
        );
      }),
      (s.prototype.registerEventHandlers = function () {
        t.support.transition &&
          this.$stage.on(
            t.support.transition.end + ".owl.core",
            t.proxy(this.onTransitionEnd, this)
          ),
          !1 !== this.settings.responsive &&
            this.on(e, "resize", this._handlers.onThrottledResize),
          this.settings.mouseDrag &&
            (this.$element.addClass(this.options.dragClass),
            this.$stage.on(
              "mousedown.owl.core",
              t.proxy(this.onDragStart, this)
            ),
            this.$stage.on(
              "dragstart.owl.core selectstart.owl.core",
              function () {
                return !1;
              }
            )),
          this.settings.touchDrag &&
            (this.$stage.on(
              "touchstart.owl.core",
              t.proxy(this.onDragStart, this)
            ),
            this.$stage.on(
              "touchcancel.owl.core",
              t.proxy(this.onDragEnd, this)
            ));
      }),
      (s.prototype.onDragStart = function (e) {
        var o = null;
        3 !== e.which &&
          (t.support.transform
            ? (o = {
                x: (o = this.$stage
                  .css("transform")
                  .replace(/.*\(|\)| /g, "")
                  .split(","))[16 === o.length ? 12 : 4],
                y: o[16 === o.length ? 13 : 5],
              })
            : ((o = this.$stage.position()),
              (o = {
                x: this.settings.rtl
                  ? o.left +
                    this.$stage.width() -
                    this.width() +
                    this.settings.margin
                  : o.left,
                y: o.top,
              })),
          this.is("animating") &&
            (t.support.transform ? this.animate(o.x) : this.$stage.stop(),
            this.invalidate("position")),
          this.$element.toggleClass(
            this.options.grabClass,
            "mousedown" === e.type
          ),
          this.speed(0),
          (this._drag.time = new Date().getTime()),
          (this._drag.target = t(e.target)),
          (this._drag.stage.start = o),
          (this._drag.stage.current = o),
          (this._drag.pointer = this.pointer(e)),
          t(i).on(
            "mouseup.owl.core touchend.owl.core",
            t.proxy(this.onDragEnd, this)
          ),
          t(i).one(
            "mousemove.owl.core touchmove.owl.core",
            t.proxy(function (e) {
              var o = this.difference(this._drag.pointer, this.pointer(e));
              t(i).on(
                "mousemove.owl.core touchmove.owl.core",
                t.proxy(this.onDragMove, this)
              ),
                (Math.abs(o.x) < Math.abs(o.y) && this.is("valid")) ||
                  (e.preventDefault(),
                  this.enter("dragging"),
                  this.trigger("drag"));
            }, this)
          ));
      }),
      (s.prototype.onDragMove = function (t) {
        var e = null,
          i = null,
          o = null,
          s = this.difference(this._drag.pointer, this.pointer(t)),
          n = this.difference(this._drag.stage.start, s);
        this.is("dragging") &&
          (t.preventDefault(),
          this.settings.loop
            ? ((e = this.coordinates(this.minimum())),
              (i = this.coordinates(this.maximum() + 1) - e),
              (n.x = ((((n.x - e) % i) + i) % i) + e))
            : ((e = this.settings.rtl
                ? this.coordinates(this.maximum())
                : this.coordinates(this.minimum())),
              (i = this.settings.rtl
                ? this.coordinates(this.minimum())
                : this.coordinates(this.maximum())),
              (o = this.settings.pullDrag ? (-1 * s.x) / 5 : 0),
              (n.x = Math.max(Math.min(n.x, e + o), i + o))),
          (this._drag.stage.current = n),
          this.animate(n.x));
      }),
      (s.prototype.onDragEnd = function (e) {
        var o = this.difference(this._drag.pointer, this.pointer(e)),
          s = this._drag.stage.current,
          n = (o.x > 0) ^ this.settings.rtl ? "left" : "right";
        t(i).off(".owl.core"),
          this.$element.removeClass(this.options.grabClass),
          ((0 !== o.x && this.is("dragging")) || !this.is("valid")) &&
            (this.speed(this.settings.dragEndSpeed || this.settings.smartSpeed),
            this.current(
              this.closest(s.x, 0 !== o.x ? n : this._drag.direction)
            ),
            this.invalidate("position"),
            this.update(),
            (this._drag.direction = n),
            (Math.abs(o.x) > 3 ||
              new Date().getTime() - this._drag.time > 300) &&
              this._drag.target.one("click.owl.core", function () {
                return !1;
              })),
          this.is("dragging") &&
            (this.leave("dragging"), this.trigger("dragged"));
      }),
      (s.prototype.closest = function (e, i) {
        var s = -1,
          n = this.width(),
          r = this.coordinates();
        return (
          this.settings.freeDrag ||
            t.each(
              r,
              t.proxy(function (t, a) {
                return (
                  "left" === i && e > a - 30 && e < a + 30
                    ? (s = t)
                    : "right" === i && e > a - n - 30 && e < a - n + 30
                    ? (s = t + 1)
                    : this.op(e, "<", a) &&
                      this.op(e, ">", r[t + 1] !== o ? r[t + 1] : a - n) &&
                      (s = "left" === i ? t + 1 : t),
                  -1 === s
                );
              }, this)
            ),
          this.settings.loop ||
            (this.op(e, ">", r[this.minimum()])
              ? (s = e = this.minimum())
              : this.op(e, "<", r[this.maximum()]) && (s = e = this.maximum())),
          s
        );
      }),
      (s.prototype.animate = function (e) {
        var i = this.speed() > 0;
        this.is("animating") && this.onTransitionEnd(),
          i && (this.enter("animating"), this.trigger("translate")),
          t.support.transform3d && t.support.transition
            ? this.$stage.css({
                transform: "translate3d(" + e + "px,0px,0px)",
                transition:
                  this.speed() / 1e3 +
                  "s" +
                  (this.settings.slideTransition
                    ? " " + this.settings.slideTransition
                    : ""),
              })
            : i
            ? this.$stage.animate(
                { left: e + "px" },
                this.speed(),
                this.settings.fallbackEasing,
                t.proxy(this.onTransitionEnd, this)
              )
            : this.$stage.css({ left: e + "px" });
      }),
      (s.prototype.is = function (t) {
        return this._states.current[t] && this._states.current[t] > 0;
      }),
      (s.prototype.current = function (t) {
        if (t === o) return this._current;
        if (0 === this._items.length) return o;
        if (((t = this.normalize(t)), this._current !== t)) {
          var e = this.trigger("change", {
            property: { name: "position", value: t },
          });
          e.data !== o && (t = this.normalize(e.data)),
            (this._current = t),
            this.invalidate("position"),
            this.trigger("changed", {
              property: { name: "position", value: this._current },
            });
        }
        return this._current;
      }),
      (s.prototype.invalidate = function (e) {
        return (
          "string" === t.type(e) &&
            ((this._invalidated[e] = !0),
            this.is("valid") && this.leave("valid")),
          t.map(this._invalidated, function (t, e) {
            return e;
          })
        );
      }),
      (s.prototype.reset = function (t) {
        (t = this.normalize(t)) !== o &&
          ((this._speed = 0),
          (this._current = t),
          this.suppress(["translate", "translated"]),
          this.animate(this.coordinates(t)),
          this.release(["translate", "translated"]));
      }),
      (s.prototype.normalize = function (t, e) {
        var i = this._items.length,
          s = e ? 0 : this._clones.length;
        return (
          !this.isNumeric(t) || i < 1
            ? (t = o)
            : (t < 0 || t >= i + s) &&
              (t = ((((t - s / 2) % i) + i) % i) + s / 2),
          t
        );
      }),
      (s.prototype.relative = function (t) {
        return (t -= this._clones.length / 2), this.normalize(t, !0);
      }),
      (s.prototype.maximum = function (t) {
        var e,
          i,
          o,
          s = this.settings,
          n = this._coordinates.length;
        if (s.loop) n = this._clones.length / 2 + this._items.length - 1;
        else if (s.autoWidth || s.merge) {
          if ((e = this._items.length))
            for (
              i = this._items[--e].width(), o = this.$element.width();
              e-- &&
              !((i += this._items[e].width() + this.settings.margin) > o);

            );
          n = e + 1;
        } else
          n = s.center ? this._items.length - 1 : this._items.length - s.items;
        return t && (n -= this._clones.length / 2), Math.max(n, 0);
      }),
      (s.prototype.minimum = function (t) {
        return t ? 0 : this._clones.length / 2;
      }),
      (s.prototype.items = function (t) {
        return t === o
          ? this._items.slice()
          : ((t = this.normalize(t, !0)), this._items[t]);
      }),
      (s.prototype.mergers = function (t) {
        return t === o
          ? this._mergers.slice()
          : ((t = this.normalize(t, !0)), this._mergers[t]);
      }),
      (s.prototype.clones = function (e) {
        var i = this._clones.length / 2,
          s = i + this._items.length,
          n = function (t) {
            return t % 2 == 0 ? s + t / 2 : i - (t + 1) / 2;
          };
        return e === o
          ? t.map(this._clones, function (t, e) {
              return n(e);
            })
          : t.map(this._clones, function (t, i) {
              return t === e ? n(i) : null;
            });
      }),
      (s.prototype.speed = function (t) {
        return t !== o && (this._speed = t), this._speed;
      }),
      (s.prototype.coordinates = function (e) {
        var i,
          s = 1,
          n = e - 1;
        return e === o
          ? t.map(
              this._coordinates,
              t.proxy(function (t, e) {
                return this.coordinates(e);
              }, this)
            )
          : (this.settings.center
              ? (this.settings.rtl && ((s = -1), (n = e + 1)),
                (i = this._coordinates[e]),
                (i +=
                  ((this.width() - i + (this._coordinates[n] || 0)) / 2) * s))
              : (i = this._coordinates[n] || 0),
            (i = Math.ceil(i)));
      }),
      (s.prototype.duration = function (t, e, i) {
        return 0 === i
          ? 0
          : Math.min(Math.max(Math.abs(e - t), 1), 6) *
              Math.abs(i || this.settings.smartSpeed);
      }),
      (s.prototype.to = function (t, e) {
        var i = this.current(),
          o = null,
          s = t - this.relative(i),
          n = (s > 0) - (s < 0),
          r = this._items.length,
          a = this.minimum(),
          h = this.maximum();
        this.settings.loop
          ? (!this.settings.rewind && Math.abs(s) > r / 2 && (s += -1 * n * r),
            (o = (((((t = i + s) - a) % r) + r) % r) + a) !== t &&
              o - s <= h &&
              o - s > 0 &&
              ((i = o - s), (t = o), this.reset(i)))
          : (t = this.settings.rewind
              ? ((t % (h += 1)) + h) % h
              : Math.max(a, Math.min(h, t))),
          this.speed(this.duration(i, t, e)),
          this.current(t),
          this.isVisible() && this.update();
      }),
      (s.prototype.next = function (t) {
        (t = t || !1), this.to(this.relative(this.current()) + 1, t);
      }),
      (s.prototype.prev = function (t) {
        (t = t || !1), this.to(this.relative(this.current()) - 1, t);
      }),
      (s.prototype.onTransitionEnd = function (t) {
        if (
          t !== o &&
          (t.stopPropagation(),
          (t.target || t.srcElement || t.originalTarget) !== this.$stage.get(0))
        )
          return !1;
        this.leave("animating"), this.trigger("translated");
      }),
      (s.prototype.viewport = function () {
        var o;
        return (
          this.options.responsiveBaseElement !== e
            ? (o = t(this.options.responsiveBaseElement).width())
            : e.innerWidth
            ? (o = e.innerWidth)
            : i.documentElement && i.documentElement.clientWidth
            ? (o = i.documentElement.clientWidth)
            : console.warn("Can not detect viewport width."),
          o
        );
      }),
      (s.prototype.replace = function (e) {
        this.$stage.empty(),
          (this._items = []),
          e && (e = e instanceof jQuery ? e : t(e)),
          this.settings.nestedItemSelector &&
            (e = e.find("." + this.settings.nestedItemSelector)),
          e
            .filter(function () {
              return 1 === this.nodeType;
            })
            .each(
              t.proxy(function (t, e) {
                (e = this.prepare(e)),
                  this.$stage.append(e),
                  this._items.push(e),
                  this._mergers.push(
                    1 *
                      e
                        .find("[data-merge]")
                        .addBack("[data-merge]")
                        .attr("data-merge") || 1
                  );
              }, this)
            ),
          this.reset(
            this.isNumeric(this.settings.startPosition)
              ? this.settings.startPosition
              : 0
          ),
          this.invalidate("items");
      }),
      (s.prototype.add = function (e, i) {
        var s = this.relative(this._current);
        (i = i === o ? this._items.length : this.normalize(i, !0)),
          (e = e instanceof jQuery ? e : t(e)),
          this.trigger("add", { content: e, position: i }),
          (e = this.prepare(e)),
          0 === this._items.length || i === this._items.length
            ? (0 === this._items.length && this.$stage.append(e),
              0 !== this._items.length && this._items[i - 1].after(e),
              this._items.push(e),
              this._mergers.push(
                1 *
                  e
                    .find("[data-merge]")
                    .addBack("[data-merge]")
                    .attr("data-merge") || 1
              ))
            : (this._items[i].before(e),
              this._items.splice(i, 0, e),
              this._mergers.splice(
                i,
                0,
                1 *
                  e
                    .find("[data-merge]")
                    .addBack("[data-merge]")
                    .attr("data-merge") || 1
              )),
          this._items[s] && this.reset(this._items[s].index()),
          this.invalidate("items"),
          this.trigger("added", { content: e, position: i });
      }),
      (s.prototype.remove = function (t) {
        (t = this.normalize(t, !0)) !== o &&
          (this.trigger("remove", { content: this._items[t], position: t }),
          this._items[t].remove(),
          this._items.splice(t, 1),
          this._mergers.splice(t, 1),
          this.invalidate("items"),
          this.trigger("removed", { content: null, position: t }));
      }),
      (s.prototype.preloadAutoWidthImages = function (e) {
        e.each(
          t.proxy(function (e, i) {
            this.enter("pre-loading"),
              (i = t(i)),
              t(new Image())
                .one(
                  "load",
                  t.proxy(function (t) {
                    i.attr("src", t.target.src),
                      i.css("opacity", 1),
                      this.leave("pre-loading"),
                      !this.is("pre-loading") &&
                        !this.is("initializing") &&
                        this.refresh();
                  }, this)
                )
                .attr(
                  "src",
                  i.attr("src") ||
                    i.attr("data-src") ||
                    i.attr("data-src-retina")
                );
          }, this)
        );
      }),
      (s.prototype.destroy = function () {
        for (var o in (this.$element.off(".owl.core"),
        this.$stage.off(".owl.core"),
        t(i).off(".owl.core"),
        !1 !== this.settings.responsive &&
          (e.clearTimeout(this.resizeTimer),
          this.off(e, "resize", this._handlers.onThrottledResize)),
        this._plugins))
          this._plugins[o].destroy();
        this.$stage.children(".cloned").remove(),
          this.$stage.unwrap(),
          this.$stage.children().contents().unwrap(),
          this.$stage.children().unwrap(),
          this.$stage.remove(),
          this.$element
            .removeClass(this.options.refreshClass)
            .removeClass(this.options.loadingClass)
            .removeClass(this.options.loadedClass)
            .removeClass(this.options.rtlClass)
            .removeClass(this.options.dragClass)
            .removeClass(this.options.grabClass)
            .attr(
              "class",
              this.$element
                .attr("class")
                .replace(
                  new RegExp(this.options.responsiveClass + "-\\S+\\s", "g"),
                  ""
                )
            )
            .removeData("owl.carousel");
      }),
      (s.prototype.op = function (t, e, i) {
        var o = this.settings.rtl;
        switch (e) {
          case "<":
            return o ? t > i : t < i;
          case ">":
            return o ? t < i : t > i;
          case ">=":
            return o ? t <= i : t >= i;
          case "<=":
            return o ? t >= i : t <= i;
        }
      }),
      (s.prototype.on = function (t, e, i, o) {
        t.addEventListener
          ? t.addEventListener(e, i, o)
          : t.attachEvent && t.attachEvent("on" + e, i);
      }),
      (s.prototype.off = function (t, e, i, o) {
        t.removeEventListener
          ? t.removeEventListener(e, i, o)
          : t.detachEvent && t.detachEvent("on" + e, i);
      }),
      (s.prototype.trigger = function (e, i, o, n, r) {
        var a = { item: { count: this._items.length, index: this.current() } },
          h = t.camelCase(
            t
              .grep(["on", e, o], function (t) {
                return t;
              })
              .join("-")
              .toLowerCase()
          ),
          l = t.Event(
            [e, "owl", o || "carousel"].join(".").toLowerCase(),
            t.extend({ relatedTarget: this }, a, i)
          );
        return (
          this._supress[e] ||
            (t.each(this._plugins, function (t, e) {
              e.onTrigger && e.onTrigger(l);
            }),
            this.register({ type: s.Type.Event, name: e }),
            this.$element.trigger(l),
            this.settings &&
              "function" == typeof this.settings[h] &&
              this.settings[h].call(this, l)),
          l
        );
      }),
      (s.prototype.enter = function (e) {
        t.each(
          [e].concat(this._states.tags[e] || []),
          t.proxy(function (t, e) {
            this._states.current[e] === o && (this._states.current[e] = 0),
              this._states.current[e]++;
          }, this)
        );
      }),
      (s.prototype.leave = function (e) {
        t.each(
          [e].concat(this._states.tags[e] || []),
          t.proxy(function (t, e) {
            this._states.current[e]--;
          }, this)
        );
      }),
      (s.prototype.register = function (e) {
        if (e.type === s.Type.Event) {
          if (
            (t.event.special[e.name] || (t.event.special[e.name] = {}),
            !t.event.special[e.name].owl)
          ) {
            var i = t.event.special[e.name]._default;
            (t.event.special[e.name]._default = function (t) {
              return !i ||
                !i.apply ||
                (t.namespace && -1 !== t.namespace.indexOf("owl"))
                ? t.namespace && t.namespace.indexOf("owl") > -1
                : i.apply(this, arguments);
            }),
              (t.event.special[e.name].owl = !0);
          }
        } else
          e.type === s.Type.State &&
            (this._states.tags[e.name]
              ? (this._states.tags[e.name] = this._states.tags[e.name].concat(
                  e.tags
                ))
              : (this._states.tags[e.name] = e.tags),
            (this._states.tags[e.name] = t.grep(
              this._states.tags[e.name],
              t.proxy(function (i, o) {
                return t.inArray(i, this._states.tags[e.name]) === o;
              }, this)
            )));
      }),
      (s.prototype.suppress = function (e) {
        t.each(
          e,
          t.proxy(function (t, e) {
            this._supress[e] = !0;
          }, this)
        );
      }),
      (s.prototype.release = function (e) {
        t.each(
          e,
          t.proxy(function (t, e) {
            delete this._supress[e];
          }, this)
        );
      }),
      (s.prototype.pointer = function (t) {
        var i = { x: null, y: null };
        return (
          (t =
            (t = t.originalEvent || t || e.event).touches && t.touches.length
              ? t.touches[0]
              : t.changedTouches && t.changedTouches.length
              ? t.changedTouches[0]
              : t).pageX
            ? ((i.x = t.pageX), (i.y = t.pageY))
            : ((i.x = t.clientX), (i.y = t.clientY)),
          i
        );
      }),
      (s.prototype.isNumeric = function (t) {
        return !isNaN(parseFloat(t));
      }),
      (s.prototype.difference = function (t, e) {
        return { x: t.x - e.x, y: t.y - e.y };
      }),
      (t.fn.owlCarousel = function (e) {
        var i = Array.prototype.slice.call(arguments, 1);
        return this.each(function () {
          var o = t(this),
            n = o.data("owl.carousel");
          n ||
            ((n = new s(this, "object" == typeof e && e)),
            o.data("owl.carousel", n),
            t.each(
              [
                "next",
                "prev",
                "to",
                "destroy",
                "refresh",
                "replace",
                "add",
                "remove",
              ],
              function (e, i) {
                n.register({ type: s.Type.Event, name: i }),
                  n.$element.on(
                    i + ".owl.carousel.core",
                    t.proxy(function (t) {
                      t.namespace &&
                        t.relatedTarget !== this &&
                        (this.suppress([i]),
                        n[i].apply(this, [].slice.call(arguments, 1)),
                        this.release([i]));
                    }, n)
                  );
              }
            )),
            "string" == typeof e && "_" !== e.charAt(0) && n[e].apply(n, i);
        });
      }),
      (t.fn.owlCarousel.Constructor = s);
  })(window.Zepto || window.jQuery, window, document),
  (function (t, e, i, o) {
    var s = function (e) {
      (this._core = e),
        (this._interval = null),
        (this._visible = null),
        (this._handlers = {
          "initialized.owl.carousel": t.proxy(function (t) {
            t.namespace && this._core.settings.autoRefresh && this.watch();
          }, this),
        }),
        (this._core.options = t.extend({}, s.Defaults, this._core.options)),
        this._core.$element.on(this._handlers);
    };
    (s.Defaults = { autoRefresh: !0, autoRefreshInterval: 500 }),
      (s.prototype.watch = function () {
        this._interval ||
          ((this._visible = this._core.isVisible()),
          (this._interval = e.setInterval(
            t.proxy(this.refresh, this),
            this._core.settings.autoRefreshInterval
          )));
      }),
      (s.prototype.refresh = function () {
        this._core.isVisible() !== this._visible &&
          ((this._visible = !this._visible),
          this._core.$element.toggleClass("owl-hidden", !this._visible),
          this._visible &&
            this._core.invalidate("width") &&
            this._core.refresh());
      }),
      (s.prototype.destroy = function () {
        var t, i;
        for (t in (e.clearInterval(this._interval), this._handlers))
          this._core.$element.off(t, this._handlers[t]);
        for (i in Object.getOwnPropertyNames(this))
          "function" != typeof this[i] && (this[i] = null);
      }),
      (t.fn.owlCarousel.Constructor.Plugins.AutoRefresh = s);
  })(window.Zepto || window.jQuery, window, document),
  (function (t, e, i, o) {
    var s = function (e) {
      (this._core = e),
        (this._loaded = []),
        (this._handlers = {
          "initialized.owl.carousel change.owl.carousel resized.owl.carousel":
            t.proxy(function (e) {
              if (
                e.namespace &&
                this._core.settings &&
                this._core.settings.lazyLoad &&
                ((e.property && "position" == e.property.name) ||
                  "initialized" == e.type)
              ) {
                var i = this._core.settings,
                  o = (i.center && Math.ceil(i.items / 2)) || i.items,
                  s = (i.center && -1 * o) || 0,
                  n =
                    (e.property && void 0 !== e.property.value
                      ? e.property.value
                      : this._core.current()) + s,
                  r = this._core.clones().length,
                  a = t.proxy(function (t, e) {
                    this.load(e);
                  }, this);
                for (
                  i.lazyLoadEager > 0 &&
                  ((o += i.lazyLoadEager),
                  i.loop && ((n -= i.lazyLoadEager), o++));
                  s++ < o;

                )
                  this.load(r / 2 + this._core.relative(n)),
                    r && t.each(this._core.clones(this._core.relative(n)), a),
                    n++;
              }
            }, this),
        }),
        (this._core.options = t.extend({}, s.Defaults, this._core.options)),
        this._core.$element.on(this._handlers);
    };
    (s.Defaults = { lazyLoad: !1, lazyLoadEager: 0 }),
      (s.prototype.load = function (i) {
        var o = this._core.$stage.children().eq(i),
          s = o && o.find(".owl-lazy");
        !s ||
          t.inArray(o.get(0), this._loaded) > -1 ||
          (s.each(
            t.proxy(function (i, o) {
              var s,
                n = t(o),
                r =
                  (e.devicePixelRatio > 1 && n.attr("data-src-retina")) ||
                  n.attr("data-src") ||
                  n.attr("data-srcset");
              this._core.trigger("load", { element: n, url: r }, "lazy"),
                n.is("img")
                  ? n
                      .one(
                        "load.owl.lazy",
                        t.proxy(function () {
                          n.css("opacity", 1),
                            this._core.trigger(
                              "loaded",
                              { element: n, url: r },
                              "lazy"
                            );
                        }, this)
                      )
                      .attr("src", r)
                  : n.is("source")
                  ? n
                      .one(
                        "load.owl.lazy",
                        t.proxy(function () {
                          this._core.trigger(
                            "loaded",
                            { element: n, url: r },
                            "lazy"
                          );
                        }, this)
                      )
                      .attr("srcset", r)
                  : (((s = new Image()).onload = t.proxy(function () {
                      n.css({
                        "background-image": 'url("' + r + '")',
                        opacity: "1",
                      }),
                        this._core.trigger(
                          "loaded",
                          { element: n, url: r },
                          "lazy"
                        );
                    }, this)),
                    (s.src = r));
            }, this)
          ),
          this._loaded.push(o.get(0)));
      }),
      (s.prototype.destroy = function () {
        var t, e;
        for (t in this.handlers) this._core.$element.off(t, this.handlers[t]);
        for (e in Object.getOwnPropertyNames(this))
          "function" != typeof this[e] && (this[e] = null);
      }),
      (t.fn.owlCarousel.Constructor.Plugins.Lazy = s);
  })(window.Zepto || window.jQuery, window, document),
  (function (t, e, i, o) {
    var s = function (i) {
      (this._core = i),
        (this._previousHeight = null),
        (this._handlers = {
          "initialized.owl.carousel refreshed.owl.carousel": t.proxy(function (
            t
          ) {
            t.namespace && this._core.settings.autoHeight && this.update();
          },
          this),
          "changed.owl.carousel": t.proxy(function (t) {
            t.namespace &&
              this._core.settings.autoHeight &&
              "position" === t.property.name &&
              this.update();
          }, this),
          "loaded.owl.lazy": t.proxy(function (t) {
            t.namespace &&
              this._core.settings.autoHeight &&
              t.element.closest("." + this._core.settings.itemClass).index() ===
                this._core.current() &&
              this.update();
          }, this),
        }),
        (this._core.options = t.extend({}, s.Defaults, this._core.options)),
        this._core.$element.on(this._handlers),
        (this._intervalId = null);
      var o = this;
      t(e).on("load", function () {
        o._core.settings.autoHeight && o.update();
      }),
        t(e).resize(function () {
          o._core.settings.autoHeight &&
            (null != o._intervalId && clearTimeout(o._intervalId),
            (o._intervalId = setTimeout(function () {
              o.update();
            }, 250)));
        });
    };
    (s.Defaults = { autoHeight: !1, autoHeightClass: "owl-height" }),
      (s.prototype.update = function () {
        var e = this._core._current,
          i = e + this._core.settings.items,
          o = this._core.settings.lazyLoad,
          s = this._core.$stage.children().toArray().slice(e, i),
          n = [],
          r = 0;
        t.each(s, function (e, i) {
          n.push(t(i).height());
        }),
          (r = Math.max.apply(null, n)) <= 1 &&
            o &&
            this._previousHeight &&
            (r = this._previousHeight),
          (this._previousHeight = r),
          this._core.$stage
            .parent()
            .height(r)
            .addClass(this._core.settings.autoHeightClass);
      }),
      (s.prototype.destroy = function () {
        var t, e;
        for (t in this._handlers) this._core.$element.off(t, this._handlers[t]);
        for (e in Object.getOwnPropertyNames(this))
          "function" != typeof this[e] && (this[e] = null);
      }),
      (t.fn.owlCarousel.Constructor.Plugins.AutoHeight = s);
  })(window.Zepto || window.jQuery, window, document),
  (function (t, e, i, o) {
    var s = function (e) {
      (this._core = e),
        (this._videos = {}),
        (this._playing = null),
        (this._handlers = {
          "initialized.owl.carousel": t.proxy(function (t) {
            t.namespace &&
              this._core.register({
                type: "state",
                name: "playing",
                tags: ["interacting"],
              });
          }, this),
          "resize.owl.carousel": t.proxy(function (t) {
            t.namespace &&
              this._core.settings.video &&
              this.isInFullScreen() &&
              t.preventDefault();
          }, this),
          "refreshed.owl.carousel": t.proxy(function (t) {
            t.namespace &&
              this._core.is("resizing") &&
              this._core.$stage.find(".cloned .owl-video-frame").remove();
          }, this),
          "changed.owl.carousel": t.proxy(function (t) {
            t.namespace &&
              "position" === t.property.name &&
              this._playing &&
              this.stop();
          }, this),
          "prepared.owl.carousel": t.proxy(function (e) {
            if (e.namespace) {
              var i = t(e.content).find(".owl-video");
              i.length &&
                (i.css("display", "none"), this.fetch(i, t(e.content)));
            }
          }, this),
        }),
        (this._core.options = t.extend({}, s.Defaults, this._core.options)),
        this._core.$element.on(this._handlers),
        this._core.$element.on(
          "click.owl.video",
          ".owl-video-play-icon",
          t.proxy(function (t) {
            this.play(t);
          }, this)
        );
    };
    (s.Defaults = { video: !1, videoHeight: !1, videoWidth: !1 }),
      (s.prototype.fetch = function (t, e) {
        var i = t.attr("data-vimeo-id")
            ? "vimeo"
            : t.attr("data-vzaar-id")
            ? "vzaar"
            : "youtube",
          o =
            t.attr("data-vimeo-id") ||
            t.attr("data-youtube-id") ||
            t.attr("data-vzaar-id"),
          s = t.attr("data-width") || this._core.settings.videoWidth,
          n = t.attr("data-height") || this._core.settings.videoHeight,
          r = t.attr("href");
        if (!r) throw new Error("Missing video URL.");
        if (
          (o = r.match(
            /(http:|https:|)\/\/(player.|www.|app.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com|be\-nocookie\.com)|vzaar\.com)\/(video\/|videos\/|embed\/|channels\/.+\/|groups\/.+\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/
          ))[3].indexOf("youtu") > -1
        )
          i = "youtube";
        else if (o[3].indexOf("vimeo") > -1) i = "vimeo";
        else {
          if (!(o[3].indexOf("vzaar") > -1))
            throw new Error("Video URL not supported.");
          i = "vzaar";
        }
        (o = o[6]),
          (this._videos[r] = { type: i, id: o, width: s, height: n }),
          e.attr("data-video", r),
          this.thumbnail(t, this._videos[r]);
      }),
      (s.prototype.thumbnail = function (e, i) {
        var o,
          s,
          n =
            i.width && i.height
              ? "width:" + i.width + "px;height:" + i.height + "px;"
              : "",
          r = e.find("img"),
          a = "src",
          h = "",
          l = this._core.settings,
          p = function (i) {
            (o = l.lazyLoad
              ? t("<div/>", { class: "owl-video-tn " + h, srcType: i })
              : t("<div/>", {
                  class: "owl-video-tn",
                  style: "opacity:1;background-image:url(" + i + ")",
                })),
              e.after(o),
              e.after('<div class="owl-video-play-icon"></div>');
          };
        if (
          (e.wrap(t("<div/>", { class: "owl-video-wrapper", style: n })),
          this._core.settings.lazyLoad && ((a = "data-src"), (h = "owl-lazy")),
          r.length)
        )
          return p(r.attr(a)), r.remove(), !1;
        "youtube" === i.type
          ? ((s = "//img.youtube.com/vi/" + i.id + "/hqdefault.jpg"), p(s))
          : "vimeo" === i.type
          ? t.ajax({
              type: "GET",
              url: "//vimeo.com/api/v2/video/" + i.id + ".json",
              jsonp: "callback",
              dataType: "jsonp",
              success: function (t) {
                (s = t[0].thumbnail_large), p(s);
              },
            })
          : "vzaar" === i.type &&
            t.ajax({
              type: "GET",
              url: "//vzaar.com/api/videos/" + i.id + ".json",
              jsonp: "callback",
              dataType: "jsonp",
              success: function (t) {
                (s = t.framegrab_url), p(s);
              },
            });
      }),
      (s.prototype.stop = function () {
        this._core.trigger("stop", null, "video"),
          this._playing.find(".owl-video-frame").remove(),
          this._playing.removeClass("owl-video-playing"),
          (this._playing = null),
          this._core.leave("playing"),
          this._core.trigger("stopped", null, "video");
      }),
      (s.prototype.play = function (e) {
        var i,
          o = t(e.target).closest("." + this._core.settings.itemClass),
          s = this._videos[o.attr("data-video")],
          n = s.width || "100%",
          r = s.height || this._core.$stage.height();
        this._playing ||
          (this._core.enter("playing"),
          this._core.trigger("play", null, "video"),
          (o = this._core.items(this._core.relative(o.index()))),
          this._core.reset(o.index()),
          (i = t(
            '<iframe frameborder="0" allowfullscreen mozallowfullscreen webkitAllowFullScreen ></iframe>'
          )).attr("height", r),
          i.attr("width", n),
          "youtube" === s.type
            ? i.attr(
                "src",
                "//www.youtube.com/embed/" +
                  s.id +
                  "?autoplay=1&rel=0&v=" +
                  s.id
              )
            : "vimeo" === s.type
            ? i.attr("src", "//player.vimeo.com/video/" + s.id + "?autoplay=1")
            : "vzaar" === s.type &&
              i.attr(
                "src",
                "//view.vzaar.com/" + s.id + "/player?autoplay=true"
              ),
          t(i)
            .wrap('<div class="owl-video-frame" />')
            .insertAfter(o.find(".owl-video")),
          (this._playing = o.addClass("owl-video-playing")));
      }),
      (s.prototype.isInFullScreen = function () {
        var e =
          i.fullscreenElement ||
          i.mozFullScreenElement ||
          i.webkitFullscreenElement;
        return e && t(e).parent().hasClass("owl-video-frame");
      }),
      (s.prototype.destroy = function () {
        var t, e;
        for (t in (this._core.$element.off("click.owl.video"), this._handlers))
          this._core.$element.off(t, this._handlers[t]);
        for (e in Object.getOwnPropertyNames(this))
          "function" != typeof this[e] && (this[e] = null);
      }),
      (t.fn.owlCarousel.Constructor.Plugins.Video = s);
  })(window.Zepto || window.jQuery, window, document),
  (function (t, e, i, o) {
    var s = function (e) {
      (this.core = e),
        (this.core.options = t.extend({}, s.Defaults, this.core.options)),
        (this.swapping = !0),
        (this.previous = o),
        (this.next = o),
        (this.handlers = {
          "change.owl.carousel": t.proxy(function (t) {
            t.namespace &&
              "position" == t.property.name &&
              ((this.previous = this.core.current()),
              (this.next = t.property.value));
          }, this),
          "drag.owl.carousel dragged.owl.carousel translated.owl.carousel":
            t.proxy(function (t) {
              t.namespace && (this.swapping = "translated" == t.type);
            }, this),
          "translate.owl.carousel": t.proxy(function (t) {
            t.namespace &&
              this.swapping &&
              (this.core.options.animateOut || this.core.options.animateIn) &&
              this.swap();
          }, this),
        }),
        this.core.$element.on(this.handlers);
    };
    (s.Defaults = { animateOut: !1, animateIn: !1 }),
      (s.prototype.swap = function () {
        if (
          1 === this.core.settings.items &&
          t.support.animation &&
          t.support.transition
        ) {
          this.core.speed(0);
          var e,
            i = t.proxy(this.clear, this),
            o = this.core.$stage.children().eq(this.previous),
            s = this.core.$stage.children().eq(this.next),
            n = this.core.settings.animateIn,
            r = this.core.settings.animateOut;
          this.core.current() !== this.previous &&
            (r &&
              ((e =
                this.core.coordinates(this.previous) -
                this.core.coordinates(this.next)),
              o
                .one(t.support.animation.end, i)
                .css({ left: e + "px" })
                .addClass("animated owl-animated-out")
                .addClass(r)),
            n &&
              s
                .one(t.support.animation.end, i)
                .addClass("animated owl-animated-in")
                .addClass(n));
        }
      }),
      (s.prototype.clear = function (e) {
        t(e.target)
          .css({ left: "" })
          .removeClass("animated owl-animated-out owl-animated-in")
          .removeClass(this.core.settings.animateIn)
          .removeClass(this.core.settings.animateOut),
          this.core.onTransitionEnd();
      }),
      (s.prototype.destroy = function () {
        var t, e;
        for (t in this.handlers) this.core.$element.off(t, this.handlers[t]);
        for (e in Object.getOwnPropertyNames(this))
          "function" != typeof this[e] && (this[e] = null);
      }),
      (t.fn.owlCarousel.Constructor.Plugins.Animate = s);
  })(window.Zepto || window.jQuery, window, document),
  (function (t, e, i, o) {
    var s = function (e) {
      (this._core = e),
        (this._call = null),
        (this._time = 0),
        (this._timeout = 0),
        (this._paused = !0),
        (this._handlers = {
          "changed.owl.carousel": t.proxy(function (t) {
            t.namespace && "settings" === t.property.name
              ? this._core.settings.autoplay
                ? this.play()
                : this.stop()
              : t.namespace &&
                "position" === t.property.name &&
                this._paused &&
                (this._time = 0);
          }, this),
          "initialized.owl.carousel": t.proxy(function (t) {
            t.namespace && this._core.settings.autoplay && this.play();
          }, this),
          "play.owl.autoplay": t.proxy(function (t, e, i) {
            t.namespace && this.play(e, i);
          }, this),
          "stop.owl.autoplay": t.proxy(function (t) {
            t.namespace && this.stop();
          }, this),
          "mouseover.owl.autoplay": t.proxy(function () {
            this._core.settings.autoplayHoverPause &&
              this._core.is("rotating") &&
              this.pause();
          }, this),
          "mouseleave.owl.autoplay": t.proxy(function () {
            this._core.settings.autoplayHoverPause &&
              this._core.is("rotating") &&
              this.play();
          }, this),
          "touchstart.owl.core": t.proxy(function () {
            this._core.settings.autoplayHoverPause &&
              this._core.is("rotating") &&
              this.pause();
          }, this),
          "touchend.owl.core": t.proxy(function () {
            this._core.settings.autoplayHoverPause && this.play();
          }, this),
        }),
        this._core.$element.on(this._handlers),
        (this._core.options = t.extend({}, s.Defaults, this._core.options));
    };
    (s.Defaults = {
      autoplay: !1,
      autoplayTimeout: 5e3,
      autoplayHoverPause: !1,
      autoplaySpeed: !1,
    }),
      (s.prototype._next = function (o) {
        (this._call = e.setTimeout(
          t.proxy(this._next, this, o),
          this._timeout * (Math.round(this.read() / this._timeout) + 1) -
            this.read()
        )),
          this._core.is("interacting") ||
            i.hidden ||
            this._core.next(o || this._core.settings.autoplaySpeed);
      }),
      (s.prototype.read = function () {
        return new Date().getTime() - this._time;
      }),
      (s.prototype.play = function (i, o) {
        var s;
        this._core.is("rotating") || this._core.enter("rotating"),
          (i = i || this._core.settings.autoplayTimeout),
          (s = Math.min(this._time % (this._timeout || i), i)),
          this._paused
            ? ((this._time = this.read()), (this._paused = !1))
            : e.clearTimeout(this._call),
          (this._time += (this.read() % i) - s),
          (this._timeout = i),
          (this._call = e.setTimeout(t.proxy(this._next, this, o), i - s));
      }),
      (s.prototype.stop = function () {
        this._core.is("rotating") &&
          ((this._time = 0),
          (this._paused = !0),
          e.clearTimeout(this._call),
          this._core.leave("rotating"));
      }),
      (s.prototype.pause = function () {
        this._core.is("rotating") &&
          !this._paused &&
          ((this._time = this.read()),
          (this._paused = !0),
          e.clearTimeout(this._call));
      }),
      (s.prototype.destroy = function () {
        var t, e;
        for (t in (this.stop(), this._handlers))
          this._core.$element.off(t, this._handlers[t]);
        for (e in Object.getOwnPropertyNames(this))
          "function" != typeof this[e] && (this[e] = null);
      }),
      (t.fn.owlCarousel.Constructor.Plugins.autoplay = s);
  })(window.Zepto || window.jQuery, window, document),
  (function (t, e, i, o) {
    "use strict";
    var s = function (e) {
      (this._core = e),
        (this._initialized = !1),
        (this._pages = []),
        (this._controls = {}),
        (this._templates = []),
        (this.$element = this._core.$element),
        (this._overrides = {
          next: this._core.next,
          prev: this._core.prev,
          to: this._core.to,
        }),
        (this._handlers = {
          "prepared.owl.carousel": t.proxy(function (e) {
            e.namespace &&
              this._core.settings.dotsData &&
              this._templates.push(
                '<div class="' +
                  this._core.settings.dotClass +
                  '">' +
                  t(e.content)
                    .find("[data-dot]")
                    .addBack("[data-dot]")
                    .attr("data-dot") +
                  "</div>"
              );
          }, this),
          "added.owl.carousel": t.proxy(function (t) {
            t.namespace &&
              this._core.settings.dotsData &&
              this._templates.splice(t.position, 0, this._templates.pop());
          }, this),
          "remove.owl.carousel": t.proxy(function (t) {
            t.namespace &&
              this._core.settings.dotsData &&
              this._templates.splice(t.position, 1);
          }, this),
          "changed.owl.carousel": t.proxy(function (t) {
            t.namespace && "position" == t.property.name && this.draw();
          }, this),
          "initialized.owl.carousel": t.proxy(function (t) {
            t.namespace &&
              !this._initialized &&
              (this._core.trigger("initialize", null, "navigation"),
              this.initialize(),
              this.update(),
              this.draw(),
              (this._initialized = !0),
              this._core.trigger("initialized", null, "navigation"));
          }, this),
          "refreshed.owl.carousel": t.proxy(function (t) {
            t.namespace &&
              this._initialized &&
              (this._core.trigger("refresh", null, "navigation"),
              this.update(),
              this.draw(),
              this._core.trigger("refreshed", null, "navigation"));
          }, this),
        }),
        (this._core.options = t.extend({}, s.Defaults, this._core.options)),
        this.$element.on(this._handlers);
    };
    (s.Defaults = {
      nav: !1,
      navText: [
        '<span aria-label="Previous">&#x2039;</span>',
        '<span aria-label="Next">&#x203a;</span>',
      ],
      navSpeed: !1,
      navElement: 'button type="button" title="nav" role="presentation"',
      navContainer: !1,
      navContainerClass: "owl-nav",
      navClass: ["owl-prev", "owl-next"],
      slideBy: 1,
      dotClass: "owl-dot",
      dotsClass: "owl-dots",
      dots: !0,
      dotsEach: !1,
      dotsData: !1,
      dotsSpeed: !1,
      dotsContainer: !1,
    }),
      (s.prototype.initialize = function () {
        var e,
          i = this._core.settings;
        for (e in ((this._controls.$relative = (
          i.navContainer
            ? t(i.navContainer)
            : t("<div>").addClass(i.navContainerClass).appendTo(this.$element)
        ).addClass("disabled")),
        (this._controls.$previous = t("<" + i.navElement + ">")
          .addClass(i.navClass[0])
          .html(i.navText[0])
          .prependTo(this._controls.$relative)
          .on(
            "click",
            t.proxy(function (t) {
              this.prev(i.navSpeed);
            }, this)
          )),
        (this._controls.$next = t("<" + i.navElement + ">")
          .addClass(i.navClass[1])
          .html(i.navText[1])
          .appendTo(this._controls.$relative)
          .on(
            "click",
            t.proxy(function (t) {
              this.next(i.navSpeed);
            }, this)
          )),
        i.dotsData ||
          (this._templates = [
            t('<button role="button" title="dot">')
              .addClass(i.dotClass)
              .append(t("<span>"))
              .prop("outerHTML"),
          ]),
        (this._controls.$absolute = (
          i.dotsContainer
            ? t(i.dotsContainer)
            : t("<div>").addClass(i.dotsClass).appendTo(this.$element)
        ).addClass("disabled")),
        this._controls.$absolute.on(
          "click",
          "button",
          t.proxy(function (e) {
            var o = t(e.target).parent().is(this._controls.$absolute)
              ? t(e.target).index()
              : t(e.target).parent().index();
            e.preventDefault(), this.to(o, i.dotsSpeed);
          }, this)
        ),
        this._overrides))
          this._core[e] = t.proxy(this[e], this);
      }),
      (s.prototype.destroy = function () {
        var t, e, i, o, s;
        for (t in ((s = this._core.settings), this._handlers))
          this.$element.off(t, this._handlers[t]);
        for (e in this._controls)
          "$relative" === e && s.navContainer
            ? this._controls[e].html("")
            : this._controls[e].remove();
        for (o in this.overides) this._core[o] = this._overrides[o];
        for (i in Object.getOwnPropertyNames(this))
          "function" != typeof this[i] && (this[i] = null);
      }),
      (s.prototype.update = function () {
        var t,
          e,
          i = this._core.clones().length / 2,
          o = i + this._core.items().length,
          s = this._core.maximum(!0),
          n = this._core.settings,
          r = n.center || n.autoWidth || n.dotsData ? 1 : n.dotsEach || n.items;
        if (
          ("page" !== n.slideBy && (n.slideBy = Math.min(n.slideBy, n.items)),
          n.dots || "page" == n.slideBy)
        )
          for (this._pages = [], t = i, e = 0; t < o; t++) {
            if (e >= r || 0 === e) {
              if (
                (this._pages.push({
                  start: Math.min(s, t - i),
                  end: t - i + r - 1,
                }),
                Math.min(s, t - i) === s)
              )
                break;
              e = 0;
            }
            e += this._core.mergers(this._core.relative(t));
          }
      }),
      (s.prototype.draw = function () {
        var e,
          i = this._core.settings,
          o = this._core.items().length <= i.items,
          s = this._core.relative(this._core.current()),
          n = i.loop || i.rewind;
        this._controls.$relative.toggleClass("disabled", !i.nav || o),
          i.nav &&
            (this._controls.$previous.toggleClass(
              "disabled",
              !n && s <= this._core.minimum(!0)
            ),
            this._controls.$next.toggleClass(
              "disabled",
              !n && s >= this._core.maximum(!0)
            )),
          this._controls.$absolute.toggleClass("disabled", !i.dots || o),
          i.dots &&
            ((e =
              this._pages.length - this._controls.$absolute.children().length),
            i.dotsData && 0 !== e
              ? this._controls.$absolute.html(this._templates.join(""))
              : e > 0
              ? this._controls.$absolute.append(
                  new Array(e + 1).join(this._templates[0])
                )
              : e < 0 && this._controls.$absolute.children().slice(e).remove(),
            this._controls.$absolute.find(".active").removeClass("active"),
            this._controls.$absolute
              .children()
              .eq(t.inArray(this.current(), this._pages))
              .addClass("active"));
      }),
      (s.prototype.onTrigger = function (e) {
        var i = this._core.settings;
        e.page = {
          index: t.inArray(this.current(), this._pages),
          count: this._pages.length,
          size:
            i &&
            (i.center || i.autoWidth || i.dotsData ? 1 : i.dotsEach || i.items),
        };
      }),
      (s.prototype.current = function () {
        var e = this._core.relative(this._core.current());
        return t
          .grep(
            this._pages,
            t.proxy(function (t, i) {
              return t.start <= e && t.end >= e;
            }, this)
          )
          .pop();
      }),
      (s.prototype.getPosition = function (e) {
        var i,
          o,
          s = this._core.settings;
        return (
          "page" == s.slideBy
            ? ((i = t.inArray(this.current(), this._pages)),
              (o = this._pages.length),
              e ? ++i : --i,
              (i = this._pages[((i % o) + o) % o].start))
            : ((i = this._core.relative(this._core.current())),
              (o = this._core.items().length),
              e ? (i += s.slideBy) : (i -= s.slideBy)),
          i
        );
      }),
      (s.prototype.next = function (e) {
        t.proxy(this._overrides.to, this._core)(this.getPosition(!0), e);
      }),
      (s.prototype.prev = function (e) {
        t.proxy(this._overrides.to, this._core)(this.getPosition(!1), e);
      }),
      (s.prototype.to = function (e, i, o) {
        var s;
        !o && this._pages.length
          ? ((s = this._pages.length),
            t.proxy(this._overrides.to, this._core)(
              this._pages[((e % s) + s) % s].start,
              i
            ))
          : t.proxy(this._overrides.to, this._core)(e, i);
      }),
      (t.fn.owlCarousel.Constructor.Plugins.Navigation = s);
  })(window.Zepto || window.jQuery, window, document),
  (function (t, e, i, o) {
    "use strict";
    var s = function (i) {
      (this._core = i),
        (this._hashes = {}),
        (this.$element = this._core.$element),
        (this._handlers = {
          "initialized.owl.carousel": t.proxy(function (i) {
            i.namespace &&
              "URLHash" === this._core.settings.startPosition &&
              t(e).trigger("hashchange.owl.navigation");
          }, this),
          "prepared.owl.carousel": t.proxy(function (e) {
            if (e.namespace) {
              var i = t(e.content)
                .find("[data-hash]")
                .addBack("[data-hash]")
                .attr("data-hash");
              if (!i) return;
              this._hashes[i] = e.content;
            }
          }, this),
          "changed.owl.carousel": t.proxy(function (i) {
            if (i.namespace && "position" === i.property.name) {
              var o = this._core.items(
                  this._core.relative(this._core.current())
                ),
                s = t
                  .map(this._hashes, function (t, e) {
                    return t === o ? e : null;
                  })
                  .join();
              if (!s || e.location.hash.slice(1) === s) return;
              e.location.hash = s;
            }
          }, this),
        }),
        (this._core.options = t.extend({}, s.Defaults, this._core.options)),
        this.$element.on(this._handlers),
        t(e).on(
          "hashchange.owl.navigation",
          t.proxy(function (t) {
            var i = e.location.hash.substring(1),
              o = this._core.$stage.children(),
              s = this._hashes[i] && o.index(this._hashes[i]);
            void 0 !== s &&
              s !== this._core.current() &&
              this._core.to(this._core.relative(s), !1, !0);
          }, this)
        );
    };
    (s.Defaults = { URLhashListener: !1 }),
      (s.prototype.destroy = function () {
        var i, o;
        for (i in (t(e).off("hashchange.owl.navigation"), this._handlers))
          this._core.$element.off(i, this._handlers[i]);
        for (o in Object.getOwnPropertyNames(this))
          "function" != typeof this[o] && (this[o] = null);
      }),
      (t.fn.owlCarousel.Constructor.Plugins.Hash = s);
  })(window.Zepto || window.jQuery, window, document),
  (function (t, e, i, o) {
    function s(e, i) {
      var o = !1,
        s = e.charAt(0).toUpperCase() + e.slice(1);
      return (
        t.each((e + " " + a.join(s + " ") + s).split(" "), function (t, e) {
          if (void 0 !== r[e]) return (o = !i || e), !1;
        }),
        o
      );
    }
    function n(t) {
      return s(t, !0);
    }
    var r = t("<support>").get(0).style,
      a = "Webkit Moz O ms".split(" "),
      h = {
        transition: {
          end: {
            WebkitTransition: "webkitTransitionEnd",
            MozTransition: "transitionend",
            OTransition: "oTransitionEnd",
            transition: "transitionend",
          },
        },
        animation: {
          end: {
            WebkitAnimation: "webkitAnimationEnd",
            MozAnimation: "animationend",
            OAnimation: "oAnimationEnd",
            animation: "animationend",
          },
        },
      };
    !!s("transition") &&
      ((t.support.transition = new String(n("transition"))),
      (t.support.transition.end = h.transition.end[t.support.transition])),
      !!s("animation") &&
        ((t.support.animation = new String(n("animation"))),
        (t.support.animation.end = h.animation.end[t.support.animation])),
      s("transform") &&
        ((t.support.transform = new String(n("transform"))),
        (t.support.transform3d = !!s("perspective")));
  })(window.Zepto || window.jQuery, window, document),
  (function (t, e) {
    "use strict";
    var i,
      o,
      s,
      n,
      r,
      a,
      h,
      l,
      p,
      c,
      d,
      u,
      m,
      f,
      g,
      w =
        ((i = "sf-breadcrumb"),
        (o = "sf-js-enabled"),
        "sf-with-ul",
        "sf-arrows",
        (s = (function () {
          var e = /^(?![\w\W]*Windows Phone)[\w\W]*(iPhone|iPad|iPod)/i.test(
            navigator.userAgent
          );
          return e && t("html").css("cursor", "pointer").on("click", t.noop), e;
        })()),
        (n = (function () {
          var t = document.documentElement.style;
          return (
            "behavior" in t &&
            "fill" in t &&
            /iemobile/i.test(navigator.userAgent)
          );
        })()),
        (r = !!e.PointerEvent),
        (a = function (t, e, i) {
          var s = o;
          e.cssArrows && (s += " sf-arrows"),
            t[i ? "addClass" : "removeClass"](s);
        }),
        (h = function (t, e) {
          var i = e ? "addClass" : "removeClass";
          t.children("a")[i]("sf-with-ul");
        }),
        (l = function (t) {
          var e = t.css("ms-touch-action"),
            i = t.css("touch-action");
          (i = "pan-y" === (i = i || e) ? "auto" : "pan-y"),
            t.css({ "ms-touch-action": i, "touch-action": i });
        }),
        (p = function (t) {
          return t.closest("." + o);
        }),
        (c = function (t) {
          return p(t).data("sfOptions");
        }),
        (d = function () {
          var e = t(this),
            i = c(e);
          clearTimeout(i.sfTimer),
            e.siblings().superfish("hide").end().superfish("show");
        }),
        (u = function (e) {
          (e.retainPath = t.inArray(this[0], e.$path) > -1),
            this.superfish("hide"),
            this.parents("." + e.hoverClass).length ||
              (e.onIdle.call(p(this)), e.$path.length && t.proxy(d, e.$path)());
        }),
        (m = function () {
          var e = t(this),
            i = c(e);
          s
            ? t.proxy(u, e, i)()
            : (clearTimeout(i.sfTimer),
              (i.sfTimer = setTimeout(t.proxy(u, e, i), i.delay)));
        }),
        (f = function (e) {
          var i = t(this),
            o = c(i),
            s = i.siblings(e.data.popUpSelector);
          return !1 === o.onHandleTouch.call(s)
            ? this
            : void (
                s.length > 0 &&
                s.is(":hidden") &&
                (i.one("click.superfish", !1),
                "MSPointerDown" === e.type || "pointerdown" === e.type
                  ? i.trigger("focus")
                  : t.proxy(d, i.parent("li"))())
              );
        }),
        (g = function (e, i) {
          var o = "li:has(" + i.popUpSelector + ")";
          t.fn.hoverIntent && !i.disableHI
            ? e.hoverIntent(d, m, o)
            : e
                .on("mouseenter.superfish", o, d)
                .on("mouseleave.superfish", o, m);
          var a = "MSPointerDown.superfish";
          r && (a = "pointerdown.superfish"),
            s || (a += " touchend.superfish"),
            n && (a += " mousedown.superfish"),
            e
              .on("focusin.superfish", "li", d)
              .on("focusout.superfish", "li", m)
              .on(a, "a", i, f);
        }),
        {
          hide: function (e) {
            if (this.length) {
              var i = c(this);
              if (!i) return this;
              var o = !0 === i.retainPath ? i.$path : "",
                s = this.find("li." + i.hoverClass)
                  .add(this)
                  .not(o)
                  .removeClass(i.hoverClass)
                  .children(i.popUpSelector),
                n = i.speedOut;
              if (
                (e && (s.show(), (n = 0)),
                (i.retainPath = !1),
                !1 === i.onBeforeHide.call(s))
              )
                return this;
              s.stop(!0, !0).animate(i.animationOut, n, function () {
                var e = t(this);
                i.onHide.call(e);
              });
            }
            return this;
          },
          show: function () {
            var t = c(this);
            if (!t) return this;
            var e = this.addClass(t.hoverClass).children(t.popUpSelector);
            return (
              !1 === t.onBeforeShow.call(e) ||
                e.stop(!0, !0).animate(t.animation, t.speed, function () {
                  t.onShow.call(e);
                }),
              this
            );
          },
          destroy: function () {
            return this.each(function () {
              var e,
                o = t(this),
                s = o.data("sfOptions");
              return (
                !!s &&
                ((e = o.find(s.popUpSelector).parent("li")),
                clearTimeout(s.sfTimer),
                a(o, s),
                h(e),
                l(o),
                o.off(".superfish").off(".hoverIntent"),
                e.children(s.popUpSelector).attr("style", function (t, e) {
                  if (void 0 !== e) return e.replace(/display[^;]+;?/g, "");
                }),
                s.$path
                  .removeClass(s.hoverClass + " " + i)
                  .addClass(s.pathClass),
                o.find("." + s.hoverClass).removeClass(s.hoverClass),
                s.onDestroy.call(o),
                void o.removeData("sfOptions"))
              );
            });
          },
          init: function (e) {
            return this.each(function () {
              var o = t(this);
              if (o.data("sfOptions")) return !1;
              var s = t.extend({}, t.fn.superfish.defaults, e),
                n = o.find(s.popUpSelector).parent("li");
              (s.$path = (function (e, o) {
                return e
                  .find("li." + o.pathClass)
                  .slice(0, o.pathLevels)
                  .addClass(o.hoverClass + " " + i)
                  .filter(function () {
                    return t(this)
                      .children(o.popUpSelector)
                      .hide()
                      .show().length;
                  })
                  .removeClass(o.pathClass);
              })(o, s)),
                o.data("sfOptions", s),
                a(o, s, !0),
                h(n, !0),
                l(o),
                g(o, s),
                n.not("." + i).superfish("hide", !0),
                s.onInit.call(this);
            });
          },
        });
    (t.fn.superfish = function (e, i) {
      return w[e]
        ? w[e].apply(this, Array.prototype.slice.call(arguments, 1))
        : "object" != typeof e && e
        ? t.error("Method " + e + " does not exist on jQuery.fn.superfish")
        : w.init.apply(this, arguments);
    }),
      (t.fn.superfish.defaults = {
        popUpSelector: "ul,.sf-mega",
        hoverClass: "sfHover",
        pathClass: "overrideThisToUse",
        pathLevels: 1,
        delay: 800,
        animation: { opacity: "show" },
        animationOut: { opacity: "hide" },
        speed: "normal",
        speedOut: "fast",
        cssArrows: !0,
        disableHI: !1,
        onInit: t.noop,
        onBeforeShow: t.noop,
        onShow: t.noop,
        onBeforeHide: t.noop,
        onHide: t.noop,
        onIdle: t.noop,
        onDestroy: t.noop,
        onHandleTouch: t.noop,
      });
  })(jQuery, window),
  "function" != typeof Object.create &&
    (Object.create = function (t) {
      function e() {}
      return (e.prototype = t), new e();
    }),
  (function (t, e, i, o) {
    var s = {
      init: function (e, i) {
        var o = this;
        (o.elem = i),
          (o.$elem = t(i)),
          (o.imageSrc = o.$elem.data("zoom-image")
            ? o.$elem.data("zoom-image")
            : o.$elem.attr("src")),
          (o.options = t.extend({}, t.fn.elevateZoom.options, e)),
          o.options.tint &&
            ((o.options.lensColour = "none"), (o.options.lensOpacity = "1")),
          "inner" == o.options.zoomType && (o.options.showLens = !1),
          o.options.zoomContainer
            ? (o.$container = t(o.options.zoomContainer))
            : (o.$container = t("body")),
          o.$elem.parent().removeAttr("title").removeAttr("alt"),
          (o.zoomImage = o.imageSrc),
          o.refresh(1),
          t("#" + o.options.gallery + " a").click(function (e) {
            return (
              o.options.galleryActiveClass &&
                (t("#" + o.options.gallery + " a").removeClass(
                  o.options.galleryActiveClass
                ),
                t(this).addClass(o.options.galleryActiveClass)),
              e.preventDefault(),
              t(this).data("zoom-image")
                ? (o.zoomImagePre = t(this).data("zoom-image"))
                : (o.zoomImagePre = t(this).data("image")),
              o.swaptheimage(t(this).data("image"), o.zoomImagePre),
              !1
            );
          });
      },
      refresh: function (t) {
        var e = this;
        setTimeout(function () {
          e.fetch(e.imageSrc);
        }, t || e.options.refresh);
      },
      fetch: function (t) {
        var e = this,
          i = new Image();
        (i.onload = function () {
          (e.largeWidth = i.width),
            (e.largeHeight = i.height),
            e.startZoom(),
            (e.currentImage = e.imageSrc),
            e.options.onZoomedImageLoaded(e.$elem);
        }),
          (i.src = t);
      },
      startZoom: function () {
        var e = this;
        if (
          ((e.nzWidth = e.$elem.width()),
          (e.nzHeight = e.$elem.height()),
          (e.isWindowActive = !1),
          (e.isLensActive = !1),
          (e.isTintActive = !1),
          (e.overWindow = !1),
          e.options.imageCrossfade &&
            ((e.zoomWrap = e.$elem.wrap(
              '<div style="height:' +
                e.nzHeight +
                "px;width:" +
                e.nzWidth +
                'px;" class="zoomWrapper" />'
            )),
            e.$elem.css("position", "absolute")),
          (e.zoomLock = 1),
          (e.scrollingLock = !1),
          (e.changeBgSize = !1),
          (e.currentZoomLevel = e.options.zoomLevel),
          (e.nzOffset = e.$elem.offset()),
          (e.ctOffset = e.$container.offset()),
          (e.widthRatio = e.largeWidth / e.currentZoomLevel / e.nzWidth),
          (e.heightRatio = e.largeHeight / e.currentZoomLevel / e.nzHeight),
          "window" == e.options.zoomType &&
            (e.zoomWindowStyle =
              "overflow: hidden;background-position: 0px 0px;text-align:center;background-color: " +
              String(e.options.zoomWindowBgColour) +
              ";width: " +
              String(e.options.zoomWindowWidth) +
              "px;height: " +
              String(e.options.zoomWindowHeight) +
              "px;float: left;background-size: " +
              e.largeWidth / e.currentZoomLevel +
              "px " +
              e.largeHeight / e.currentZoomLevel +
              "px;display: none;z-index:100;border: " +
              String(e.options.borderSize) +
              "px solid " +
              e.options.borderColour +
              ";background-repeat: no-repeat;position: absolute;"),
          "inner" == e.options.zoomType)
        ) {
          var i = e.$elem.css("border-left-width");
          e.zoomWindowStyle =
            "overflow: hidden;margin-left: " +
            String(i) +
            ";margin-top: " +
            String(i) +
            ";background-position: 0px 0px;width: " +
            String(e.nzWidth) +
            "px;height: " +
            String(e.nzHeight) +
            "px;px;float: left;display: none;cursor:" +
            e.options.cursor +
            ";px solid " +
            e.options.borderColour +
            ";background-repeat: no-repeat;position: absolute;";
        }
        "window" == e.options.zoomType &&
          (e.nzHeight < e.options.zoomWindowWidth / e.widthRatio
            ? (lensHeight = e.nzHeight)
            : (lensHeight = String(e.options.zoomWindowHeight / e.heightRatio)),
          e.largeWidth < e.options.zoomWindowWidth
            ? (lensWidth = e.nzWidth)
            : (lensWidth = e.options.zoomWindowWidth / e.widthRatio),
          (e.lensStyle =
            "background-position: 0px 0px;width: " +
            String(e.options.zoomWindowWidth / e.widthRatio) +
            "px;height: " +
            String(e.options.zoomWindowHeight / e.heightRatio) +
            "px;float: right;display: none;overflow: hidden;z-index: 999;-webkit-transform: translateZ(0);opacity:" +
            e.options.lensOpacity +
            ";filter: alpha(opacity = " +
            100 * e.options.lensOpacity +
            "); zoom:1;width:" +
            lensWidth +
            "px;height:" +
            lensHeight +
            "px;background-color:" +
            e.options.lensColour +
            ";cursor:" +
            e.options.cursor +
            ";border: " +
            e.options.lensBorderSize +
            "px solid " +
            e.options.lensBorderColour +
            ";background-repeat: no-repeat;position: absolute;")),
          (e.tintStyle =
            "display: block;position: absolute;background-color: " +
            e.options.tintColour +
            ";filter:alpha(opacity=0);opacity: 0;width: " +
            e.nzWidth +
            "px;height: " +
            e.nzHeight +
            "px;"),
          (e.lensRound = ""),
          "lens" == e.options.zoomType &&
            (e.lensStyle =
              "background-position: 0px 0px;float: left;display: none;border: " +
              String(e.options.borderSize) +
              "px solid " +
              e.options.borderColour +
              ";width:" +
              String(e.options.lensSize) +
              "px;height:" +
              String(e.options.lensSize) +
              "px;background-repeat: no-repeat;position: absolute;"),
          "round" == e.options.lensShape &&
            (e.lensRound =
              "border-top-left-radius: " +
              String(e.options.lensSize / 2 + e.options.borderSize) +
              "px;border-top-right-radius: " +
              String(e.options.lensSize / 2 + e.options.borderSize) +
              "px;border-bottom-left-radius: " +
              String(e.options.lensSize / 2 + e.options.borderSize) +
              "px;border-bottom-right-radius: " +
              String(e.options.lensSize / 2 + e.options.borderSize) +
              "px;"),
          void 0 !== e.ctOffset &&
            ((e.zoomContainer = t(
              '<div class="zoomContainer" style="-webkit-transform: translateZ(0);position:absolute;left:' +
                (e.nzOffset.left - e.ctOffset.left) +
                "px;top:" +
                (e.nzOffset.top - e.ctOffset.top) +
                "px;height:" +
                e.nzHeight +
                "px;width:" +
                e.nzWidth +
                'px;"></div>'
            )),
            e.$container.append(e.zoomContainer),
            e.options.containLensZoom &&
              "lens" == e.options.zoomType &&
              e.zoomContainer.css("overflow", "hidden"),
            "inner" != e.options.zoomType &&
              ((e.zoomLens = t(
                "<div class='zoomLens' style='" +
                  e.lensStyle +
                  e.lensRound +
                  "'>&nbsp;</div>"
              )
                .appendTo(e.zoomContainer)
                .click(function () {
                  e.$elem.trigger("click");
                })),
              e.options.tint &&
                ((e.tintContainer = t("<div/>").addClass("tintContainer")),
                (e.zoomTint = t(
                  "<div class='zoomTint' style='" + e.tintStyle + "'></div>"
                )),
                e.zoomLens.wrap(e.tintContainer),
                (e.zoomTintcss = e.zoomLens.after(e.zoomTint)),
                (e.zoomTintImage = t(
                  '<img style="position: absolute; left: 0px; top: 0px; max-width: none; width: ' +
                    e.nzWidth +
                    "px; height: " +
                    e.nzHeight +
                    'px;" src="' +
                    e.imageSrc +
                    '">'
                )
                  .appendTo(e.zoomLens)
                  .click(function () {
                    e.$elem.trigger("click");
                  })))),
            isNaN(e.options.zoomWindowPosition)
              ? (e.zoomWindow = t(
                  "<div style='z-index:999;left:" +
                    e.windowOffsetLeft +
                    "px;top:" +
                    e.windowOffsetTop +
                    "px;" +
                    e.zoomWindowStyle +
                    "' class='zoomWindow'>&nbsp;</div>"
                )
                  .appendTo("body")
                  .click(function () {
                    e.$elem.trigger("click");
                  }))
              : (e.zoomWindow = t(
                  "<div style='z-index:999;left:" +
                    e.windowOffsetLeft +
                    "px;top:" +
                    e.windowOffsetTop +
                    "px;" +
                    e.zoomWindowStyle +
                    "' class='zoomWindow'>&nbsp;</div>"
                )
                  .appendTo(e.zoomContainer)
                  .click(function () {
                    e.$elem.trigger("click");
                  })),
            (e.zoomWindowContainer = t("<div/>")
              .addClass("zoomWindowContainer")
              .css("width", e.options.zoomWindowWidth)),
            e.zoomWindow.wrap(e.zoomWindowContainer),
            "lens" == e.options.zoomType &&
              e.zoomLens.css({ backgroundImage: "url('" + e.imageSrc + "')" }),
            "window" == e.options.zoomType &&
              e.zoomWindow.css({
                backgroundImage: "url('" + e.imageSrc + "')",
              }),
            "inner" == e.options.zoomType &&
              e.zoomWindow.css({
                backgroundImage: "url('" + e.imageSrc + "')",
              }),
            e.$elem.bind("touchmove", function (t) {
              t.preventDefault();
              var i =
                t.originalEvent.touches[0] || t.originalEvent.changedTouches[0];
              e.setPosition(i);
            }),
            e.zoomContainer.bind("touchmove", function (t) {
              "inner" == e.options.zoomType && e.showHideWindow("show"),
                t.preventDefault();
              var i =
                t.originalEvent.touches[0] || t.originalEvent.changedTouches[0];
              e.setPosition(i);
            }),
            e.zoomContainer.bind("touchend", function (t) {
              e.showHideWindow("hide"),
                e.options.showLens && e.showHideLens("hide"),
                e.options.tint &&
                  "inner" != e.options.zoomType &&
                  e.showHideTint("hide");
            }),
            e.$elem.bind("touchend", function (t) {
              e.showHideWindow("hide"),
                e.options.showLens && e.showHideLens("hide"),
                e.options.tint &&
                  "inner" != e.options.zoomType &&
                  e.showHideTint("hide");
            }),
            e.options.showLens &&
              (e.zoomLens.bind("touchmove", function (t) {
                t.preventDefault();
                var i =
                  t.originalEvent.touches[0] ||
                  t.originalEvent.changedTouches[0];
                e.setPosition(i);
              }),
              e.zoomLens.bind("touchend", function (t) {
                e.showHideWindow("hide"),
                  e.options.showLens && e.showHideLens("hide"),
                  e.options.tint &&
                    "inner" != e.options.zoomType &&
                    e.showHideTint("hide");
              })),
            e.$elem.bind("mousemove", function (t) {
              0 == e.overWindow && e.setElements("show"),
                (e.lastX === t.clientX && e.lastY === t.clientY) ||
                  (e.setPosition(t), (e.currentLoc = t)),
                (e.lastX = t.clientX),
                (e.lastY = t.clientY);
            }),
            e.zoomContainer.bind("mousemove", function (t) {
              0 == e.overWindow && e.setElements("show"),
                (e.lastX === t.clientX && e.lastY === t.clientY) ||
                  (e.setPosition(t), (e.currentLoc = t)),
                (e.lastX = t.clientX),
                (e.lastY = t.clientY);
            }),
            "inner" != e.options.zoomType &&
              e.zoomLens.bind("mousemove", function (t) {
                (e.lastX === t.clientX && e.lastY === t.clientY) ||
                  (e.setPosition(t), (e.currentLoc = t)),
                  (e.lastX = t.clientX),
                  (e.lastY = t.clientY);
              }),
            e.options.tint &&
              "inner" != e.options.zoomType &&
              e.zoomTint.bind("mousemove", function (t) {
                (e.lastX === t.clientX && e.lastY === t.clientY) ||
                  (e.setPosition(t), (e.currentLoc = t)),
                  (e.lastX = t.clientX),
                  (e.lastY = t.clientY);
              }),
            "inner" == e.options.zoomType &&
              e.zoomWindow.bind("mousemove", function (t) {
                (e.lastX === t.clientX && e.lastY === t.clientY) ||
                  (e.setPosition(t), (e.currentLoc = t)),
                  (e.lastX = t.clientX),
                  (e.lastY = t.clientY);
              }),
            e.zoomContainer
              .add(e.$elem)
              .mouseenter(function () {
                0 == e.overWindow && e.setElements("show");
              })
              .mouseleave(function () {
                e.scrollLock ||
                  (e.setElements("hide"), e.options.onDestroy(e.$elem));
              }),
            "inner" != e.options.zoomType &&
              e.zoomWindow
                .mouseenter(function () {
                  (e.overWindow = !0), e.setElements("hide");
                })
                .mouseleave(function () {
                  e.overWindow = !1;
                }),
            e.options.zoomLevel,
            e.options.minZoomLevel
              ? (e.minZoomLevel = e.options.minZoomLevel)
              : (e.minZoomLevel = 2 * e.options.scrollZoomIncrement),
            e.options.scrollZoom &&
              e.zoomContainer
                .add(e.$elem)
                .bind(
                  "mousewheel DOMMouseScroll MozMousePixelScroll",
                  function (i) {
                    (e.scrollLock = !0),
                      clearTimeout(t.data(this, "timer")),
                      t.data(
                        this,
                        "timer",
                        setTimeout(function () {
                          e.scrollLock = !1;
                        }, 250)
                      );
                    var o =
                      i.originalEvent.wheelDelta || -1 * i.originalEvent.detail;
                    return (
                      i.stopImmediatePropagation(),
                      i.stopPropagation(),
                      i.preventDefault(),
                      o / 120 > 0
                        ? e.currentZoomLevel >= e.minZoomLevel &&
                          e.changeZoomLevel(
                            e.currentZoomLevel - e.options.scrollZoomIncrement
                          )
                        : e.options.maxZoomLevel
                        ? e.currentZoomLevel <= e.options.maxZoomLevel &&
                          e.changeZoomLevel(
                            parseFloat(e.currentZoomLevel) +
                              e.options.scrollZoomIncrement
                          )
                        : e.changeZoomLevel(
                            parseFloat(e.currentZoomLevel) +
                              e.options.scrollZoomIncrement
                          ),
                      !1
                    );
                  }
                ));
      },
      setElements: function (t) {
        if (!this.options.zoomEnabled) return !1;
        "show" == t &&
          this.isWindowSet &&
          ("inner" == this.options.zoomType && this.showHideWindow("show"),
          "window" == this.options.zoomType && this.showHideWindow("show"),
          this.options.showLens && this.showHideLens("show"),
          this.options.tint &&
            "inner" != this.options.zoomType &&
            this.showHideTint("show")),
          "hide" == t &&
            ("window" == this.options.zoomType && this.showHideWindow("hide"),
            this.options.tint || this.showHideWindow("hide"),
            this.options.showLens && this.showHideLens("hide"),
            this.options.tint && this.showHideTint("hide"));
      },
      setPosition: function (t) {
        if (!this.options.zoomEnabled) return !1;
        (this.nzHeight = this.$elem.height()),
          (this.nzWidth = this.$elem.width()),
          (this.nzOffset = this.$elem.offset()),
          (this.ctOffset = this.$container.offset()),
          this.options.tint &&
            "inner" != this.options.zoomType &&
            (this.zoomTint.css({ top: 0 }), this.zoomTint.css({ left: 0 })),
          this.options.responsive &&
            !this.options.scrollZoom &&
            this.options.showLens &&
            (this.nzHeight < this.options.zoomWindowWidth / this.widthRatio
              ? (lensHeight = this.nzHeight)
              : (lensHeight = String(
                  this.options.zoomWindowHeight / this.heightRatio
                )),
            this.largeWidth < this.options.zoomWindowWidth
              ? (lensWidth = this.nzWidth)
              : (lensWidth = this.options.zoomWindowWidth / this.widthRatio),
            (this.widthRatio = this.largeWidth / this.nzWidth),
            (this.heightRatio = this.largeHeight / this.nzHeight),
            "lens" != this.options.zoomType &&
              (this.nzHeight < this.options.zoomWindowWidth / this.widthRatio
                ? (lensHeight = this.nzHeight)
                : (lensHeight = String(
                    this.options.zoomWindowHeight / this.heightRatio
                  )),
              this.nzWidth < this.options.zoomWindowHeight / this.heightRatio
                ? (lensWidth = this.nzWidth)
                : (lensWidth = String(
                    this.options.zoomWindowWidth / this.widthRatio
                  )),
              this.zoomLens.css("width", lensWidth),
              this.zoomLens.css("height", lensHeight),
              this.options.tint &&
                (this.zoomTintImage.css("width", this.nzWidth),
                this.zoomTintImage.css("height", this.nzHeight))),
            "lens" == this.options.zoomType &&
              this.zoomLens.css({
                width: String(this.options.lensSize) + "px",
                height: String(this.options.lensSize) + "px",
              })),
          this.zoomContainer.css({
            top: this.nzOffset.top - this.ctOffset.top,
          }),
          this.zoomContainer.css({
            left: this.nzOffset.left - this.ctOffset.left,
          }),
          (this.mouseLeft = parseInt(t.pageX - this.nzOffset.left)),
          (this.mouseTop = parseInt(t.pageY - this.nzOffset.top)),
          "window" == this.options.zoomType &&
            ((this.Etoppos = this.mouseTop < this.zoomLens.height() / 2),
            (this.Eboppos =
              this.mouseTop >
              this.nzHeight -
                this.zoomLens.height() / 2 -
                2 * this.options.lensBorderSize),
            (this.Eloppos = this.mouseLeft < 0 + this.zoomLens.width() / 2),
            (this.Eroppos =
              this.mouseLeft >
              this.nzWidth -
                this.zoomLens.width() / 2 -
                2 * this.options.lensBorderSize)),
          "inner" == this.options.zoomType &&
            ((this.Etoppos =
              this.mouseTop < this.nzHeight / 2 / this.heightRatio),
            (this.Eboppos =
              this.mouseTop >
              this.nzHeight - this.nzHeight / 2 / this.heightRatio),
            (this.Eloppos =
              this.mouseLeft < 0 + this.nzWidth / 2 / this.widthRatio),
            (this.Eroppos =
              this.mouseLeft >
              this.nzWidth -
                this.nzWidth / 2 / this.widthRatio -
                2 * this.options.lensBorderSize)),
          this.mouseLeft < 0 ||
          this.mouseTop < 0 ||
          this.mouseLeft > this.nzWidth ||
          this.mouseTop > this.nzHeight
            ? this.setElements("hide")
            : (this.options.showLens &&
                ((this.lensLeftPos = String(
                  Math.floor(this.mouseLeft - this.zoomLens.width() / 2)
                )),
                (this.lensTopPos = String(
                  Math.floor(this.mouseTop - this.zoomLens.height() / 2)
                ))),
              this.Etoppos && (this.lensTopPos = 0),
              this.Eloppos &&
                ((this.windowLeftPos = 0),
                (this.lensLeftPos = 0),
                (this.tintpos = 0)),
              "window" == this.options.zoomType &&
                (this.Eboppos &&
                  (this.lensTopPos = Math.max(
                    this.nzHeight -
                      this.zoomLens.height() -
                      2 * this.options.lensBorderSize,
                    0
                  )),
                this.Eroppos &&
                  (this.lensLeftPos =
                    this.nzWidth -
                    this.zoomLens.width() -
                    2 * this.options.lensBorderSize)),
              "inner" == this.options.zoomType &&
                (this.Eboppos &&
                  (this.lensTopPos = Math.max(
                    this.nzHeight - 2 * this.options.lensBorderSize,
                    0
                  )),
                this.Eroppos &&
                  (this.lensLeftPos =
                    this.nzWidth -
                    this.nzWidth -
                    2 * this.options.lensBorderSize)),
              "lens" == this.options.zoomType &&
                ((this.windowLeftPos = String(
                  -1 *
                    ((t.pageX - this.nzOffset.left) * this.widthRatio -
                      this.zoomLens.width() / 2)
                )),
                (this.windowTopPos = String(
                  -1 *
                    ((t.pageY - this.nzOffset.top) * this.heightRatio -
                      this.zoomLens.height() / 2)
                )),
                this.zoomLens.css({
                  backgroundPosition:
                    this.windowLeftPos + "px " + this.windowTopPos + "px",
                }),
                this.changeBgSize &&
                  (this.nzHeight > this.nzWidth
                    ? ("lens" == this.options.zoomType &&
                        this.zoomLens.css({
                          "background-size":
                            this.largeWidth / this.newvalueheight +
                            "px " +
                            this.largeHeight / this.newvalueheight +
                            "px",
                        }),
                      this.zoomWindow.css({
                        "background-size":
                          this.largeWidth / this.newvalueheight +
                          "px " +
                          this.largeHeight / this.newvalueheight +
                          "px",
                      }))
                    : ("lens" == this.options.zoomType &&
                        this.zoomLens.css({
                          "background-size":
                            this.largeWidth / this.newvaluewidth +
                            "px " +
                            this.largeHeight / this.newvaluewidth +
                            "px",
                        }),
                      this.zoomWindow.css({
                        "background-size":
                          this.largeWidth / this.newvaluewidth +
                          "px " +
                          this.largeHeight / this.newvaluewidth +
                          "px",
                      })),
                  (this.changeBgSize = !1)),
                this.setWindowPostition(t)),
              this.options.tint &&
                "inner" != this.options.zoomType &&
                this.setTintPosition(t),
              "window" == this.options.zoomType && this.setWindowPostition(t),
              "inner" == this.options.zoomType && this.setWindowPostition(t),
              this.options.showLens &&
                (this.fullwidth &&
                  "lens" != this.options.zoomType &&
                  (this.lensLeftPos = 0),
                this.zoomLens.css({
                  left: this.lensLeftPos + "px",
                  top: this.lensTopPos + "px",
                })));
      },
      showHideWindow: function (t) {
        var e = this;
        "show" == t &&
          (e.isWindowActive ||
            (e.options.zoomWindowFadeIn
              ? e.zoomWindow.stop(!0, !0, !1).fadeIn(e.options.zoomWindowFadeIn)
              : e.zoomWindow.show(),
            (e.isWindowActive = !0))),
          "hide" == t &&
            e.isWindowActive &&
            (e.options.zoomWindowFadeOut
              ? e.zoomWindow
                  .stop(!0, !0)
                  .fadeOut(e.options.zoomWindowFadeOut, function () {
                    e.loop && (clearInterval(e.loop), (e.loop = !1));
                  })
              : e.zoomWindow.hide(),
            (e.isWindowActive = !1));
      },
      showHideLens: function (t) {
        "show" == t &&
          (this.isLensActive ||
            (this.options.lensFadeIn
              ? this.zoomLens.stop(!0, !0, !1).fadeIn(this.options.lensFadeIn)
              : this.zoomLens.show(),
            (this.isLensActive = !0))),
          "hide" == t &&
            this.isLensActive &&
            (this.options.lensFadeOut
              ? this.zoomLens.stop(!0, !0).fadeOut(this.options.lensFadeOut)
              : this.zoomLens.hide(),
            (this.isLensActive = !1));
      },
      showHideTint: function (t) {
        "show" == t &&
          (this.isTintActive ||
            (this.options.zoomTintFadeIn
              ? this.zoomTint
                  .css({ opacity: this.options.tintOpacity })
                  .animate()
                  .stop(!0, !0)
                  .fadeIn("slow")
              : (this.zoomTint
                  .css({ opacity: this.options.tintOpacity })
                  .animate(),
                this.zoomTint.show()),
            (this.isTintActive = !0))),
          "hide" == t &&
            this.isTintActive &&
            (this.options.zoomTintFadeOut
              ? this.zoomTint.stop(!0, !0).fadeOut(this.options.zoomTintFadeOut)
              : this.zoomTint.hide(),
            (this.isTintActive = !1));
      },
      setLensPostition: function (t) {},
      setWindowPostition: function (e) {
        var i = this;
        if (isNaN(i.options.zoomWindowPosition))
          (i.externalContainer = t("#" + i.options.zoomWindowPosition)),
            (i.externalContainerWidth = i.externalContainer.width()),
            (i.externalContainerHeight = i.externalContainer.height()),
            (i.externalContainerOffset = i.externalContainer.offset()),
            (i.windowOffsetTop = i.externalContainerOffset.top),
            (i.windowOffsetLeft = i.externalContainerOffset.left);
        else
          switch (i.options.zoomWindowPosition) {
            case 1:
              (i.windowOffsetTop = i.options.zoomWindowOffety),
                (i.windowOffsetLeft = +i.nzWidth);
              break;
            case 2:
              i.options.zoomWindowHeight > i.nzHeight &&
                ((i.windowOffsetTop =
                  -1 * (i.options.zoomWindowHeight / 2 - i.nzHeight / 2)),
                (i.windowOffsetLeft = i.nzWidth));
              break;
            case 3:
              (i.windowOffsetTop =
                i.nzHeight - i.zoomWindow.height() - 2 * i.options.borderSize),
                (i.windowOffsetLeft = i.nzWidth);
              break;
            case 4:
              (i.windowOffsetTop = i.nzHeight),
                (i.windowOffsetLeft = i.nzWidth);
              break;
            case 5:
              (i.windowOffsetTop = i.nzHeight),
                (i.windowOffsetLeft =
                  i.nzWidth - i.zoomWindow.width() - 2 * i.options.borderSize);
              break;
            case 6:
              i.options.zoomWindowHeight > i.nzHeight &&
                ((i.windowOffsetTop = i.nzHeight),
                (i.windowOffsetLeft =
                  -1 *
                  (i.options.zoomWindowWidth / 2 -
                    i.nzWidth / 2 +
                    2 * i.options.borderSize)));
              break;
            case 7:
              (i.windowOffsetTop = i.nzHeight), (i.windowOffsetLeft = 0);
              break;
            case 8:
              (i.windowOffsetTop = i.nzHeight),
                (i.windowOffsetLeft =
                  -1 * (i.zoomWindow.width() + 2 * i.options.borderSize));
              break;
            case 9:
              (i.windowOffsetTop =
                i.nzHeight - i.zoomWindow.height() - 2 * i.options.borderSize),
                (i.windowOffsetLeft =
                  -1 * (i.zoomWindow.width() + 2 * i.options.borderSize));
              break;
            case 10:
              i.options.zoomWindowHeight > i.nzHeight &&
                ((i.windowOffsetTop =
                  -1 * (i.options.zoomWindowHeight / 2 - i.nzHeight / 2)),
                (i.windowOffsetLeft =
                  -1 * (i.zoomWindow.width() + 2 * i.options.borderSize)));
              break;
            case 11:
              (i.windowOffsetTop = i.options.zoomWindowOffety),
                (i.windowOffsetLeft =
                  -1 * (i.zoomWindow.width() + 2 * i.options.borderSize));
              break;
            case 12:
              (i.windowOffsetTop =
                -1 * (i.zoomWindow.height() + 2 * i.options.borderSize)),
                (i.windowOffsetLeft =
                  -1 * (i.zoomWindow.width() + 2 * i.options.borderSize));
              break;
            case 13:
              (i.windowOffsetTop =
                -1 * (i.zoomWindow.height() + 2 * i.options.borderSize)),
                (i.windowOffsetLeft = 0);
              break;
            case 14:
              i.options.zoomWindowHeight > i.nzHeight &&
                ((i.windowOffsetTop =
                  -1 * (i.zoomWindow.height() + 2 * i.options.borderSize)),
                (i.windowOffsetLeft =
                  -1 *
                  (i.options.zoomWindowWidth / 2 -
                    i.nzWidth / 2 +
                    2 * i.options.borderSize)));
              break;
            case 15:
              (i.windowOffsetTop =
                -1 * (i.zoomWindow.height() + 2 * i.options.borderSize)),
                (i.windowOffsetLeft =
                  i.nzWidth - i.zoomWindow.width() - 2 * i.options.borderSize);
              break;
            case 16:
              (i.windowOffsetTop =
                -1 * (i.zoomWindow.height() + 2 * i.options.borderSize)),
                (i.windowOffsetLeft = i.nzWidth);
              break;
            default:
              (i.windowOffsetTop = i.options.zoomWindowOffety),
                (i.windowOffsetLeft = i.nzWidth);
          }
        (i.isWindowSet = !0),
          (i.windowOffsetTop = i.windowOffsetTop + i.options.zoomWindowOffety),
          (i.windowOffsetLeft =
            i.windowOffsetLeft + i.options.zoomWindowOffetx),
          i.zoomWindow.css({ top: i.windowOffsetTop }),
          i.zoomWindow.css({ left: i.windowOffsetLeft }),
          "inner" == i.options.zoomType &&
            (i.zoomWindow.css({ top: 0 }), i.zoomWindow.css({ left: 0 })),
          (i.windowLeftPos = String(
            -1 *
              ((e.pageX - i.nzOffset.left) * i.widthRatio -
                i.zoomWindow.width() / 2)
          )),
          (i.windowTopPos = String(
            -1 *
              ((e.pageY - i.nzOffset.top) * i.heightRatio -
                i.zoomWindow.height() / 2)
          )),
          i.Etoppos && (i.windowTopPos = 0),
          i.Eloppos && (i.windowLeftPos = 0),
          i.Eboppos &&
            (i.windowTopPos =
              -1 *
              (i.largeHeight / i.currentZoomLevel - i.zoomWindow.height())),
          i.Eroppos &&
            (i.windowLeftPos =
              -1 * (i.largeWidth / i.currentZoomLevel - i.zoomWindow.width())),
          i.fullheight && (i.windowTopPos = 0),
          i.fullwidth && (i.windowLeftPos = 0),
          ("window" != i.options.zoomType && "inner" != i.options.zoomType) ||
            (1 == i.zoomLock &&
              (i.widthRatio <= 1 && (i.windowLeftPos = 0),
              i.heightRatio <= 1 && (i.windowTopPos = 0)),
            "window" == i.options.zoomType &&
              (i.largeHeight < i.options.zoomWindowHeight &&
                (i.windowTopPos = 0),
              i.largeWidth < i.options.zoomWindowWidth &&
                (i.windowLeftPos = 0)),
            i.options.easing
              ? (i.xp || (i.xp = 0),
                i.yp || (i.yp = 0),
                i.loop ||
                  (i.loop = setInterval(function () {
                    (i.xp += (i.windowLeftPos - i.xp) / i.options.easingAmount),
                      (i.yp +=
                        (i.windowTopPos - i.yp) / i.options.easingAmount),
                      i.scrollingLock
                        ? (clearInterval(i.loop),
                          (i.xp = i.windowLeftPos),
                          (i.yp = i.windowTopPos),
                          (i.xp =
                            -1 *
                            ((e.pageX - i.nzOffset.left) * i.widthRatio -
                              i.zoomWindow.width() / 2)),
                          (i.yp =
                            -1 *
                            ((e.pageY - i.nzOffset.top) * i.heightRatio -
                              i.zoomWindow.height() / 2)),
                          i.changeBgSize &&
                            (i.nzHeight > i.nzWidth
                              ? ("lens" == i.options.zoomType &&
                                  i.zoomLens.css({
                                    "background-size":
                                      i.largeWidth / i.newvalueheight +
                                      "px " +
                                      i.largeHeight / i.newvalueheight +
                                      "px",
                                  }),
                                i.zoomWindow.css({
                                  "background-size":
                                    i.largeWidth / i.newvalueheight +
                                    "px " +
                                    i.largeHeight / i.newvalueheight +
                                    "px",
                                }))
                              : ("lens" != i.options.zoomType &&
                                  i.zoomLens.css({
                                    "background-size":
                                      i.largeWidth / i.newvaluewidth +
                                      "px " +
                                      i.largeHeight / i.newvalueheight +
                                      "px",
                                  }),
                                i.zoomWindow.css({
                                  "background-size":
                                    i.largeWidth / i.newvaluewidth +
                                    "px " +
                                    i.largeHeight / i.newvaluewidth +
                                    "px",
                                })),
                            (i.changeBgSize = !1)),
                          i.zoomWindow.css({
                            backgroundPosition:
                              i.windowLeftPos + "px " + i.windowTopPos + "px",
                          }),
                          (i.scrollingLock = !1),
                          (i.loop = !1))
                        : Math.round(
                            Math.abs(i.xp - i.windowLeftPos) +
                              Math.abs(i.yp - i.windowTopPos)
                          ) < 1
                        ? (clearInterval(i.loop),
                          i.zoomWindow.css({
                            backgroundPosition:
                              i.windowLeftPos + "px " + i.windowTopPos + "px",
                          }),
                          (i.loop = !1))
                        : (i.changeBgSize &&
                            (i.nzHeight > i.nzWidth
                              ? ("lens" == i.options.zoomType &&
                                  i.zoomLens.css({
                                    "background-size":
                                      i.largeWidth / i.newvalueheight +
                                      "px " +
                                      i.largeHeight / i.newvalueheight +
                                      "px",
                                  }),
                                i.zoomWindow.css({
                                  "background-size":
                                    i.largeWidth / i.newvalueheight +
                                    "px " +
                                    i.largeHeight / i.newvalueheight +
                                    "px",
                                }))
                              : ("lens" != i.options.zoomType &&
                                  i.zoomLens.css({
                                    "background-size":
                                      i.largeWidth / i.newvaluewidth +
                                      "px " +
                                      i.largeHeight / i.newvaluewidth +
                                      "px",
                                  }),
                                i.zoomWindow.css({
                                  "background-size":
                                    i.largeWidth / i.newvaluewidth +
                                    "px " +
                                    i.largeHeight / i.newvaluewidth +
                                    "px",
                                })),
                            (i.changeBgSize = !1)),
                          i.zoomWindow.css({
                            backgroundPosition: i.xp + "px " + i.yp + "px",
                          }));
                  }, 16)))
              : (i.changeBgSize &&
                  (i.nzHeight > i.nzWidth
                    ? ("lens" == i.options.zoomType &&
                        i.zoomLens.css({
                          "background-size":
                            i.largeWidth / i.newvalueheight +
                            "px " +
                            i.largeHeight / i.newvalueheight +
                            "px",
                        }),
                      i.zoomWindow.css({
                        "background-size":
                          i.largeWidth / i.newvalueheight +
                          "px " +
                          i.largeHeight / i.newvalueheight +
                          "px",
                      }))
                    : ("lens" == i.options.zoomType &&
                        i.zoomLens.css({
                          "background-size":
                            i.largeWidth / i.newvaluewidth +
                            "px " +
                            i.largeHeight / i.newvaluewidth +
                            "px",
                        }),
                      i.largeHeight / i.newvaluewidth <
                      i.options.zoomWindowHeight
                        ? i.zoomWindow.css({
                            "background-size":
                              i.largeWidth / i.newvaluewidth +
                              "px " +
                              i.largeHeight / i.newvaluewidth +
                              "px",
                          })
                        : i.zoomWindow.css({
                            "background-size":
                              i.largeWidth / i.newvalueheight +
                              "px " +
                              i.largeHeight / i.newvalueheight +
                              "px",
                          })),
                  (i.changeBgSize = !1)),
                i.zoomWindow.css({
                  backgroundPosition:
                    i.windowLeftPos + "px " + i.windowTopPos + "px",
                })));
      },
      setTintPosition: function (t) {
        (this.nzOffset = this.$elem.offset()),
          (this.tintpos = String(
            -1 * (t.pageX - this.nzOffset.left - this.zoomLens.width() / 2)
          )),
          (this.tintposy = String(
            -1 * (t.pageY - this.nzOffset.top - this.zoomLens.height() / 2)
          )),
          this.Etoppos && (this.tintposy = 0),
          this.Eloppos && (this.tintpos = 0),
          this.Eboppos &&
            (this.tintposy =
              -1 *
              (this.nzHeight -
                this.zoomLens.height() -
                2 * this.options.lensBorderSize)),
          this.Eroppos &&
            (this.tintpos =
              -1 *
              (this.nzWidth -
                this.zoomLens.width() -
                2 * this.options.lensBorderSize)),
          this.options.tint &&
            (this.fullheight && (this.tintposy = 0),
            this.fullwidth && (this.tintpos = 0),
            this.zoomTintImage.css({ left: this.tintpos + "px" }),
            this.zoomTintImage.css({ top: this.tintposy + "px" }));
      },
      swaptheimage: function (e, i) {
        var o = this,
          s = new Image();
        o.options.loadingIcon &&
          ((o.spinner = t(
            "<div style=\"background: url('" +
              o.options.loadingIcon +
              "') no-repeat center;height:" +
              o.nzHeight +
              "px;width:" +
              o.nzWidth +
              'px;z-index: 2000;position: absolute; background-position: center center;"></div>'
          )),
          o.$elem.after(o.spinner)),
          o.options.onImageSwap(o.$elem),
          (s.onload = function () {
            (o.largeWidth = s.width),
              (o.largeHeight = s.height),
              (o.zoomImage = i),
              o.zoomWindow.css({
                "background-size": o.largeWidth + "px " + o.largeHeight + "px",
              }),
              o.swapAction(e, i);
          }),
          (s.src = i);
      },
      swapAction: function (e, i) {
        var o = this,
          s = new Image();
        if (
          ((s.onload = function () {
            (o.nzHeight = s.height),
              (o.nzWidth = s.width),
              o.options.onImageSwapComplete(o.$elem),
              o.doneCallback();
          }),
          (s.src = e),
          (o.currentZoomLevel = o.options.zoomLevel),
          (o.options.maxZoomLevel = !1),
          "lens" == o.options.zoomType &&
            o.zoomLens.css({ backgroundImage: "url('" + i + "')" }),
          "window" == o.options.zoomType &&
            o.zoomWindow.css({ backgroundImage: "url('" + i + "')" }),
          "inner" == o.options.zoomType &&
            o.zoomWindow.css({ backgroundImage: "url('" + i + "')" }),
          (o.currentImage = i),
          o.options.imageCrossfade)
        ) {
          var n = o.$elem,
            r = n.clone();
          if (
            (o.$elem.attr("src", e),
            o.$elem.after(r),
            r.stop(!0).fadeOut(o.options.imageCrossfade, function () {
              t(this).remove();
            }),
            o.$elem.width("auto").removeAttr("width"),
            o.$elem.height("auto").removeAttr("height"),
            n.fadeIn(o.options.imageCrossfade),
            o.options.tint && "inner" != o.options.zoomType)
          ) {
            var a = o.zoomTintImage,
              h = a.clone();
            o.zoomTintImage.attr("src", i),
              o.zoomTintImage.after(h),
              h.stop(!0).fadeOut(o.options.imageCrossfade, function () {
                t(this).remove();
              }),
              a.fadeIn(o.options.imageCrossfade),
              o.zoomTint.css({ height: o.$elem.height() }),
              o.zoomTint.css({ width: o.$elem.width() });
          }
          o.zoomContainer.css("height", o.$elem.height()),
            o.zoomContainer.css("width", o.$elem.width()),
            "inner" == o.options.zoomType &&
              (o.options.constrainType ||
                (o.zoomWrap.parent().css("height", o.$elem.height()),
                o.zoomWrap.parent().css("width", o.$elem.width()),
                o.zoomWindow.css("height", o.$elem.height()),
                o.zoomWindow.css("width", o.$elem.width()))),
            o.options.imageCrossfade &&
              (o.zoomWrap.css("height", o.$elem.height()),
              o.zoomWrap.css("width", o.$elem.width()));
        } else
          o.$elem.attr("src", e),
            o.options.tint &&
              (o.zoomTintImage.attr("src", i),
              o.zoomTintImage.attr("height", o.$elem.height()),
              o.zoomTintImage.css({ height: o.$elem.height() }),
              o.zoomTint.css({ height: o.$elem.height() })),
            o.zoomContainer.css("height", o.$elem.height()),
            o.zoomContainer.css("width", o.$elem.width()),
            o.options.imageCrossfade &&
              (o.zoomWrap.css("height", o.$elem.height()),
              o.zoomWrap.css("width", o.$elem.width()));
        o.options.constrainType &&
          ("height" == o.options.constrainType &&
            (o.zoomContainer.css("height", o.options.constrainSize),
            o.zoomContainer.css("width", "auto"),
            o.options.imageCrossfade
              ? (o.zoomWrap.css("height", o.options.constrainSize),
                o.zoomWrap.css("width", "auto"),
                (o.constwidth = o.zoomWrap.width()))
              : (o.$elem.css("height", o.options.constrainSize),
                o.$elem.css("width", "auto"),
                (o.constwidth = o.$elem.width())),
            "inner" == o.options.zoomType &&
              (o.zoomWrap.parent().css("height", o.options.constrainSize),
              o.zoomWrap.parent().css("width", o.constwidth),
              o.zoomWindow.css("height", o.options.constrainSize),
              o.zoomWindow.css("width", o.constwidth)),
            o.options.tint &&
              (o.tintContainer.css("height", o.options.constrainSize),
              o.tintContainer.css("width", o.constwidth),
              o.zoomTint.css("height", o.options.constrainSize),
              o.zoomTint.css("width", o.constwidth),
              o.zoomTintImage.css("height", o.options.constrainSize),
              o.zoomTintImage.css("width", o.constwidth))),
          "width" == o.options.constrainType &&
            (o.zoomContainer.css("height", "auto"),
            o.zoomContainer.css("width", o.options.constrainSize),
            o.options.imageCrossfade
              ? (o.zoomWrap.css("height", "auto"),
                o.zoomWrap.css("width", o.options.constrainSize),
                (o.constheight = o.zoomWrap.height()))
              : (o.$elem.css("height", "auto"),
                o.$elem.css("width", o.options.constrainSize),
                (o.constheight = o.$elem.height())),
            "inner" == o.options.zoomType &&
              (o.zoomWrap.parent().css("height", o.constheight),
              o.zoomWrap.parent().css("width", o.options.constrainSize),
              o.zoomWindow.css("height", o.constheight),
              o.zoomWindow.css("width", o.options.constrainSize)),
            o.options.tint &&
              (o.tintContainer.css("height", o.constheight),
              o.tintContainer.css("width", o.options.constrainSize),
              o.zoomTint.css("height", o.constheight),
              o.zoomTint.css("width", o.options.constrainSize),
              o.zoomTintImage.css("height", o.constheight),
              o.zoomTintImage.css("width", o.options.constrainSize))));
      },
      doneCallback: function () {
        this.options.loadingIcon && this.spinner.hide(),
          (this.nzOffset = this.$elem.offset()),
          (this.nzWidth = this.$elem.width()),
          (this.nzHeight = this.$elem.height()),
          (this.currentZoomLevel = this.options.zoomLevel),
          (this.widthRatio = this.largeWidth / this.nzWidth),
          (this.heightRatio = this.largeHeight / this.nzHeight),
          "window" == this.options.zoomType &&
            (this.nzHeight < this.options.zoomWindowWidth / this.widthRatio
              ? (lensHeight = this.nzHeight)
              : (lensHeight = String(
                  this.options.zoomWindowHeight / this.heightRatio
                )),
            this.options.zoomWindowWidth < this.options.zoomWindowWidth
              ? (lensWidth = this.nzWidth)
              : (lensWidth = this.options.zoomWindowWidth / this.widthRatio),
            this.zoomLens &&
              (this.zoomLens.css("width", lensWidth),
              this.zoomLens.css("height", lensHeight)));
      },
      getCurrentImage: function () {
        return this.zoomImage;
      },
      getGalleryList: function () {
        var e = this;
        return (
          (e.gallerylist = []),
          e.options.gallery
            ? t("#" + e.options.gallery + " a").each(function () {
                var i = "";
                t(this).data("zoom-image")
                  ? (i = t(this).data("zoom-image"))
                  : t(this).data("image") && (i = t(this).data("image")),
                  i == e.zoomImage
                    ? e.gallerylist.unshift({
                        href: "" + i,
                        title: t(this).find("img").attr("title"),
                      })
                    : e.gallerylist.push({
                        href: "" + i,
                        title: t(this).find("img").attr("title"),
                      });
              })
            : e.gallerylist.push({
                href: "" + e.zoomImage,
                title: t(this).find("img").attr("title"),
              }),
          e.gallerylist
        );
      },
      changeZoomLevel: function (t) {
        (this.scrollingLock = !0),
          (this.newvalue = parseFloat(t).toFixed(2)),
          (newvalue = parseFloat(t).toFixed(2)),
          (maxheightnewvalue =
            this.largeHeight /
            ((this.options.zoomWindowHeight / this.nzHeight) * this.nzHeight)),
          (maxwidthtnewvalue =
            this.largeWidth /
            ((this.options.zoomWindowWidth / this.nzWidth) * this.nzWidth)),
          "inner" != this.options.zoomType &&
            (maxheightnewvalue <= newvalue
              ? ((this.heightRatio =
                  this.largeHeight / maxheightnewvalue / this.nzHeight),
                (this.newvalueheight = maxheightnewvalue),
                (this.fullheight = !0))
              : ((this.heightRatio =
                  this.largeHeight / newvalue / this.nzHeight),
                (this.newvalueheight = newvalue),
                (this.fullheight = !1)),
            maxwidthtnewvalue <= newvalue
              ? ((this.widthRatio =
                  this.largeWidth / maxwidthtnewvalue / this.nzWidth),
                (this.newvaluewidth = maxwidthtnewvalue),
                (this.fullwidth = !0))
              : ((this.widthRatio = this.largeWidth / newvalue / this.nzWidth),
                (this.newvaluewidth = newvalue),
                (this.fullwidth = !1)),
            "lens" == this.options.zoomType &&
              (maxheightnewvalue <= newvalue
                ? ((this.fullwidth = !0),
                  (this.newvaluewidth = maxheightnewvalue))
                : ((this.widthRatio =
                    this.largeWidth / newvalue / this.nzWidth),
                  (this.newvaluewidth = newvalue),
                  (this.fullwidth = !1)))),
          "inner" == this.options.zoomType &&
            ((maxheightnewvalue = parseFloat(
              this.largeHeight / this.nzHeight
            ).toFixed(2)),
            (maxwidthtnewvalue = parseFloat(
              this.largeWidth / this.nzWidth
            ).toFixed(2)),
            newvalue > maxheightnewvalue && (newvalue = maxheightnewvalue),
            newvalue > maxwidthtnewvalue && (newvalue = maxwidthtnewvalue),
            maxheightnewvalue <= newvalue
              ? ((this.heightRatio =
                  this.largeHeight / newvalue / this.nzHeight),
                newvalue > maxheightnewvalue
                  ? (this.newvalueheight = maxheightnewvalue)
                  : (this.newvalueheight = newvalue),
                (this.fullheight = !0))
              : ((this.heightRatio =
                  this.largeHeight / newvalue / this.nzHeight),
                newvalue > maxheightnewvalue
                  ? (this.newvalueheight = maxheightnewvalue)
                  : (this.newvalueheight = newvalue),
                (this.fullheight = !1)),
            maxwidthtnewvalue <= newvalue
              ? ((this.widthRatio = this.largeWidth / newvalue / this.nzWidth),
                newvalue > maxwidthtnewvalue
                  ? (this.newvaluewidth = maxwidthtnewvalue)
                  : (this.newvaluewidth = newvalue),
                (this.fullwidth = !0))
              : ((this.widthRatio = this.largeWidth / newvalue / this.nzWidth),
                (this.newvaluewidth = newvalue),
                (this.fullwidth = !1))),
          (scrcontinue = !1),
          "inner" == this.options.zoomType &&
            (this.nzWidth >= this.nzHeight &&
              (this.newvaluewidth <= maxwidthtnewvalue
                ? (scrcontinue = !0)
                : ((scrcontinue = !1),
                  (this.fullheight = !0),
                  (this.fullwidth = !0))),
            this.nzHeight > this.nzWidth &&
              (this.newvaluewidth <= maxwidthtnewvalue
                ? (scrcontinue = !0)
                : ((scrcontinue = !1),
                  (this.fullheight = !0),
                  (this.fullwidth = !0)))),
          "inner" != this.options.zoomType && (scrcontinue = !0),
          scrcontinue &&
            ((this.zoomLock = 0),
            (this.changeZoom = !0),
            this.options.zoomWindowHeight / this.heightRatio <= this.nzHeight &&
              ((this.currentZoomLevel = this.newvalueheight),
              "lens" != this.options.zoomType &&
                "inner" != this.options.zoomType &&
                ((this.changeBgSize = !0),
                this.zoomLens.css({
                  height:
                    String(this.options.zoomWindowHeight / this.heightRatio) +
                    "px",
                })),
              ("lens" != this.options.zoomType &&
                "inner" != this.options.zoomType) ||
                (this.changeBgSize = !0)),
            this.options.zoomWindowWidth / this.widthRatio <= this.nzWidth &&
              ("inner" != this.options.zoomType &&
                this.newvaluewidth > this.newvalueheight &&
                (this.currentZoomLevel = this.newvaluewidth),
              "lens" != this.options.zoomType &&
                "inner" != this.options.zoomType &&
                ((this.changeBgSize = !0),
                this.zoomLens.css({
                  width:
                    String(this.options.zoomWindowWidth / this.widthRatio) +
                    "px",
                })),
              ("lens" != this.options.zoomType &&
                "inner" != this.options.zoomType) ||
                (this.changeBgSize = !0)),
            "inner" == this.options.zoomType &&
              ((this.changeBgSize = !0),
              this.nzWidth > this.nzHeight &&
                (this.currentZoomLevel = this.newvaluewidth),
              this.nzHeight > this.nzWidth &&
                (this.currentZoomLevel = this.newvaluewidth))),
          this.setPosition(this.currentLoc);
      },
      closeAll: function () {
        self.zoomWindow && self.zoomWindow.hide(),
          self.zoomLens && self.zoomLens.hide(),
          self.zoomTint && self.zoomTint.hide();
      },
      changeState: function (t) {
        "enable" == t && (this.options.zoomEnabled = !0),
          "disable" == t && (this.options.zoomEnabled = !1);
      },
    };
    (t.fn.elevateZoom = function (e) {
      return this.each(function () {
        var i = Object.create(s);
        i.init(e, this), t.data(this, "elevateZoom", i);
      });
    }),
      (t.fn.elevateZoom.options = {
        zoomActivation: "hover",
        zoomEnabled: !0,
        preloading: 1,
        zoomLevel: 1,
        scrollZoom: !1,
        scrollZoomIncrement: 0.1,
        minZoomLevel: !1,
        maxZoomLevel: !1,
        easing: !1,
        easingAmount: 12,
        lensSize: 200,
        zoomWindowWidth: 400,
        zoomWindowHeight: 400,
        zoomWindowOffetx: 0,
        zoomWindowOffety: 0,
        zoomWindowPosition: 1,
        zoomWindowBgColour: "#fff",
        lensFadeIn: !1,
        lensFadeOut: !1,
        debug: !1,
        zoomWindowFadeIn: !1,
        zoomWindowFadeOut: !1,
        zoomWindowAlwaysShow: !1,
        zoomTintFadeIn: !1,
        zoomTintFadeOut: !1,
        borderSize: 4,
        showLens: !0,
        borderColour: "#888",
        lensBorderSize: 1,
        lensBorderColour: "#000",
        lensShape: "square",
        zoomType: "window",
        containLensZoom: !1,
        lensColour: "white",
        lensOpacity: 0.4,
        lenszoom: !1,
        tint: !1,
        tintColour: "#333",
        tintOpacity: 0.4,
        gallery: !1,
        galleryActiveClass: "zoomGalleryActive",
        imageCrossfade: !1,
        constrainType: !1,
        constrainSize: !1,
        loadingIcon: !1,
        cursor: "default",
        responsive: !0,
        onComplete: t.noop,
        onDestroy: function () {},
        onZoomedImageLoaded: function () {},
        onImageSwap: t.noop,
        onImageSwapComplete: t.noop,
      });
  })(jQuery, window, document),
  (function (t, e) {
    "use strict";
    jQuery.fn[e] = function (t) {
      return t
        ? this.bind(
            "resize",
            ((i = t),
            function () {
              var t = this,
                e = arguments;
              function s() {
                i.apply(t, e), (o = null);
              }
              o && clearTimeout(o), (o = setTimeout(s, 100));
            })
          )
        : this.trigger(e);
      var i, o;
    };
  })(jQuery, "smartresize"),
  function (t) {
    "use strict";
    t.fn.themePin = function (e) {
      var i = 0,
        o = 0,
        s = [],
        n = !1,
        r = t(window),
        a = [],
        h = [],
        l = [];
      e = e || {};
      var p = function () {
          for (var i = 0, o = s.length; i < o; i++) {
            var a = s[i];
            if (e.minWidth && r.width() <= e.minWidth)
              a.parent().is(".pin-wrapper") && a.unwrap(),
                a.css({ width: "", left: "", top: "", position: "" }),
                (n = !0);
            else {
              n = !1;
              var h = e.containerSelector
                  ? a.closest(e.containerSelector).length
                    ? a.closest(e.containerSelector)
                    : t(e.containerSelector)
                  : t(document.body),
                l = a.offset(),
                p = h.offset();
              if (void 0 !== p) {
                var c = a.parent().offset();
                a.parent().is(".pin-wrapper") ||
                  a.wrap("<div class='pin-wrapper'>");
                var d = t.extend({ top: 0, bottom: 0 }, e.padding || {}),
                  u = parseInt(a.parent().parent().css("padding-top")),
                  m = parseInt(a.parent().parent().css("padding-bottom"));
                void 0 !== e.paddingOffsetTop
                  ? (d.top += parseInt(e.paddingOffsetTop, 10))
                  : (d.top += 18),
                  void 0 !== e.paddingOffsetBottom
                    ? (d.bottom = parseInt(e.paddingOffsetBottom, 10))
                    : (d.bottom = 0);
                var f = a.css("border-bottom"),
                  g = a.outerHeight();
                a.css("border-bottom", "1px solid transparent");
                var w = a.outerHeight() - g - 1;
                a.css("border-bottom", f),
                  a.css({
                    width:
                      a.outerWidth() <= a.parent().width()
                        ? a.outerWidth()
                        : a.parent().width(),
                  }),
                  a.parent().css("height", a.outerHeight() + w),
                  a.outerHeight() <= r.height()
                    ? a.data("themePin", {
                        pad: d,
                        from: (e.containerSelector ? p.top : l.top) - d.top + u,
                        pb: m,
                        parentTop: c.top - u,
                        offset: w,
                      })
                    : a.data("themePin", {
                        pad: d,
                        fromFitTop:
                          (e.containerSelector ? p.top : l.top) - d.top + u,
                        from:
                          (e.containerSelector ? p.top : l.top) +
                          a.outerHeight() -
                          t(window).height() +
                          u,
                        pb: m,
                        parentTop: c.top - u,
                        offset: w,
                      });
              }
            }
          }
        },
        c = function () {
          if (!n) {
            i = r.scrollTop();
            for (
              var p = window.innerHeight || r.height(), c = 0, d = s.length;
              c < d;
              c++
            ) {
              var u,
                m = t(s[c]),
                f = m.data("themePin");
              if (f) {
                var g = e.containerSelector
                    ? m.closest(e.containerSelector).length
                      ? m.closest(e.containerSelector)
                      : t(e.containerSelector)
                    : t(document.body),
                  w = m.outerHeight() + f.pad.top <= p;
                if (
                  ((f.end = g.offset().top + g.height()),
                  w
                    ? (f.to =
                        g.offset().top +
                        g.height() -
                        m.outerHeight() -
                        f.pad.bottom -
                        f.pb)
                    : ((f.to = g.offset().top + g.height() - p - f.pb),
                      (f.to2 =
                        g.height() - m.outerHeight() - f.pad.bottom - f.pb)),
                  0 === l[c] && (l[c] = f.to),
                  l[c] != f.to &&
                    h[c] &&
                    m.height() + m.offset().top + f.pad.bottom < i + p &&
                    (h[c] = !1),
                  w)
                ) {
                  var v = f.from - f.pad.bottom,
                    y = f.to - f.pad.top - f.offset;
                  if (
                    (void 0 !== f.fromFitTop &&
                      f.fromFitTop &&
                      (v = f.fromFitTop - f.pad.bottom),
                    v + m.outerHeight() > f.end || v >= y)
                  ) {
                    m.css({ position: "", top: "", left: "" }),
                      e.activeClass && m.removeClass(e.activeClass);
                    continue;
                  }
                  i > v && i < y
                    ? ("fixed" != m.css("position") &&
                        m
                          .css({ left: m.offset().left, top: f.pad.top })
                          .css("position", "fixed"),
                      e.activeClass && m.addClass(e.activeClass))
                    : i >= y
                    ? (m
                        .css({ left: "", top: y - f.parentTop + f.pad.top })
                        .css("position", "absolute"),
                      e.activeClass && m.addClass(e.activeClass))
                    : (m.css({ position: "", top: "", left: "" }),
                      e.activeClass && m.removeClass(e.activeClass));
                } else if (
                  m.height() + f.pad.top + f.pad.bottom > p ||
                  a[c] ||
                  h[c]
                ) {
                  var z = parseInt(m.parent().parent().css("padding-top"));
                  i + f.pad.top - z <= f.parentTop
                    ? (m.css({ position: "", top: "", bottom: "", left: "" }),
                      (a[c] = h[c] = !1))
                    : i >= f.to
                    ? (m
                        .css({ left: "", top: f.to2, bottom: "" })
                        .css("position", "absolute"),
                      e.activeClass && m.addClass(e.activeClass))
                    : i >= o
                    ? a[c]
                      ? ((a[c] = !1),
                        (u = m.offset().top - f.parentTop),
                        m
                          .css({ left: "", top: u, bottom: "" })
                          .css("position", "absolute"),
                        e.activeClass && m.addClass(e.activeClass))
                      : !h[c] &&
                        m.height() + m.offset().top + f.pad.bottom < i + p &&
                        ((h[c] = !0),
                        "fixed" != m.css("position") &&
                          m
                            .css({
                              left: m.offset().left,
                              bottom: f.pad.bottom,
                              top: "",
                            })
                            .css("position", "fixed"),
                        e.activeClass && m.addClass(e.activeClass))
                    : i < o &&
                      (h[c]
                        ? ((h[c] = !1),
                          (u = m.offset().top - f.parentTop),
                          m
                            .css({ left: "", top: u, bottom: "" })
                            .css("position", "absolute"),
                          e.activeClass && m.addClass(e.activeClass))
                        : !a[c] &&
                          m.offset().top >= i + f.pad.top &&
                          ((a[c] = !0),
                          "fixed" != m.css("position") &&
                            m
                              .css({
                                left: m.offset().left,
                                top: f.pad.top,
                                bottom: "",
                              })
                              .css("position", "fixed"),
                          e.activeClass && m.addClass(e.activeClass)));
                } else
                  i >= f.parentTop - f.pad.top
                    ? m.css({ position: "fixed", top: f.pad.top })
                    : m.css({ position: "", top: "", bottom: "", left: "" }),
                    (a[c] = h[c] = !1);
                l[c] = f.to;
              }
            }
            o = i;
          }
        },
        d = function () {
          p(), c();
        };
      return (
        this.each(function () {
          var e = t(this),
            i = t(this).data("themePin") || {};
          (i && i.update) ||
            (s.push(e),
            t("img", this).one("load", p),
            (i.update = d),
            t(this).data("themePin", i),
            a.push(!1),
            h.push(!1),
            l.push(0));
        }),
        r.on("touchmove scroll", c),
        p(),
        r.on("load", d),
        t(this).on("recalc.pin", function () {
          p(), c();
        }),
        this
      );
    };
    var e = function (t, e) {
      return this.initialize(t, e);
    };
    (e.defaults = {
      autoInit: !1,
      minWidth: 767,
      padding: { top: 0, bottom: 0 },
      offsetTop: 0,
      offsetBottom: 0,
    }),
      (e.prototype = {
        initialize: function (t, e) {
          return (
            t.data("__sticky") ||
              ((this.$el = t), this.setData().setOptions(e).build()),
            this
          );
        },
        setData: function () {
          return this.$el.data("__sticky", this), this;
        },
        setOptions: function (i) {
          return (
            (this.options = t.extend(!0, {}, e.defaults, i, {
              wrapper: this.$el,
            })),
            this
          );
        },
        build: function () {
          if (!t.isFunction(t.fn.themePin)) return this;
          var e,
            i = this.options.wrapper;
          return (
            i.themePin(this.options),
            t(window).smartresize(function () {
              e && clearTimeout(e),
                (e = setTimeout(function () {
                  i.trigger("recalc.pin");
                }, 800));
              var t = i.parent();
              i.outerWidth(t.width()),
                "fixed" == i.css("position") && i.css("left", t.offset().left);
            }),
            this
          );
        },
      }),
      (t.fn.themeSticky = function (i) {
        return this.map(function () {
          var o = t(this);
          return o.data("__sticky")
            ? (o.trigger("recalc.pin"),
              setTimeout(function () {
                o.trigger("recalc.pin");
              }, 800),
              o.data("__sticky"))
            : new e(o, i);
        });
      });
  }.apply(this, [jQuery]),
  (function (t, e, i, o) {
    "use strict";
    var s = "parallax",
      n = {
        relativeInput: !1,
        clipRelativeInput: !1,
        calibrationThreshold: 100,
        calibrationDelay: 500,
        supportDelay: 500,
        calibrateX: !1,
        calibrateY: !0,
        invertX: !0,
        invertY: !0,
        limitX: !1,
        limitY: !1,
        scalarX: 10,
        scalarY: 10,
        frictionX: 0.1,
        frictionY: 0.1,
        originX: 0.5,
        originY: 0.5,
        pointerEvents: !0,
        precision: 1,
      };
    function r(e, i) {
      (this.element = e),
        (this.$context = t(e).data("api", this)),
        (this.$layers = this.$context.find(".layer"));
      var o = {
        calibrateX: this.$context.data("calibrate-x") || null,
        calibrateY: this.$context.data("calibrate-y") || null,
        invertX: this.$context.data("invert-x") || null,
        invertY: this.$context.data("invert-y") || null,
        limitX: parseFloat(this.$context.data("limit-x")) || null,
        limitY: parseFloat(this.$context.data("limit-y")) || null,
        scalarX: parseFloat(this.$context.data("scalar-x")) || null,
        scalarY: parseFloat(this.$context.data("scalar-y")) || null,
        frictionX: parseFloat(this.$context.data("friction-x")) || null,
        frictionY: parseFloat(this.$context.data("friction-y")) || null,
        originX: parseFloat(this.$context.data("origin-x")) || null,
        originY: parseFloat(this.$context.data("origin-y")) || null,
        pointerEvents: this.$context.data("pointer-events") || !0,
        precision: parseFloat(this.$context.data("precision")) || 1,
      };
      for (var s in o) null === o[s] && delete o[s];
      t.extend(this, n, i, o),
        (this.calibrationTimer = null),
        (this.calibrationFlag = !0),
        (this.enabled = !1),
        (this.depthsX = []),
        (this.depthsY = []),
        (this.raf = null),
        (this.bounds = null),
        (this.ex = 0),
        (this.ey = 0),
        (this.ew = 0),
        (this.eh = 0),
        (this.ecx = 0),
        (this.ecy = 0),
        (this.erx = 0),
        (this.ery = 0),
        (this.cx = 0),
        (this.cy = 0),
        (this.ix = 0),
        (this.iy = 0),
        (this.mx = 0),
        (this.my = 0),
        (this.vx = 0),
        (this.vy = 0),
        (this.onMouseMove = this.onMouseMove.bind(this)),
        (this.onDeviceOrientation = this.onDeviceOrientation.bind(this)),
        (this.onOrientationTimer = this.onOrientationTimer.bind(this)),
        (this.onCalibrationTimer = this.onCalibrationTimer.bind(this)),
        (this.onAnimationFrame = this.onAnimationFrame.bind(this)),
        (this.onWindowResize = this.onWindowResize.bind(this)),
        this.initialise();
    }
    (r.prototype.transformSupport = function (t) {
      for (
        var o = i.createElement("div"),
          s = !1,
          n = null,
          r = !1,
          a = null,
          h = null,
          l = 0,
          p = this.vendors.length;
        l < p;
        l++
      )
        if (
          (null !== this.vendors[l]
            ? ((a = this.vendors[l][0] + "transform"),
              (h = this.vendors[l][1] + "Transform"))
            : ((a = "transform"), (h = "transform")),
          void 0 !== o.style[h])
        ) {
          s = !0;
          break;
        }
      switch (t) {
        case "2D":
          r = s;
          break;
        case "3D":
          if (s) {
            var c = i.body || i.createElement("body"),
              d = i.documentElement,
              u = d.style.overflow,
              m = !1;
            i.body ||
              ((m = !0),
              (d.style.overflow = "hidden"),
              d.appendChild(c),
              (c.style.overflow = "hidden"),
              (c.style.background = "")),
              c.appendChild(o),
              (o.style[h] = "translate3d(1px,1px,1px)"),
              (r =
                void 0 !== (n = e.getComputedStyle(o).getPropertyValue(a)) &&
                n.length > 0 &&
                "none" !== n),
              (d.style.overflow = u),
              c.removeChild(o),
              m && (c.removeAttribute("style"), c.parentNode.removeChild(c));
          }
      }
      return r;
    }),
      (r.prototype.ww = null),
      (r.prototype.wh = null),
      (r.prototype.wcx = null),
      (r.prototype.wcy = null),
      (r.prototype.wrx = null),
      (r.prototype.wry = null),
      (r.prototype.portrait = null),
      (r.prototype.desktop = !navigator.userAgent.match(
        /(iPhone|iPod|iPad|Android|BlackBerry|BB10|mobi|tablet|opera mini|nexus 7)/i
      )),
      (r.prototype.vendors = [
        null,
        ["-webkit-", "webkit"],
        ["-moz-", "Moz"],
        ["-o-", "O"],
        ["-ms-", "ms"],
      ]),
      (r.prototype.motionSupport = !!e.DeviceMotionEvent),
      (r.prototype.orientationSupport = !!e.DeviceOrientationEvent),
      (r.prototype.orientationStatus = 0),
      (r.prototype.transform2DSupport = r.prototype.transformSupport("2D")),
      (r.prototype.transform3DSupport = r.prototype.transformSupport("3D")),
      (r.prototype.propertyCache = {}),
      (r.prototype.initialise = function () {
        "static" === this.$context.css("position") &&
          this.$context.css({ position: "relative" }),
          this.pointerEvents || this.$context.css({ pointerEvents: "none" }),
          this.accelerate(this.$context),
          this.updateLayers(),
          this.updateDimensions(),
          this.enable(),
          this.queueCalibration(this.calibrationDelay);
      }),
      (r.prototype.updateLayers = function () {
        (this.$layers = this.$context.find(".layer")),
          (this.depthsX = []),
          (this.depthsY = []),
          this.$layers.css({
            position: "absolute",
            display: "block",
            left: 0,
            top: 0,
          }),
          this.$layers.first().css({ position: "relative" }),
          this.accelerate(this.$layers),
          this.$layers.each(
            t.proxy(function (e, i) {
              var o = t(i).data("depth") || 0;
              this.depthsX.push(t(i).data("depth-x") || o),
                this.depthsY.push(t(i).data("depth-y") || o);
            }, this)
          );
      }),
      (r.prototype.updateDimensions = function () {
        (this.ww = e.innerWidth),
          (this.wh = e.innerHeight),
          (this.wcx = this.ww * this.originX),
          (this.wcy = this.wh * this.originY),
          (this.wrx = Math.max(this.wcx, this.ww - this.wcx)),
          (this.wry = Math.max(this.wcy, this.wh - this.wcy));
      }),
      (r.prototype.updateBounds = function () {
        (this.bounds = this.element.getBoundingClientRect()),
          (this.ex = this.bounds.left),
          (this.ey = this.bounds.top),
          (this.ew = this.bounds.width),
          (this.eh = this.bounds.height),
          (this.ecx = this.ew * this.originX),
          (this.ecy = this.eh * this.originY),
          (this.erx = Math.max(this.ecx, this.ew - this.ecx)),
          (this.ery = Math.max(this.ecy, this.eh - this.ecy));
      }),
      (r.prototype.queueCalibration = function (t) {
        clearTimeout(this.calibrationTimer),
          (this.calibrationTimer = setTimeout(this.onCalibrationTimer, t));
      }),
      (r.prototype.enable = function () {
        this.enabled ||
          ((this.enabled = !0),
          this.orientationSupport
            ? ((this.portrait = null),
              e.addEventListener("deviceorientation", this.onDeviceOrientation),
              setTimeout(this.onOrientationTimer, this.supportDelay))
            : ((this.cx = 0),
              (this.cy = 0),
              (this.portrait = !1),
              e.addEventListener("mousemove", this.onMouseMove)),
          e.addEventListener("resize", this.onWindowResize),
          (this.raf = requestAnimationFrame(this.onAnimationFrame)));
      }),
      (r.prototype.disable = function () {
        this.enabled &&
          ((this.enabled = !1),
          this.orientationSupport
            ? e.removeEventListener(
                "deviceorientation",
                this.onDeviceOrientation
              )
            : e.removeEventListener("mousemove", this.onMouseMove),
          e.removeEventListener("resize", this.onWindowResize),
          cancelAnimationFrame(this.raf));
      }),
      (r.prototype.calibrate = function (t, e) {
        (this.calibrateX = void 0 === t ? this.calibrateX : t),
          (this.calibrateY = void 0 === e ? this.calibrateY : e);
      }),
      (r.prototype.invert = function (t, e) {
        (this.invertX = void 0 === t ? this.invertX : t),
          (this.invertY = void 0 === e ? this.invertY : e);
      }),
      (r.prototype.friction = function (t, e) {
        (this.frictionX = void 0 === t ? this.frictionX : t),
          (this.frictionY = void 0 === e ? this.frictionY : e);
      }),
      (r.prototype.scalar = function (t, e) {
        (this.scalarX = void 0 === t ? this.scalarX : t),
          (this.scalarY = void 0 === e ? this.scalarY : e);
      }),
      (r.prototype.limit = function (t, e) {
        (this.limitX = void 0 === t ? this.limitX : t),
          (this.limitY = void 0 === e ? this.limitY : e);
      }),
      (r.prototype.origin = function (t, e) {
        (this.originX = void 0 === t ? this.originX : t),
          (this.originY = void 0 === e ? this.originY : e);
      }),
      (r.prototype.clamp = function (t, e, i) {
        return (t = Math.max(t, e)), Math.min(t, i);
      }),
      (r.prototype.css = function (e, i, o) {
        var s = this.propertyCache[i];
        if (!s)
          for (var n = 0, r = this.vendors.length; n < r; n++)
            if (
              ((s =
                null !== this.vendors[n]
                  ? t.camelCase(this.vendors[n][1] + "-" + i)
                  : i),
              void 0 !== e.style[s])
            ) {
              this.propertyCache[i] = s;
              break;
            }
        e.style[s] = o;
      }),
      (r.prototype.accelerate = function (t) {
        for (var e = 0, i = t.length; e < i; e++) {
          var o = t[e];
          this.css(o, "transform", "translate3d(0,0,0)"),
            this.css(o, "transform-style", "preserve-3d"),
            this.css(o, "backface-visibility", "hidden");
        }
      }),
      (r.prototype.setPosition = function (t, e, i) {
        (e += "px"),
          (i += "px"),
          this.transform3DSupport
            ? this.css(t, "transform", "translate3d(" + e + "," + i + ",0)")
            : this.transform2DSupport
            ? this.css(t, "transform", "translate(" + e + "," + i + ")")
            : ((t.style.left = e), (t.style.top = i));
      }),
      (r.prototype.onOrientationTimer = function (t) {
        this.orientationSupport &&
          0 === this.orientationStatus &&
          (this.disable(), (this.orientationSupport = !1), this.enable());
      }),
      (r.prototype.onCalibrationTimer = function (t) {
        this.calibrationFlag = !0;
      }),
      (r.prototype.onWindowResize = function (t) {
        this.updateDimensions();
      }),
      (r.prototype.onAnimationFrame = function () {
        this.updateBounds();
        var t = this.ix - this.cx,
          e = this.iy - this.cy;
        (Math.abs(t) > this.calibrationThreshold ||
          Math.abs(e) > this.calibrationThreshold) &&
          this.queueCalibration(0),
          this.portrait
            ? ((this.mx = this.calibrateX ? e : this.iy),
              (this.my = this.calibrateY ? t : this.ix))
            : ((this.mx = this.calibrateX ? t : this.ix),
              (this.my = this.calibrateY ? e : this.iy)),
          (this.mx *= this.ew * (this.scalarX / 100)),
          (this.my *= this.eh * (this.scalarY / 100)),
          isNaN(parseFloat(this.limitX)) ||
            (this.mx = this.clamp(this.mx, -this.limitX, this.limitX)),
          isNaN(parseFloat(this.limitY)) ||
            (this.my = this.clamp(this.my, -this.limitY, this.limitY)),
          (this.vx += (this.mx - this.vx) * this.frictionX),
          (this.vy += (this.my - this.vy) * this.frictionY);
        for (var i = 0, o = this.$layers.length; i < o; i++) {
          var s = this.depthsX[i],
            n = this.depthsY[i],
            r = this.$layers[i],
            a = this.vx * (s * (this.invertX ? -1 : 1)),
            h = this.vy * (n * (this.invertY ? -1 : 1));
          this.setPosition(r, a, h);
        }
        this.raf = requestAnimationFrame(this.onAnimationFrame);
      }),
      (r.prototype.onDeviceOrientation = function (t) {
        if (!this.desktop && null !== t.beta && null !== t.gamma) {
          this.orientationStatus = 1;
          var i = (t.beta || 0) / 30,
            o = (t.gamma || 0) / 30,
            s = e.innerHeight > e.innerWidth;
          this.portrait !== s &&
            ((this.portrait = s), (this.calibrationFlag = !0)),
            this.calibrationFlag &&
              ((this.calibrationFlag = !1), (this.cx = i), (this.cy = o)),
            (this.ix = i),
            (this.iy = o);
        }
      }),
      (r.prototype.onMouseMove = function (t) {
        var e = t.clientX,
          i = t.clientY;
        !this.orientationSupport && this.relativeInput
          ? (this.clipRelativeInput &&
              ((e = Math.max(e, this.ex)),
              (e = Math.min(e, this.ex + this.ew)),
              (i = Math.max(i, this.ey)),
              (i = Math.min(i, this.ey + this.eh))),
            (this.ix = (e - this.ex - this.ecx) / this.erx),
            (this.iy = (i - this.ey - this.ecy) / this.ery))
          : ((this.ix = (e - this.wcx) / this.wrx),
            (this.iy = (i - this.wcy) / this.wry));
      });
    var a = {
      enable: r.prototype.enable,
      disable: r.prototype.disable,
      updateLayers: r.prototype.updateLayers,
      calibrate: r.prototype.calibrate,
      friction: r.prototype.friction,
      invert: r.prototype.invert,
      scalar: r.prototype.scalar,
      limit: r.prototype.limit,
      origin: r.prototype.origin,
    };
    t.fn[s] = function (e) {
      var i = arguments;
      return this.each(function () {
        var o = t(this),
          n = o.data(s);
        n || ((n = new r(this, e)), o.data(s, n)),
          a[e] && n[e].apply(n, Array.prototype.slice.call(i, 1));
      });
    };
  })(window.jQuery || window.Zepto, window, document),
  (function (t) {
    t.fn.visible = function (e, i, o, s) {
      if (!(this.length < 1)) {
        var n = this.length > 1 ? this.eq(0) : this,
          r = null != s,
          a = t(r ? s : window),
          h = r ? a.position() : 0,
          l = n.get(0),
          p = a.outerWidth(),
          c = a.outerHeight(),
          d = ((o = o || "both"), !0 !== i || l.offsetWidth * l.offsetHeight);
        if ("function" == typeof l.getBoundingClientRect) {
          var u = l.getBoundingClientRect(),
            m = r
              ? u.top - h.top >= 0 && u.top < c + h.top
              : u.top >= 0 && u.top < c,
            f = r
              ? u.bottom - h.top > 0 && u.bottom <= c + h.top
              : u.bottom > 0 && u.bottom <= c,
            g = r
              ? u.left - h.left >= 0 && u.left < p + h.left
              : u.left >= 0 && u.left < p,
            w = r
              ? u.right - h.left > 0 && u.right < p + h.left
              : u.right > 0 && u.right <= p,
            v = e ? m || f : m && f,
            y = e ? g || w : g && w;
          if ("both" === o) return d && v && y;
          if ("vertical" === o) return d && v;
          if ("horizontal" === o) return d && y;
        } else {
          var z = r ? 0 : h,
            x = z + c,
            b = a.scrollLeft(),
            _ = b + p,
            C = n.position(),
            T = C.top,
            W = T + n.height(),
            S = C.left,
            L = S + n.width(),
            k = !0 === e ? W : T,
            $ = !0 === e ? T : W,
            H = !0 === e ? L : S,
            I = !0 === e ? S : L;
          if ("both" === o) return !!d && $ <= x && k >= z && I <= _ && H >= b;
          if ("vertical" === o) return !!d && $ <= x && k >= z;
          if ("horizontal" === o) return !!d && I <= _ && H >= b;
        }
      }
    };
  })(jQuery),
  function (t, e) {
    "use strict";
    t = t || {};
    var i = function (t, e) {
      return this.initialize(t, e);
    };
    (i.defaults = {
      startPos: "top",
      speed: 3,
      horizontal: !1,
      transition: !1,
      transitionDelay: 0,
      transitionDuration: 500,
    }),
      (i.prototype = {
        initialize: function (t, e) {
          return (
            t.data("__floatElement") ||
              ((this.$el = t), this.setData().setOptions(e).build()),
            this
          );
        },
        setData: function () {
          return this.$el.data("__floatElement", this), this;
        },
        setOptions: function (t) {
          return (
            (this.options = e.extend(!0, {}, i.defaults, t, {
              wrapper: this.$el,
            })),
            this
          );
        },
        build: function () {
          var t,
            i = this,
            o = this.options.wrapper,
            s = e(window);
          return (
            i.options.style && o.attr("style", i.options.style),
            s.width() > 767 &&
              ("none" == i.options.startPos
                ? (t = "")
                : "top" == i.options.startPos
                ? (o.css({ top: 0 }), (t = ""))
                : (o.css({ bottom: 0 }), (t = "-")),
              i.options.transition &&
                o.css({
                  transition:
                    "ease-out transform " +
                    i.options.transitionDuration +
                    "ms " +
                    i.options.transitionDelay +
                    "ms",
                }),
              i.movement(t),
              window.addEventListener(
                "scroll",
                function () {
                  i.movement(t);
                },
                { passive: !0 }
              )),
            this
          );
        },
        movement: function (t) {
          var i = this.options.wrapper,
            o = e(window),
            s = o.scrollTop(),
            n = (100 * (i.offset().top - s)) / o.height();
          i.visible(!0) &&
            (this.options.horizontal
              ? i.css({
                  transform:
                    "translate3d(" +
                    t +
                    n / this.options.speed +
                    "%, " +
                    t +
                    n / this.options.speed +
                    "%, 0)",
                })
              : i.css({
                  transform:
                    "translate3d(0, " + t + n / this.options.speed + "%, 0)",
                }));
        },
      }),
      e.extend(t, { PluginFloatElement: i }),
      (e.fn.themePluginFloatElement = function (t) {
        return this.map(function () {
          var o = e(this);
          return o.data("__floatElement")
            ? o.data("__floatElement")
            : new i(o, t);
        });
      });
  }.apply(this, [window.theme, jQuery]),
  function (t, e) {
    t = t || {};
    var i = function (t, e) {
      return this.initialize(t, e);
    };
    (i.defaults = { delay: 2e3 }),
      (i.prototype = {
        initialize: function (t, e) {
          return (
            t.data("__wordRotator") ||
              ((this.$el = t), this.setData().setOptions(e).build()),
            this
          );
        },
        setData: function () {
          return this.$el.data("__wordRotator", this), this;
        },
        setOptions: function (t) {
          return (
            (this.options = e.extend(!0, {}, i.defaults, t, {
              wrapper: this.$el,
            })),
            this
          );
        },
        build: function () {
          var t = this.options.wrapper,
            e = t.find(".wort-rotator-items"),
            i = e.find("> span"),
            o = i.eq(0),
            s = o.clone(),
            n = o.height(),
            r = 1,
            a = 0;
          return (
            console.log("wird", e),
            e.append(s),
            t.height(n).addClass("active"),
            setInterval(function () {
              (a = r * n),
                e.animate({ top: -a + "px" }, 300, function () {
                  ++r > i.length && (e.css("top", 0), (r = 1));
                });
            }, this.options.delay),
            this
          );
        },
      }),
      e.extend(t, { PluginWordRotator: i }),
      (e.fn.themePluginWordRotator = function (t) {
        return this.each(function () {
          var o = e(this);
          return o.data("__wordRotator")
            ? o.data("__wordRotator")
            : new i(o, t);
        });
      });
  }.apply(this, [window.theme, jQuery]);
