
define([
	"intern!object",
	"intern/chai!assert",
	"dcl/dcl",
	"delite/register",
	"delite/Widget",
	"delite/Bidi",
	"requirejs-domready/domReady!"
], function (registerSuite, assert, dcl, register, Widget, Bidi) {
	var container, div, input, defaultDir;
	var ltrText = "abc\u05d0\u05d1\u05d2";
	var rtlText = "@#$123\u05d0\u05d1\u05d2abc";
	var neutralText = "@#$!?123";
	var wrappedWithUccText = "\u202b" + ltrText + "\u202c";
	var SimpleWidget, widget;

	registerSuite({
		name: "Bidi",

		setup: function () {
			defaultDir = document.body.dir || document.documentElement.dir || "ltr";
			container = document.createElement("div");
			document.body.appendChild(container);
			div = document.createElement("div");
			container.appendChild(div);
			input = document.createElement("input");
			input.type = "text";
			var BidiWidget = dcl(Widget, Bidi);
			SimpleWidget = register("check-bidi", [HTMLElement, BidiWidget], { });
			widget = new SimpleWidget();
			widget.placeAt(container);
		},

		"getTextDir": function () {
			assert.strictEqual(widget.getTextDir(ltrText), defaultDir, "latin, default");
			widget.textDir = "auto";
			assert.strictEqual(widget.getTextDir(ltrText), "ltr", "latin, auto");
			widget.textDir = "";
			assert.strictEqual(widget.getTextDir(rtlText), defaultDir, "bidi, default");
			widget.textDir = "auto";
			assert.strictEqual(widget.getTextDir(rtlText), "rtl", "bidi, auto");
			widget.textDir = "";
			assert.strictEqual(widget.getTextDir(neutralText), defaultDir, "neutral, default");
			widget.textDir = "auto";
			assert.strictEqual(widget.getTextDir(neutralText), defaultDir, "neutral, auto");
		},
		
		"applyTextDirection": function () {
			widget.textDir = "ltr";
			assert.strictEqual(widget.applyTextDirection(rtlText), "\u202a" + rtlText + "\u202c", "bidi, ltr");
			widget.textDir = "rtl";
			assert.strictEqual(widget.applyTextDirection(ltrText), "\u202b" + ltrText + "\u202c", "latin, rtl");
			widget.textDir = "auto";
			assert.strictEqual(widget.applyTextDirection(rtlText), "\u202b" + rtlText + "\u202c", "bidi, auto");
			assert.strictEqual(widget.applyTextDirection(ltrText), "\u202a" + ltrText + "\u202c", "latin, auto");
			assert.strictEqual(widget.applyTextDirection(neutralText),
					(defaultDir === "rtl" ? "\u202b" : "\u202a") + neutralText + "\u202c", "neutral, auto");
			widget.textDir = "";
			assert.strictEqual(widget.applyTextDirection(wrappedWithUccText), ltrText, "wrapped, default");
		},
		
		"applyTextDir": function () {
			div.innerHTML = rtlText;
			input.value = rtlText;
			widget.textDir = "ltr";
			widget.applyTextDir(div);
			assert.strictEqual(div.dir, widget.textDir, "div, textDir: ltr");
			widget.applyTextDir(input);
			assert.strictEqual(input.dir, widget.textDir, "input, textDir: ltr");
			widget.textDir = "auto";
			widget.applyTextDir(div);
			assert.strictEqual(div.dir, "rtl", "div, textDir: auto");
			widget.applyTextDir(input);
			assert.strictEqual(input.dir, "rtl", "input, textDir: auto");
			widget.textDir = "";
			widget.applyTextDir(div);
			assert.strictEqual(div.dir, defaultDir, "div, textDir: default");
			widget.applyTextDir(input);
			assert.strictEqual(input.dir, defaultDir, "input, textDir: default");
		},
		
		"enforceTextDirWithUcc": function () {
			div.innerHTML = rtlText;
			widget.textDir = "ltr";
			widget.enforceTextDirWithUcc(div);
			assert.strictEqual(div.textContent, "\u202a" + rtlText + "\u202c", "bidi, ltr");
			widget.textDir = "auto";
			widget.enforceTextDirWithUcc(div);
			assert.strictEqual(div.textContent, "\u202b" + rtlText + "\u202c", "bidi, auto");
			div.innerHTML = ltrText;
			widget.textDir = "rtl";
			widget.enforceTextDirWithUcc(div);
			assert.strictEqual(div.textContent, "\u202b" + ltrText + "\u202c", "latin, rtl");
			widget.textDir = "auto";
			widget.enforceTextDirWithUcc(div);
			assert.strictEqual(div.textContent, "\u202a" + ltrText + "\u202c", "latin, auto");
			div.innerHTML = neutralText;
			widget.textDir = "auto";
			widget.enforceTextDirWithUcc(div);
			assert.strictEqual(div.textContent,
					(defaultDir === "rtl" ? "\u202b" : "\u202a") + neutralText + "\u202c", "neutral, auto");
			div.innerHTML = wrappedWithUccText;
			widget.textDir = "";
			widget.enforceTextDirWithUcc(div);
			assert.strictEqual(div.textContent, ltrText, "wrapped, default");
		},

		teardown: function () {
			container.parentNode.removeChild(container);
		}
	});

});
