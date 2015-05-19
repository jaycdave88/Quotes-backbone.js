/*!
  backgrid
  http://github.com/wyuenho/backgrid

  Copyright (c) 2014 Jimmy Yuen Ho Wong and contributors <wyuenho@gmail.com>
  Licensed under the MIT license.
*/
! function(a) {
    "object" == typeof exports ? module.exports = a(module.exports, require("underscore"), require("backbone")) : a(this, this._, this.Backbone)
}(function(a, b, c) {
    "use strict";

    function d(a, b, c) {
        var d = b - (a + "").length;
        d = 0 > d ? 0 : d;
        for (var e = "", f = 0; d > f; f++) e += c;
        return e + a
    }
    var e = "  \n\f\r   ᠎             　\u2028\u2029﻿";
    if (!String.prototype.trim || e.trim()) {
        e = "[" + e + "]";
        var f = new RegExp("^" + e + e + "*"),
            g = new RegExp(e + e + "*$");
        String.prototype.trim = function() {
            if (void 0 === this || null === this) throw new TypeError("can't convert " + this + " to object");
            return String(this).replace(f, "").replace(g, "")
        }
    }
    var h = c.$,
        i = a.Backgrid = {
            Extension: {},
            resolveNameToClass: function(a, c) {
                if (b.isString(a)) {
                    var d = b.map(a.split("-"), function(a) {
                            return a.slice(0, 1).toUpperCase() + a.slice(1)
                        }).join("") + c,
                        e = i[d] || i.Extension[d];
                    if (b.isUndefined(e)) throw new ReferenceError("Class '" + d + "' not found");
                    return e
                }
                return a
            },
            callByNeed: function() {
                var a = arguments[0];
                if (!b.isFunction(a)) return a;
                var c = arguments[1],
                    d = [].slice.call(arguments, 2);
                return a.apply(c, d + "" ? d : [])
            }
        };
    b.extend(i, c.Events);
    var j = i.Command = function(a) {
        b.extend(this, {
            altKey: !!a.altKey,
            "char": a["char"],
            charCode: a.charCode,
            ctrlKey: !!a.ctrlKey,
            key: a.key,
            keyCode: a.keyCode,
            locale: a.locale,
            location: a.location,
            metaKey: !!a.metaKey,
            repeat: !!a.repeat,
            shiftKey: !!a.shiftKey,
            which: a.which
        })
    };
    b.extend(j.prototype, {
        moveUp: function() {
            return 38 == this.keyCode
        },
        moveDown: function() {
            return 40 === this.keyCode
        },
        moveLeft: function() {
            return this.shiftKey && 9 === this.keyCode
        },
        moveRight: function() {
            return !this.shiftKey && 9 === this.keyCode
        },
        save: function() {
            return 13 === this.keyCode
        },
        cancel: function() {
            return 27 === this.keyCode
        },
        passThru: function() {
            return !(this.moveUp() || this.moveDown() || this.moveLeft() || this.moveRight() || this.save() || this.cancel())
        }
    });
    var k = i.CellFormatter = function() {};
    b.extend(k.prototype, {
        fromRaw: function(a) {
            return a
        },
        toRaw: function(a) {
            return a
        }
    });
    var l = i.NumberFormatter = function(a) {
        if (b.extend(this, this.defaults, a || {}), this.decimals < 0 || this.decimals > 20) throw new RangeError("decimals must be between 0 and 20")
    };
    l.prototype = new k, b.extend(l.prototype, {
        defaults: {
            decimals: 2,
            decimalSeparator: ".",
            orderSeparator: ","
        },
        HUMANIZED_NUM_RE: /(\d)(?=(?:\d{3})+$)/g,
        fromRaw: function(a) {
            if (b.isNull(a) || b.isUndefined(a)) return "";
            a = a.toFixed(~~this.decimals);
            var c = a.split("."),
                d = c[0],
                e = c[1] ? (this.decimalSeparator || ".") + c[1] : "";
            return d.replace(this.HUMANIZED_NUM_RE, "$1" + this.orderSeparator) + e
        },
        toRaw: function(a) {
            if (a = a.trim(), "" === a) return null;
            for (var c = "", d = a.split(this.orderSeparator), e = 0; e < d.length; e++) c += d[e];
            var f = c.split(this.decimalSeparator);
            c = "";
            for (var e = 0; e < f.length; e++) c = c + f[e] + ".";
            "." === c[c.length - 1] && (c = c.slice(0, c.length - 1));
            var g = 1 * (1 * c).toFixed(~~this.decimals);
            return b.isNumber(g) && !b.isNaN(g) ? g : void 0
        }
    });
    var m = i.PercentFormatter = function() {
        i.NumberFormatter.apply(this, arguments)
    };
    m.prototype = new i.NumberFormatter, b.extend(m.prototype, {
        defaults: b.extend({}, l.prototype.defaults, {
            multiplier: 1,
            symbol: "%"
        }),
        fromRaw: function(a) {
            var b = [].slice.call(arguments, 1);
            return b.unshift(a * this.multiplier), (l.prototype.fromRaw.apply(this, b) || "0") + this.symbol
        },
        toRaw: function(a) {
            var c = a.split(this.symbol);
            if (c && c[0] && "" === c[1] || null == c[1]) {
                var d = l.prototype.toRaw.call(this, c[0]);
                return b.isUndefined(d) ? d : d / this.multiplier
            }
        }
    });
    var n = i.DatetimeFormatter = function(a) {
        if (b.extend(this, this.defaults, a || {}), !this.includeDate && !this.includeTime) throw new Error("Either includeDate or includeTime must be true")
    };
    n.prototype = new k, b.extend(n.prototype, {
        defaults: {
            includeDate: !0,
            includeTime: !0,
            includeMilli: !1
        },
        DATE_RE: /^([+\-]?\d{4})-(\d{2})-(\d{2})$/,
        TIME_RE: /^(\d{2}):(\d{2}):(\d{2})(\.(\d{3}))?$/,
        ISO_SPLITTER_RE: /T|Z| +/,
        _convert: function(a, c) {
            if ("" === (a + "").trim()) return null;
            var e, f = null;
            if (b.isNumber(a)) {
                var g = new Date(a);
                e = d(g.getUTCFullYear(), 4, 0) + "-" + d(g.getUTCMonth() + 1, 2, 0) + "-" + d(g.getUTCDate(), 2, 0), f = d(g.getUTCHours(), 2, 0) + ":" + d(g.getUTCMinutes(), 2, 0) + ":" + d(g.getUTCSeconds(), 2, 0)
            } else {
                a = a.trim();
                var h = a.split(this.ISO_SPLITTER_RE) || [];
                e = this.DATE_RE.test(h[0]) ? h[0] : "", f = e && h[1] ? h[1] : this.TIME_RE.test(h[0]) ? h[0] : ""
            }
            var i = this.DATE_RE.exec(e) || [],
                j = this.TIME_RE.exec(f) || [];
            if (c) {
                if (this.includeDate && b.isUndefined(i[0])) return;
                if (this.includeTime && b.isUndefined(j[0])) return;
                if (!this.includeDate && e) return;
                if (!this.includeTime && f) return
            }
            var g = new Date(Date.UTC(1 * i[1] || 0, 1 * i[2] - 1 || 0, 1 * i[3] || 0, 1 * j[1] || null, 1 * j[2] || null, 1 * j[3] || null, 1 * j[5] || null)),
                k = "";
            return this.includeDate && (k = d(g.getUTCFullYear(), 4, 0) + "-" + d(g.getUTCMonth() + 1, 2, 0) + "-" + d(g.getUTCDate(), 2, 0)), this.includeTime && (k = k + (this.includeDate ? "T" : "") + d(g.getUTCHours(), 2, 0) + ":" + d(g.getUTCMinutes(), 2, 0) + ":" + d(g.getUTCSeconds(), 2, 0), this.includeMilli && (k = k + "." + d(g.getUTCMilliseconds(), 3, 0))), this.includeDate && this.includeTime && (k += "Z"), k
        },
        fromRaw: function(a) {
            return b.isNull(a) || b.isUndefined(a) ? "" : this._convert(a)
        },
        toRaw: function(a) {
            return this._convert(a, !0)
        }
    });
    var o = i.StringFormatter = function() {};
    o.prototype = new k, b.extend(o.prototype, {
        fromRaw: function(a) {
            return b.isUndefined(a) || b.isNull(a) ? "" : a + ""
        }
    });
    var p = i.EmailFormatter = function() {};
    p.prototype = new k, b.extend(p.prototype, {
        toRaw: function(a) {
            var c = a.trim().split("@");
            return 2 === c.length && b.all(c) ? a : void 0
        }
    });
    var q = i.SelectFormatter = function() {};
    q.prototype = new k, b.extend(q.prototype, {
        fromRaw: function(a) {
            return b.isArray(a) ? a : null != a ? [a] : []
        }
    });
    var r = i.CellEditor = c.View.extend({
            initialize: function(a) {
                this.formatter = a.formatter, this.column = a.column, this.column instanceof C || (this.column = new C(this.column)), this.listenTo(this.model, "backgrid:editing", this.postRender)
            },
            postRender: function(a, b) {
                return (null == b || b.get("name") == this.column.get("name")) && this.$el.focus(), this
            }
        }),
        s = i.InputCellEditor = r.extend({
            tagName: "input",
            attributes: {
                type: "text"
            },
            events: {
                blur: "saveOrCancel",
                keydown: "saveOrCancel"
            },
            initialize: function(a) {
                s.__super__.initialize.apply(this, arguments), a.placeholder && this.$el.attr("placeholder", a.placeholder)
            },
            render: function() {
                var a = this.model;
                return this.$el.val(this.formatter.fromRaw(a.get(this.column.get("name")), a)), this
            },
            saveOrCancel: function(a) {
                var c = this.formatter,
                    d = this.model,
                    e = this.column,
                    f = new j(a),
                    g = "blur" === a.type;
                if (f.moveUp() || f.moveDown() || f.moveLeft() || f.moveRight() || f.save() || g) {
                    a.preventDefault(), a.stopPropagation();
                    var h = this.$el.val(),
                        i = c.toRaw(h, d);
                    b.isUndefined(i) ? d.trigger("backgrid:error", d, e, h) : (d.set(e.get("name"), i), d.trigger("backgrid:edited", d, e, f))
                } else f.cancel() && (a.stopPropagation(), d.trigger("backgrid:edited", d, e, f))
            },
            postRender: function(a, b) {
                if (null == b || b.get("name") == this.column.get("name"))
                    if ("right" === this.$el.css("text-align")) {
                        var c = this.$el.val();
                        this.$el.focus().val(null).val(c)
                    } else this.$el.focus();
                return this
            }
        }),
        t = i.Cell = c.View.extend({
            tagName: "td",
            formatter: k,
            editor: s,
            events: {
                click: "enterEditMode"
            },
            initialize: function(a) {
                this.column = a.column, this.column instanceof C || (this.column = new C(this.column));
                var c = this.column,
                    d = this.model,
                    e = this.$el,
                    f = i.resolveNameToClass(c.get("formatter") || this.formatter, "Formatter");
                b.isFunction(f.fromRaw) || b.isFunction(f.toRaw) || (f = new f), this.formatter = f, this.editor = i.resolveNameToClass(this.editor, "CellEditor"), this.listenTo(d, "change:" + c.get("name"), function() {
                    e.hasClass("editor") || this.render()
                }), this.listenTo(d, "backgrid:error", this.renderError), this.listenTo(c, "change:editable change:sortable change:renderable", function(a) {
                    var b = a.changedAttributes();
                    for (var c in b) b.hasOwnProperty(c) && e.toggleClass(c, b[c])
                }), i.callByNeed(c.editable(), c, d) && e.addClass("editable"), i.callByNeed(c.sortable(), c, d) && e.addClass("sortable"), i.callByNeed(c.renderable(), c, d) && e.addClass("renderable")
            },
            render: function() {
                this.$el.empty();
                var a = this.model;
                return this.$el.text(this.formatter.fromRaw(a.get(this.column.get("name")), a)), this.delegateEvents(), this
            },
            enterEditMode: function() {
                var a = this.model,
                    b = this.column,
                    c = i.callByNeed(b.editable(), b, a);
                c && (this.currentEditor = new this.editor({
                    column: this.column,
                    model: this.model,
                    formatter: this.formatter
                }), a.trigger("backgrid:edit", a, b, this, this.currentEditor), this.undelegateEvents(), this.$el.empty(), this.$el.append(this.currentEditor.$el), this.currentEditor.render(), this.$el.addClass("editor"), a.trigger("backgrid:editing", a, b, this, this.currentEditor))
            },
            renderError: function(a, b) {
                (null == b || b.get("name") == this.column.get("name")) && this.$el.addClass("error")
            },
            exitEditMode: function() {
                this.$el.removeClass("error"), this.currentEditor.remove(), this.stopListening(this.currentEditor), delete this.currentEditor, this.$el.removeClass("editor"), this.render()
            },
            remove: function() {
                return this.currentEditor && (this.currentEditor.remove.apply(this.currentEditor, arguments), delete this.currentEditor), t.__super__.remove.apply(this, arguments)
            }
        }),
        u = i.StringCell = t.extend({
            className: "string-cell",
            formatter: o
        }),
        v = i.UriCell = t.extend({
            className: "uri-cell",
            title: null,
            target: "_blank",
            initialize: function(a) {
                v.__super__.initialize.apply(this, arguments), this.title = a.title || this.title, this.target = a.target || this.target
            },
            render: function() {
                this.$el.empty();
                var a = this.model.get(this.column.get("name")),
                    b = this.formatter.fromRaw(a, this.model);
                return this.$el.append(h("<a>", {
                    tabIndex: -1,
                    href: a,
                    title: this.title || b,
                    target: this.target
                }).text(b)), this.delegateEvents(), this
            }
        }),
        w = (i.EmailCell = u.extend({
            className: "email-cell",
            formatter: p,
            render: function() {
                this.$el.empty();
                var a = this.model,
                    b = this.formatter.fromRaw(a.get(this.column.get("name")), a);
                return this.$el.append(h("<a>", {
                    tabIndex: -1,
                    href: "mailto:" + b,
                    title: b
                }).text(b)), this.delegateEvents(), this
            }
        }), i.NumberCell = t.extend({
            className: "number-cell",
            decimals: l.prototype.defaults.decimals,
            decimalSeparator: l.prototype.defaults.decimalSeparator,
            orderSeparator: l.prototype.defaults.orderSeparator,
            formatter: l,
            initialize: function() {
                w.__super__.initialize.apply(this, arguments);
                var a = this.formatter;
                a.decimals = this.decimals, a.decimalSeparator = this.decimalSeparator, a.orderSeparator = this.orderSeparator
            }
        })),
        x = (i.IntegerCell = w.extend({
            className: "integer-cell",
            decimals: 0
        }), i.PercentCell = w.extend({
            className: "percent-cell",
            multiplier: m.prototype.defaults.multiplier,
            symbol: m.prototype.defaults.symbol,
            formatter: m,
            initialize: function() {
                x.__super__.initialize.apply(this, arguments);
                var a = this.formatter;
                a.multiplier = this.multiplier, a.symbol = this.symbol
            }
        })),
        y = i.DatetimeCell = t.extend({
            className: "datetime-cell",
            includeDate: n.prototype.defaults.includeDate,
            includeTime: n.prototype.defaults.includeTime,
            includeMilli: n.prototype.defaults.includeMilli,
            formatter: n,
            initialize: function() {
                y.__super__.initialize.apply(this, arguments);
                var a = this.formatter;
                a.includeDate = this.includeDate, a.includeTime = this.includeTime, a.includeMilli = this.includeMilli;
                var c = this.includeDate ? "YYYY-MM-DD" : "";
                c += this.includeDate && this.includeTime ? "T" : "", c += this.includeTime ? "HH:mm:ss" : "", c += this.includeTime && this.includeMilli ? ".SSS" : "", this.editor = this.editor.extend({
                    attributes: b.extend({}, this.editor.prototype.attributes, this.editor.attributes, {
                        placeholder: c
                    })
                })
            }
        }),
        z = (i.DateCell = y.extend({
            className: "date-cell",
            includeTime: !1
        }), i.TimeCell = y.extend({
            className: "time-cell",
            includeDate: !1
        }), i.BooleanCellEditor = r.extend({
            tagName: "input",
            attributes: {
                tabIndex: -1,
                type: "checkbox"
            },
            events: {
                mousedown: function() {
                    this.mouseDown = !0
                },
                blur: "enterOrExitEditMode",
                mouseup: function() {
                    this.mouseDown = !1
                },
                change: "saveOrCancel",
                keydown: "saveOrCancel"
            },
            render: function() {
                var a = this.model,
                    b = this.formatter.fromRaw(a.get(this.column.get("name")), a);
                return this.$el.prop("checked", b), this
            },
            enterOrExitEditMode: function(a) {
                if (!this.mouseDown) {
                    var b = this.model;
                    b.trigger("backgrid:edited", b, this.column, new j(a))
                }
            },
            saveOrCancel: function(a) {
                var b = this.model,
                    c = this.column,
                    d = this.formatter,
                    e = new j(a);
                if (e.passThru() && "change" != a.type) return !0;
                e.cancel() && (a.stopPropagation(), b.trigger("backgrid:edited", b, c, e));
                var f = this.$el;
                if (e.save() || e.moveLeft() || e.moveRight() || e.moveUp() || e.moveDown()) {
                    a.preventDefault(), a.stopPropagation();
                    var g = d.toRaw(f.prop("checked"), b);
                    b.set(c.get("name"), g), b.trigger("backgrid:edited", b, c, e)
                } else if ("change" == a.type) {
                    var g = d.toRaw(f.prop("checked"), b);
                    b.set(c.get("name"), g), f.focus()
                }
            }
        })),
        A = (i.BooleanCell = t.extend({
            className: "boolean-cell",
            editor: z,
            events: {
                click: "enterEditMode"
            },
            render: function() {
                this.$el.empty();
                var a = this.model,
                    b = this.column,
                    c = i.callByNeed(b.editable(), b, a);
                return this.$el.append(h("<input>", {
                    tabIndex: -1,
                    type: "checkbox",
                    checked: this.formatter.fromRaw(a.get(b.get("name")), a),
                    disabled: !c
                })), this.delegateEvents(), this
            }
        }), i.SelectCellEditor = r.extend({
            tagName: "select",
            events: {
                change: "save",
                blur: "close",
                keydown: "close"
            },
            template: b.template('<option value="<%- value %>" <%= selected ? \'selected="selected"\' : "" %>><%- text %></option>', null, {
                variable: null
            }),
            setOptionValues: function(a) {
                this.optionValues = a, this.optionValues = b.result(this, "optionValues")
            },
            setMultiple: function(a) {
                this.multiple = a, this.$el.prop("multiple", a)
            },
            _renderOptions: function(a, c) {
                for (var d = "", e = 0; e < a.length; e++) d += this.template({
                    text: a[e][0],
                    value: a[e][1],
                    selected: b.indexOf(c, a[e][1]) > -1
                });
                return d
            },
            render: function() {
                this.$el.empty();
                var a = b.result(this, "optionValues"),
                    c = this.model,
                    d = this.formatter.fromRaw(c.get(this.column.get("name")), c);
                if (!b.isArray(a)) throw new TypeError("optionValues must be an array");
                for (var e = null, f = null, e = null, g = null, i = null, j = 0; j < a.length; j++) {
                    var e = a[j];
                    if (b.isArray(e)) f = e[0], e = e[1], this.$el.append(this.template({
                        text: f,
                        value: e,
                        selected: b.indexOf(d, e) > -1
                    }));
                    else {
                        if (!b.isObject(e)) throw new TypeError("optionValues elements must be a name-value pair or an object hash of { name: 'optgroup label', value: [option name-value pairs] }");
                        g = e.name, i = h("<optgroup></optgroup>", {
                            label: g
                        }), i.append(this._renderOptions.call(this, e.values, d)), this.$el.append(i)
                    }
                }
                return this.delegateEvents(), this
            },
            save: function() {
                var a = this.model,
                    b = this.column;
                a.set(b.get("name"), this.formatter.toRaw(this.$el.val(), a))
            },
            close: function(a) {
                var b = this.model,
                    c = this.column,
                    d = new j(a);
                d.cancel() ? (a.stopPropagation(), b.trigger("backgrid:edited", b, c, new j(a))) : (d.save() || d.moveLeft() || d.moveRight() || d.moveUp() || d.moveDown() || "blur" == a.type) && (a.preventDefault(), a.stopPropagation(), this.save(a), b.trigger("backgrid:edited", b, c, new j(a)))
            }
        })),
        B = i.SelectCell = t.extend({
            className: "select-cell",
            editor: A,
            multiple: !1,
            formatter: q,
            optionValues: void 0,
            delimiter: ", ",
            initialize: function() {
                B.__super__.initialize.apply(this, arguments), this.listenTo(this.model, "backgrid:edit", function(a, b, c, d) {
                    b.get("name") == this.column.get("name") && (d.setOptionValues(this.optionValues), d.setMultiple(this.multiple))
                })
            },
            render: function() {
                this.$el.empty();
                var a = b.result(this, "optionValues"),
                    c = this.model,
                    d = this.formatter.fromRaw(c.get(this.column.get("name")), c),
                    e = [];
                try {
                    if (!b.isArray(a) || b.isEmpty(a)) throw new TypeError;
                    for (var f = 0; f < d.length; f++)
                        for (var g = d[f], h = 0; h < a.length; h++) {
                            var i = a[h];
                            if (b.isArray(i)) {
                                var j = i[0],
                                    i = i[1];
                                i == g && e.push(j)
                            } else {
                                if (!b.isObject(i)) throw new TypeError;
                                for (var k = i.values, l = 0; l < k.length; l++) {
                                    var m = k[l];
                                    m[1] == g && e.push(m[0])
                                }
                            }
                        }
                    this.$el.append(e.join(this.delimiter))
                } catch (n) {
                    if (n instanceof TypeError) throw new TypeError("'optionValues' must be of type {Array.<Array>|Array.<{name: string, values: Array.<Array>}>}");
                    throw n
                }
                return this.delegateEvents(), this
            }
        }),
        C = i.Column = c.Model.extend({
            defaults: {
                name: void 0,
                label: void 0,
                sortable: !0,
                editable: !0,
                renderable: !0,
                formatter: void 0,
                sortType: "cycle",
                sortValue: void 0,
                direction: null,
                cell: void 0,
                headerCell: void 0
            },
            initialize: function() {
                this.has("label") || this.set({
                    label: this.get("name")
                }, {
                    silent: !0
                });
                var a = i.resolveNameToClass(this.get("headerCell"), "HeaderCell"),
                    b = i.resolveNameToClass(this.get("cell"), "Cell");
                this.set({
                    cell: b,
                    headerCell: a
                }, {
                    silent: !0
                })
            },
            sortValue: function() {
                var a = this.get("sortValue");
                return b.isString(a) ? this[a] : b.isFunction(a) ? a : function(a, b) {
                    return a.get(b)
                }
            }
        });
    b.each(["sortable", "renderable", "editable"], function(a) {
        C.prototype[a] = function() {
            var c = this.get(a);
            return b.isString(c) ? this[c] : b.isFunction(c) ? c : !!c
        }
    }); {
        var D = i.Columns = c.Collection.extend({
                model: C
            }),
            E = i.Row = c.View.extend({
                tagName: "tr",
                initialize: function(a) {
                    var b = this.columns = a.columns;
                    b instanceof c.Collection || (b = this.columns = new D(b));
                    for (var d = this.cells = [], e = 0; e < b.length; e++) d.push(this.makeCell(b.at(e), a));
                    this.listenTo(b, "add", function(b, c) {
                        var e = c.indexOf(b),
                            f = this.makeCell(b, a);
                        d.splice(e, 0, f);
                        var g = this.$el;
                        0 === e ? g.prepend(f.render().$el) : e === c.length - 1 ? g.append(f.render().$el) : g.children().eq(e).before(f.render().$el)
                    }), this.listenTo(b, "remove", function(a, b, c) {
                        d[c.index].remove(), d.splice(c.index, 1)
                    })
                },
                makeCell: function(a) {
                    return new(a.get("cell"))({
                        column: a,
                        model: this.model
                    })
                },
                render: function() {
                    this.$el.empty();
                    for (var a = document.createDocumentFragment(), b = 0; b < this.cells.length; b++) a.appendChild(this.cells[b].render().el);
                    return this.el.appendChild(a), this.delegateEvents(), this
                },
                remove: function() {
                    for (var a = 0; a < this.cells.length; a++) {
                        var b = this.cells[a];
                        b.remove.apply(b, arguments)
                    }
                    return c.View.prototype.remove.apply(this, arguments)
                }
            }),
            F = i.EmptyRow = c.View.extend({
                tagName: "tr",
                emptyText: null,
                initialize: function(a) {
                    this.emptyText = a.emptyText, this.columns = a.columns
                },
                render: function() {
                    this.$el.empty();
                    var a = document.createElement("td");
                    return a.setAttribute("colspan", this.columns.length), a.appendChild(document.createTextNode(b.result(this, "emptyText"))), this.el.className = "empty", this.el.appendChild(a), this
                }
            }),
            G = i.HeaderCell = c.View.extend({
                tagName: "th",
                events: {
                    "click a": "onClick"
                },
                initialize: function(a) {
                    this.column = a.column, this.column instanceof C || (this.column = new C(this.column));
                    var b = this.column,
                        c = this.collection,
                        d = this.$el;
                    this.listenTo(b, "change:editable change:sortable change:renderable", function(a) {
                        var b = a.changedAttributes();
                        for (var c in b) b.hasOwnProperty(c) && d.toggleClass(c, b[c])
                    }), this.listenTo(b, "change:direction", this.setCellDirection), this.listenTo(b, "change:name change:label", this.render), i.callByNeed(b.editable(), b, c) && d.addClass("editable"), i.callByNeed(b.sortable(), b, c) && d.addClass("sortable"), i.callByNeed(b.renderable(), b, c) && d.addClass("renderable"), this.listenTo(c.fullCollection || c, "sort", this.removeCellDirection)
                },
                removeCellDirection: function() {
                    this.$el.removeClass("ascending").removeClass("descending"), this.column.set("direction", null)
                },
                setCellDirection: function(a, b) {
                    this.$el.removeClass("ascending").removeClass("descending"), a.cid == this.column.cid && this.$el.addClass(b)
                },
                onClick: function(a) {
                    function b(a, b) {
                        "ascending" === d.get("direction") ? e.trigger(f, b, "descending") : "descending" === d.get("direction") ? e.trigger(f, b, null) : e.trigger(f, b, "ascending")
                    }

                    function c(a, b) {
                        "ascending" === d.get("direction") ? e.trigger(f, b, "descending") : e.trigger(f, b, "ascending")
                    }
                    a.preventDefault();
                    var d = this.column,
                        e = this.collection,
                        f = "backgrid:sort",
                        g = i.callByNeed(d.sortable(), d, this.collection);
                    if (g) {
                        var h = d.get("sortType");
                        "toggle" === h ? c(this, d) : b(this, d)
                    }
                },
                render: function() {
                    this.$el.empty();
                    var a, b = this.column,
                        c = i.callByNeed(b.sortable(), b, this.collection);
                    return a = c ? h("<a>").text(b.get("label")).append("<b class='sort-caret'></b>") : document.createTextNode(b.get("label")), this.$el.append(a), this.$el.addClass(b.get("name")), this.$el.addClass(b.get("direction")), this.delegateEvents(), this
                }
            }),
            H = (i.HeaderRow = i.Row.extend({
                requiredOptions: ["columns", "collection"],
                initialize: function() {
                    i.Row.prototype.initialize.apply(this, arguments)
                },
                makeCell: function(a, b) {
                    var c = a.get("headerCell") || b.headerCell || G;
                    return c = new c({
                        column: a,
                        collection: this.collection
                    })
                }
            }), i.Header = c.View.extend({
                tagName: "thead",
                initialize: function(a) {
                    this.columns = a.columns, this.columns instanceof c.Collection || (this.columns = new D(this.columns)), this.row = new i.HeaderRow({
                        columns: this.columns,
                        collection: this.collection
                    })
                },
                render: function() {
                    return this.$el.append(this.row.render().$el), this.delegateEvents(), this
                },
                remove: function() {
                    return this.row.remove.apply(this.row, arguments), c.View.prototype.remove.apply(this, arguments)
                }
            })),
            I = i.Body = c.View.extend({
                tagName: "tbody",
                initialize: function(a) {
                    this.columns = a.columns, this.columns instanceof c.Collection || (this.columns = new D(this.columns)), this.row = a.row || E, this.rows = this.collection.map(function(a) {
                        var b = new this.row({
                            columns: this.columns,
                            model: a
                        });
                        return b
                    }, this), this.emptyText = a.emptyText, this._unshiftEmptyRowMayBe();
                    var b = this.collection;
                    this.listenTo(b, "add", this.insertRow), this.listenTo(b, "remove", this.removeRow), this.listenTo(b, "sort", this.refresh), this.listenTo(b, "reset", this.refresh), this.listenTo(b, "backgrid:sort", this.sort), this.listenTo(b, "backgrid:edited", this.moveToNextCell)
                },
                _unshiftEmptyRowMayBe: function() {
                    0 === this.rows.length && null != this.emptyText && this.rows.unshift(new F({
                        emptyText: this.emptyText,
                        columns: this.columns
                    }))
                },
                insertRow: function(a, b, d) {
                    if (this.rows[0] instanceof F && this.rows.pop().remove(), !(b instanceof c.Collection || d)) return void this.collection.add(a, d = b);
                    var e = new this.row({
                            columns: this.columns,
                            model: a
                        }),
                        f = b.indexOf(a);
                    this.rows.splice(f, 0, e);
                    var g = this.$el,
                        h = g.children(),
                        i = e.render().$el;
                    return f >= h.length ? g.append(i) : h.eq(f).before(i), this
                },
                removeRow: function(a, c, d) {
                    return d ? ((b.isUndefined(d.render) || d.render) && this.rows[d.index].remove(), this.rows.splice(d.index, 1), this._unshiftEmptyRowMayBe(), this) : (this.collection.remove(a, d = c), void this._unshiftEmptyRowMayBe())
                },
                refresh: function() {
                    for (var a = 0; a < this.rows.length; a++) this.rows[a].remove();
                    return this.rows = this.collection.map(function(a) {
                        var b = new this.row({
                            columns: this.columns,
                            model: a
                        });
                        return b
                    }, this), this._unshiftEmptyRowMayBe(), this.render(), this.collection.trigger("backgrid:refresh", this), this
                },
                render: function() {
                    this.$el.empty();
                    for (var a = document.createDocumentFragment(), b = 0; b < this.rows.length; b++) {
                        var c = this.rows[b];
                        a.appendChild(c.render().el)
                    }
                    return this.el.appendChild(a), this.delegateEvents(), this
                },
                remove: function() {
                    for (var a = 0; a < this.rows.length; a++) {
                        var b = this.rows[a];
                        b.remove.apply(b, arguments)
                    }
                    return c.View.prototype.remove.apply(this, arguments)
                },
                sort: function(a, d) {
                    if (!b.contains(["ascending", "descending", null], d)) throw new RangeError('direction must be one of "ascending", "descending" or `null`');
                    b.isString(a) && (a = this.columns.findWhere({
                        name: a
                    }));
                    var e, f = this.collection;
                    e = "ascending" === d ? -1 : "descending" === d ? 1 : null;
                    var g = this.makeComparator(a.get("name"), e, e ? a.sortValue() : function(a) {
                        return 1 * a.cid.replace("c", "")
                    });
                    return c.PageableCollection && f instanceof c.PageableCollection ? (f.setSorting(e && a.get("name"), e, {
                        sortValue: a.sortValue()
                    }), f.fullCollection ? (null == f.fullCollection.comparator && (f.fullCollection.comparator = g), f.fullCollection.sort(), f.trigger("backgrid:sorted", a, d, f)) : f.fetch({
                        reset: !0,
                        success: function() {
                            f.trigger("backgrid:sorted", a, d, f)
                        }
                    })) : (f.comparator = g, f.sort(), f.trigger("backgrid:sorted", a, d, f)), a.set("direction", d), this
                },
                makeComparator: function(a, b, c) {
                    return function(d, e) {
                        var f, g = c(d, a),
                            h = c(e, a);
                        return 1 === b && (f = g, g = h, h = f), g === h ? 0 : h > g ? -1 : 1
                    }
                },
                moveToNextCell: function(a, b, c) {
                    var d, e, f, g, h, j = this.collection.indexOf(a),
                        k = this.columns.indexOf(b);
                    if (this.rows[j].cells[k].exitEditMode(), c.moveUp() || c.moveDown() || c.moveLeft() || c.moveRight() || c.save()) {
                        var l = this.columns.length,
                            m = l * this.collection.length;
                        if (c.moveUp() || c.moveDown()) {
                            g = j + (c.moveUp() ? -1 : 1);
                            var n = this.rows[g];
                            n ? (d = n.cells[k], i.callByNeed(d.column.editable(), d.column, a) && (d.enterEditMode(), a.trigger("backgrid:next", g, k, !1))) : a.trigger("backgrid:next", g, k, !0)
                        } else if (c.moveLeft() || c.moveRight()) {
                            for (var o = c.moveRight(), p = j * l + k + (o ? 1 : -1); p >= 0 && m > p; o ? p++ : p--)
                                if (g = ~~(p / l), h = p - g * l, d = this.rows[g].cells[h], e = i.callByNeed(d.column.renderable(), d.column, d.model), f = i.callByNeed(d.column.editable(), d.column, a), e && f) {
                                    d.enterEditMode(), a.trigger("backgrid:next", g, h, !1);
                                    break
                                }
                            p == m && a.trigger("backgrid:next", ~~(p / l), p - g * l, !0)
                        }
                    }
                    return this
                }
            });
        i.Footer = c.View.extend({
            tagName: "tfoot",
            initialize: function(a) {
                this.columns = a.columns, this.columns instanceof c.Collection || (this.columns = new i.Columns(this.columns))
            }
        }), i.Grid = c.View.extend({
            tagName: "table",
            className: "backgrid",
            header: H,
            body: I,
            footer: null,
            initialize: function(a) {
                a.columns instanceof c.Collection || (a.columns = new D(a.columns)), this.columns = a.columns;
                var d = b.omit(a, ["el", "id", "attributes", "className", "tagName", "events"]);
                this.body = a.body || this.body, this.body = new this.body(d), this.header = a.header || this.header, this.header && (this.header = new this.header(d)), this.footer = a.footer || this.footer, this.footer && (this.footer = new this.footer(d)), this.listenTo(this.columns, "reset", function() {
                    this.header && (this.header = new(this.header.remove().constructor)(d)), this.body = new(this.body.remove().constructor)(d), this.footer && (this.footer = new(this.footer.remove().constructor)(d)), this.render()
                })
            },
            insertRow: function() {
                return this.body.insertRow.apply(this.body, arguments), this
            },
            removeRow: function() {
                return this.body.removeRow.apply(this.body, arguments), this
            },
            insertColumn: function() {
                return this.columns.add.apply(this.columns, arguments), this
            },
            removeColumn: function() {
                return this.columns.remove.apply(this.columns, arguments), this
            },
            sort: function() {
                return this.body.sort.apply(this.body, arguments), this
            },
            render: function() {
                return this.$el.empty(), this.header && this.$el.append(this.header.render().$el), this.footer && this.$el.append(this.footer.render().$el), this.$el.append(this.body.render().$el), this.delegateEvents(), this.trigger("backgrid:rendered", this), this
            },
            remove: function() {
                return this.header && this.header.remove.apply(this.header, arguments), this.body.remove.apply(this.body, arguments), this.footer && this.footer.remove.apply(this.footer, arguments), c.View.prototype.remove.apply(this, arguments)
            }
        })
    }
    return i
});